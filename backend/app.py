import base64
import json
import logging
import os
import uuid
import asyncio
from typing import List, Optional, Annotated
from contextlib import asynccontextmanager

from pydantic import BaseModel
from fastapi import FastAPI, UploadFile, File, BackgroundTasks, Header, HTTPException, Request, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, HTMLResponse
from dotenv import load_dotenv
from ollama import Client
import stripe
import fitz  # PyMuPDF
import requests
from PIL import Image
import io

import db
import auth
from auth import get_current_user

load_dotenv()
logging.basicConfig(level=logging.INFO)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database
    try:
        db.init_db()
    except Exception as e:
        logging.error(f"Database initialization error on startup: {e}")
    yield
    # Shutdown logic if needed

app = FastAPI(lifespan=lifespan)

# --- Stripe Configuration ---
stripe.api_key = os.getenv("STRIPE_API_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
STRIPE_PRICE_ID = os.getenv("STRIPE_PRICE_ID", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Auth Schemas ---
class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class GoogleAuthRequest(BaseModel):
    credential: str

# --- Auth Endpoints ---

@app.post("/auth/register")
def register(req: RegisterRequest):
    email = req.email.strip().lower()
    existing = db.get_user_by_email(email)
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    hashed_pwd = auth.hash_password(req.password)
    user = db.create_user(
        email=email,
        password_hash=hashed_pwd,
        full_name=req.full_name,
        auth_provider="local",
        starting_credits=10
    )
    token = auth.create_access_token(user["id"], user["email"], user.get("full_name"))
    credits_balance = db.get_credits(user["id"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user.get("full_name"),
            "avatar_url": user.get("avatar_url")
        },
        "credits_balance": credits_balance
    }

@app.post("/auth/login")
def login(req: LoginRequest):
    email = req.email.strip().lower()
    user = db.get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    if not user.get("password_hash") or not auth.verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    token = auth.create_access_token(user["id"], user["email"], user.get("full_name"))
    credits_balance = db.get_credits(user["id"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user.get("full_name"),
            "avatar_url": user.get("avatar_url")
        },
        "credits_balance": credits_balance
    }

@app.post("/auth/google")
def google_auth(req: GoogleAuthRequest):
    try:
        payload = auth.verify_google_credential(req.credential)
        email = payload.get("email", "").strip().lower()
        if not email:
            raise HTTPException(status_code=400, detail="Google token does not contain an email address.")
        
        full_name = payload.get("name") or payload.get("given_name")
        avatar_url = payload.get("picture")

        user = db.get_user_by_email(email)
        if not user:
            user = db.create_user(
                email=email,
                password_hash=None,
                full_name=full_name,
                auth_provider="google",
                avatar_url=avatar_url,
                starting_credits=10
            )
        else:
            # Update user metadata if changed
            if avatar_url and not user.get("avatar_url"):
                db.update_user_profile(user["id"], full_name=full_name, avatar_url=avatar_url)

        token = auth.create_access_token(user["id"], user["email"], full_name or user.get("full_name"))
        credits_balance = db.get_credits(user["id"])

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user["id"],
                "email": user["email"],
                "full_name": full_name or user.get("full_name"),
                "avatar_url": avatar_url or user.get("avatar_url")
            },
            "credits_balance": credits_balance
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Google authentication error: {e}")
        raise HTTPException(status_code=400, detail=f"Authentication failed: {str(e)}")

@app.get("/auth/me")
def get_me(user_id: str = Depends(get_current_user)):
    user = db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    credits_balance = db.get_credits(user_id)
    return {
        "user": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user.get("full_name"),
            "avatar_url": user.get("avatar_url"),
            "auth_provider": user.get("auth_provider")
        },
        "credits_balance": credits_balance
    }

@app.get("/user/credits")
def get_user_credits(user_id: str = Depends(get_current_user)):
    credits_balance = db.get_credits(user_id)
    return {"credits_balance": credits_balance}

@app.get("/")
def read_root():
    return HTMLResponse(content="<h1>Receipt Guard Backend Running</h1>")

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "https://ollama.com")
DEFAULT_MODEL = os.getenv("MODEL_NAME", "gemma4:31b")

AVAILABLE_MODELS = [
    {"id": "gemma4:31b", "name": "Gemma 4 31B", "description": "High accuracy, multimodal AI"},
    {"id": "qwen2.5-vl:72b", "name": "Qwen 2.5 VL 72B", "description": "Cloud vision model"},
    {"id": "qwen2.5-vl:7b", "name": "Qwen 2.5 VL 7B", "description": "Fast lightweight vision model"},
]

jobs = {}

def update_job_progress(job_id: str, progress: int, status: str, result: Optional[dict] = None, error: Optional[str] = None):
    jobs[job_id] = {
        "progress": progress,
        "status": status,
        "result": result,
        "error": error
    }

def call_ollama(images: List[str], model_name: str = None):
    if not model_name:
        model_name = DEFAULT_MODEL
    prompt = """Analyze these receipt/invoice images and extract data. Each image is a SEPARATE document.
IMPORTANT: You MUST output exactly ONE entry in the "data" array for EACH image provided, even if multiple images show the EXACT SAME receipt. Do NOT merge duplicates. If 5 images are provided, there MUST be 5 entries in the output array.

Respond ONLY with a JSON object (no markdown, no text):

{
  "data": [
    {
      "merchant_name": "string",
      "date": "string (YYYY-MM-DD)",
      "total_amount": numeric_value,
      "currency": "string",
      "category": "string",
      "payment_method": "string",
      "summary": "string (10 words or less)",
      "confidence_score": integer (1-100)
    }
  ]
}

Rules:
- `total_amount`: Final total of the receipt.
- `category`: e.g. "Meals & Entertainment", "Office Supplies", "Transport", "Auto Repair".
- `summary`: Brief description, e.g. "和風牛肉丼等餐飲".
- `confidence_score`: Your confidence in the accuracy of the extracted data from 1 to 100.
- If fields are unclear, infer reasonably or use null.
- DO NOT merge or deduplicate identical receipts. Output them as separate entries.
"""
    api_key = os.environ.get('OLLAMA_API_KEY', '')
    client = Client(
        host=OLLAMA_HOST,
        headers={'Authorization': 'Bearer ' + api_key}
    )

    messages = [
      {
        'role': 'user',
        'content': prompt,
        'images': images,
      }
    ]

    response = client.chat(
        model=model_name, 
        messages=messages, 
        stream=False, 
        format='json'
    )
    return {"response": response.get('message', {}).get('content', '')}

BATCH_SIZE = 5

def parse_ollama_response(raw_json_str: str) -> list:
    clean_str = raw_json_str.strip()
    if clean_str.startswith("```json"):
        clean_str = clean_str[7:]
    if clean_str.endswith("```"):
        clean_str = clean_str[:-3]
    clean_str = clean_str.strip()
    
    parsed_data = json.loads(clean_str)
    result = parsed_data.get("data", [])
    if not isinstance(result, list):
        result = [parsed_data]
    return result

MAX_IMAGE_WIDTH = 768
JPEG_QUALITY = 70

def compress_image(img_bytes: bytes) -> bytes:
    img = Image.open(io.BytesIO(img_bytes))
    if img.mode in ('RGBA', 'P', 'LA'):
        img = img.convert('RGB')
    if img.width > MAX_IMAGE_WIDTH:
        ratio = MAX_IMAGE_WIDTH / img.width
        new_size = (MAX_IMAGE_WIDTH, int(img.height * ratio))
        img = img.resize(new_size, Image.LANCZOS)
    output = io.BytesIO()
    img.save(output, format='JPEG', quality=JPEG_QUALITY)
    return output.getvalue()

async def process_document_task(job_id: str, file_paths: List[str], model_name: str = None, user_id: str = None):
    try:
        update_job_progress(job_id, 10, "Extracting & compressing images...")
        
        all_images_base64 = []
        total_original_kb = 0
        total_compressed_kb = 0
        
        for path in file_paths:
            ext = os.path.splitext(path)[1].lower()
            raw_images = []
            
            if ext == '.pdf':
                doc = fitz.open(path)
                for page_num in range(len(doc)):
                    page = doc.load_page(page_num)
                    pix = page.get_pixmap()
                    raw_images.append(pix.tobytes("png"))
            elif ext in ['.png', '.jpg', '.jpeg']:
                with open(path, "rb") as f:
                    raw_images.append(f.read())
            else:
                update_job_progress(job_id, 100, f"Error: Unsupported file type '{ext}'", error=f"Unsupported file type '{ext}'")
                return
            
            for raw_data in raw_images:
                total_original_kb += len(raw_data) / 1024
                compressed = compress_image(raw_data)
                total_compressed_kb += len(compressed) / 1024
                all_images_base64.append(base64.b64encode(compressed).decode('utf-8'))

        if not all_images_base64:
            update_job_progress(job_id, 100, "Error: No valid images found", error="No valid images found")
            return

        total_images = len(all_images_base64)
        savings_pct = (1 - total_compressed_kb / total_original_kb) * 100 if total_original_kb > 0 else 0
        
        batches = [all_images_base64[i:i + BATCH_SIZE] for i in range(0, total_images, BATCH_SIZE)]
        num_batches = len(batches)
        
        update_job_progress(
            job_id, 20, 
            f"Found {total_images} images. Compressed {total_original_kb:.0f}KB → {total_compressed_kb:.0f}KB ({savings_pct:.0f}% saved). Processing in {num_batches} batch(es)..."
        )

        try:
            all_results = []
            
            for batch_idx, batch_images in enumerate(batches):
                batch_num = batch_idx + 1
                batch_start_pct = 20 + int((batch_idx / num_batches) * 70)
                batch_end_pct = 20 + int(((batch_idx + 1) / num_batches) * 70)
                
                update_job_progress(
                    job_id, batch_start_pct,
                    f"Batch {batch_num}/{num_batches}: Sending {len(batch_images)} image(s) to AI..."
                )
                
                response_data = await asyncio.to_thread(call_ollama, batch_images, model_name)
                raw_json_str = response_data.get("response", "")
                
                update_job_progress(
                    job_id, batch_end_pct - 2,
                    f"Batch {batch_num}/{num_batches}: Parsing AI output..."
                )
                
                batch_results = parse_ollama_response(raw_json_str)
                all_results.extend(batch_results)
                
                update_job_progress(
                    job_id, batch_end_pct,
                    f"Batch {batch_num}/{num_batches}: Done — {len(batch_results)} receipt(s) extracted"
                )
            
            update_job_progress(job_id, 92, f"Finalizing {len(all_results)} receipts...")
            
            # 1. Assign sequential SEQ NO
            for i, item in enumerate(all_results):
                seq_number_str = f"{(i + 1):05d}"
                new_item = {"SEQ NO": seq_number_str}
                new_item.update(item)
                all_results[i] = new_item
            
            # 2. Duplicate Check
            seen = {}
            dup_count = 0
            for i, item in enumerate(all_results):
                key = (
                    str(item.get('merchant_name', '')).strip().lower(),
                    str(item.get('date', '')).strip(),
                    str(item.get('total_amount', '')).strip()
                )
                
                if not key[0] and not key[1] and not key[2]:
                    continue
                    
                if key in seen:
                    all_results[i]['is_duplicate'] = True
                    all_results[i]['duplicate_of'] = seen[key]
                    dup_count += 1
                else:
                    seen[key] = item['SEQ NO']
                    all_results[i]['is_duplicate'] = False
            
            if dup_count > 0:
                logging.info(f"Job {job_id}: Flagged {dup_count} duplicate(s).")
                
            # Post-deduction of credits
            if user_id:
                num_files = len(file_paths)
                try:
                    db.decrement_credits(user_id, num_files)
                    logging.info(f"Job {job_id}: Deducted {num_files} credit(s) for user {user_id}")
                except Exception as credit_err:
                    logging.error(f"Job {job_id}: Failed to deduct credits for user {user_id}: {credit_err}")
            
            update_job_progress(job_id, 100, "Completed", result=all_results)
            
        except requests.exceptions.RequestException as req_err:
            update_job_progress(job_id, 100, "Error communicating with AI Model API", error=str(req_err))
        except json.JSONDecodeError as json_err:
            update_job_progress(job_id, 100, "Failed to parse JSON from AI", error=str(json_err) + " Response was: " + raw_json_str)

    except Exception as e:
        update_job_progress(job_id, 100, "Failed with an internal error", error=str(e))
    finally:
        for path in file_paths:
            try:
                os.remove(path)
            except:
                pass

# --- Stripe Endpoints ---

@app.post("/create-checkout-session")
async def create_checkout_session(user_id: str = Depends(get_current_user)):
    if not stripe.api_key or not STRIPE_PRICE_ID:
        raise HTTPException(status_code=500, detail="Stripe is not configured on the server.")
        
    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price': STRIPE_PRICE_ID,
                    'quantity': 1,
                },
            ],
            mode='payment',
            success_url=f"{FRONTEND_URL}/dashboard?payment=success",
            cancel_url=f"{FRONTEND_URL}/dashboard?payment=cancelled",
            client_reference_id=user_id,
        )
        return {"url": checkout_session.url}
    except Exception as e:
        logging.error(f"Failed to create checkout session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/stripe-webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("Stripe-Signature")
    
    if not sig_header or not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=400, detail="Missing signature or webhook secret")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        user_id = session.get('client_reference_id')
        if user_id:
            try:
                db.increment_credits(user_id, 130)
                logging.info(f"Successfully added 130 credits to user {user_id} via Stripe Checkout.")
            except Exception as e:
                logging.error(f"Stripe Webhook Error: Failed to increment credits for user {user_id}: {e}")
                raise HTTPException(status_code=500, detail="Failed to update database")

    return {"status": "success"}

@app.get("/models")
def list_models():
    return {"models": AVAILABLE_MODELS, "default": DEFAULT_MODEL}

@app.post("/upload")
async def upload_files(
    background_tasks: BackgroundTasks, 
    files: list[UploadFile],
    model: Optional[str] = None,
    user_id: str = Depends(get_current_user)
):
    if not files:
        return {"error": "No files uploaded."}
    
    # Credit pre-check
    try:
        credits_balance = db.get_credits(user_id)
        required_credits = len(files)
        if credits_balance < required_credits:
            raise HTTPException(
                status_code=403,
                detail={
                    "message": f"Your account has insufficient credits. You need {required_credits} credits but only have {credits_balance}. Please top up at the Billing Center.",
                    "error_code": "INSUFFICIENT_CREDITS"
                }
            )
        logging.info(f"Credit check passed for user {user_id}: {credits_balance} remaining, {required_credits} required")
    except HTTPException:
        raise
    except Exception as e:
        logging.warning(f"Credit check warning: {e}")
    
    valid_model_ids = [m["id"] for m in AVAILABLE_MODELS]
    selected_model = model if model and model in valid_model_ids else DEFAULT_MODEL
        
    job_id = str(uuid.uuid4())
    temp_dir = "./temp_uploads"
    os.makedirs(temp_dir, exist_ok=True)
    
    saved_paths = []
    for file in files:
        file_path = os.path.join(temp_dir, f"{job_id}_{file.filename}")
        with open(file_path, "wb") as f:
            f.write(await file.read())
        saved_paths.append(file_path)

    update_job_progress(job_id, 0, f"Upload complete, using model: {selected_model}")
    background_tasks.add_task(process_document_task, job_id, saved_paths, selected_model, user_id)
    
    return {"job_id": job_id, "message": "Files uploaded successfully.", "model": selected_model}

@app.get("/progress/{job_id}")
async def job_progress(job_id: str):
    async def event_generator():
        last_progress = -1
        last_status = ""
        while True:
            job = jobs.get(job_id)
            if not job:
                yield f"data: {json.dumps({'error': 'Job not found', 'progress': 100})}\n\n"
                break
            
            if job["progress"] != last_progress or job["status"] != last_status:
                yield f"data: {json.dumps(job)}\n\n"
                last_progress = job["progress"]
                last_status = job["status"]

            if job["progress"] == 100 or job.get("error"):
                break
            
            await asyncio.sleep(0.5)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
