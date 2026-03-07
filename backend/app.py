import base64
import json
import logging
import os
import uuid
import asyncio
from typing import List, Optional, Annotated
from pydantic import BaseModel

from fastapi import FastAPI, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

import fitz  # PyMuPDF
import requests
from PIL import Image
import io
# Trigger reload
from fastapi.responses import HTMLResponse
from dotenv import load_dotenv
from ollama import Client

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.responses import HTMLResponse

@app.get("/")
def read_root():
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Receipt Reader API Test</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 40px; background: #f8f9fa; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            h1 { color: #333; }
            .btn { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 16px; margin-top: 15px; }
            .btn:hover { background: #0056b3; }
            .btn:disabled { background: #ccc; cursor: not-allowed; }
            .progress-bar-bg { width: 100%; background-color: #e0e0e0; border-radius: 4px; margin-top: 20px; overflow: hidden; display: none; }
            .progress-bar-fill { height: 20px; background-color: #28a745; width: 0%; transition: width 0.3s; }
            .log-box { background: #333; color: #fff; padding: 15px; border-radius: 4px; height: 150px; overflow-y: auto; margin-top: 15px; font-family: monospace; display: none; }
            .result-box { background: #e8f5e9; border: 1px solid #c8e6c9; padding: 15px; border-radius: 4px; margin-top: 15px; display: none; white-space: pre-wrap; font-family: monospace;}
            .error-box { background: #ffebee; border: 1px solid #ffcdd2; color: #b71c1c; padding: 15px; border-radius: 4px; margin-top: 15px; display: none; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Backend Upload & LLM Test</h1>
            <p>Select multiple images or PDFs to test the OCR AI API.</p>
            
            <form id="uploadForm">
                <input id="fileInput" name="files" type="file" multiple accept="image/*,.pdf" style="font-size: 16px;">
                <br>
                <button type="submit" id="submitBtn" class="btn">Upload & Test AI</button>
            </form>

            <div class="progress-bar-bg" id="progressBarBg">
                <div class="progress-bar-fill" id="progressBarFill"></div>
            </div>

            <div class="log-box" id="logBox"></div>
            <div class="result-box" id="resultBox"></div>
            <div class="error-box" id="errorBox"></div>
        </div>

        <script>
            const form = document.getElementById('uploadForm');
            const fileInput = document.getElementById('fileInput');
            const submitBtn = document.getElementById('submitBtn');
            const progressBarBg = document.getElementById('progressBarBg');
            const progressBarFill = document.getElementById('progressBarFill');
            const logBox = document.getElementById('logBox');
            const resultBox = document.getElementById('resultBox');
            const errorBox = document.getElementById('errorBox');

            function logMessage(msg) {
                const p = document.createElement('div');
                p.textContent = `> ${msg}`;
                logBox.appendChild(p);
                logBox.scrollTop = logBox.scrollHeight;
            }

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (fileInput.files.length === 0) {
                    alert('Please select files first.');
                    return;
                }

                // Reset UI
                submitBtn.disabled = true;
                progressBarBg.style.display = 'block';
                progressBarFill.style.width = '0%';
                logBox.style.display = 'block';
                resultBox.style.display = 'none';
                errorBox.style.display = 'none';
                logBox.innerHTML = '';

                logMessage('Uploading files...');

                const formData = new FormData();
                for (let i = 0; i < fileInput.files.length; i++) {
                    formData.append('files', fileInput.files[i]);
                }

                try {
                    const response = await fetch('/upload', {
                        method: 'POST',
                        body: formData
                    });
                    
                    if (!response.ok) throw new Error('Upload failed');
                    
                    const data = await response.json();
                    const jobId = data.job_id;
                    logMessage(`Upload complete! Job ID: ${jobId}`);
                    logMessage('Connecting to AI Processing Stream...');

                    // Start listening to SSE stream
                    const evtSource = new EventSource(`/progress/${jobId}`);
                    
                    evtSource.onmessage = (event) => {
                        const state = JSON.parse(event.data);
                        
                        logMessage(`[${state.progress}%] ${state.status}`);
                        progressBarFill.style.width = `${state.progress}%`;

                        if (state.progress === 100) {
                            evtSource.close(); // Close stream when done
                            submitBtn.disabled = false;
                            
                            if (state.error) {
                                errorBox.style.display = 'block';
                                errorBox.textContent = `Error: ${state.error}`;
                            } else if (state.result) {
                                resultBox.style.display = 'block';
                                resultBox.textContent = JSON.stringify(state.result, null, 2);
                                logMessage('Successfully received parsed JSON from AI!');
                            }
                        }
                    };

                    evtSource.onerror = (err) => {
                        evtSource.close();
                        submitBtn.disabled = false;
                        errorBox.style.display = 'block';
                        errorBox.textContent = 'Lost connection to progress stream.';
                    };

                } catch (err) {
                    submitBtn.disabled = false;
                    errorBox.style.display = 'block';
                    errorBox.textContent = err.message;
                }
            });
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)


OLLAMA_HOST = os.getenv("OLLAMA_HOST", "https://ollama.com")
DEFAULT_MODEL = os.getenv("MODEL_NAME", "qwen3.5:397b-cloud")

# Available models for the frontend selector
AVAILABLE_MODELS = [
    {"id": "qwen3.5:397b-cloud", "name": "Qwen 3.5 397B (Cloud)", "description": "High accuracy, cloud-based"},
    {"id": "qwen3-vl:8b", "name": "Qwen 3 VL 8B (Local)", "description": "Fast, local testing"},
    {"id": "qwen3-vl:4b", "name": "Qwen 3 VL 4B (Local)", "description": "Lightweight, fastest"},
    {"id": "qwen3.5:4b", "name": "Qwen 3.5 4B (Local)", "description": "Compact text model"},
    {"id": "qwen3.5:2b", "name": "Qwen 3.5 2B (Local)", "description": "Ultra-light text model"},
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
    """Call Ollama LLM with the given images using the specified model."""
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
    
    # Initialize Ollama client with host and auth header from environment
    # Ensure api_key is read (default to empty string to avoid None + string concatenation err)
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
    
    # Return formatted to match what the async process loop expects
    return {"response": response.get('message', {}).get('content', '')}


BATCH_SIZE = 5  # Max images per LLM call

def parse_ollama_response(raw_json_str: str) -> list:
    """Parse and clean LLM JSON response into a list of receipt dicts."""
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


# --- Image Compression ---
MAX_IMAGE_WIDTH = 768
JPEG_QUALITY = 70

def compress_image(img_bytes: bytes) -> bytes:
    """Resize image to max width and convert to JPEG to reduce token usage."""
    img = Image.open(io.BytesIO(img_bytes))
    # Convert RGBA/P to RGB for JPEG compatibility
    if img.mode in ('RGBA', 'P', 'LA'):
        img = img.convert('RGB')
    # Resize if wider than max
    if img.width > MAX_IMAGE_WIDTH:
        ratio = MAX_IMAGE_WIDTH / img.width
        new_size = (MAX_IMAGE_WIDTH, int(img.height * ratio))
        img = img.resize(new_size, Image.LANCZOS)
    output = io.BytesIO()
    img.save(output, format='JPEG', quality=JPEG_QUALITY)
    return output.getvalue()


async def process_document_task(job_id: str, file_paths: List[str], model_name: str = None):
    try:
        update_job_progress(job_id, 10, "Extracting & compressing images...")
        
        all_images_base64 = []
        total_original_kb = 0
        total_compressed_kb = 0
        
        for path in file_paths:
            ext = os.path.splitext(path)[1].lower()
            raw_images = []  # collect raw bytes first
            
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
            
            # Compress each image before base64 encoding
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
        
        # Split into batches
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
                # Progress: 20% (extraction done) → 90% (all batches done), split evenly
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
            
            # 1. Assign sequential SEQ NO across all batches first
            for i, item in enumerate(all_results):
                seq_number_str = f"{(i + 1):05d}"
                new_item = {"SEQ NO": seq_number_str}
                new_item.update(item)
                all_results[i] = new_item
            
            # 2. Duplicate Check: Flag instead of remove
            seen = {} # key: (merchant, date, amount) -> value: original SEQ NO
            dup_count = 0
            for i, item in enumerate(all_results):
                key = (
                    str(item.get('merchant_name', '')).strip().lower(),
                    str(item.get('date', '')).strip(),
                    str(item.get('total_amount', '')).strip()
                )
                
                # Assume empty keys are not duplicates of each other to avoid false positives
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
                
            update_job_progress(job_id, 100, "Completed", result=all_results)
            
        except requests.exceptions.RequestException as req_err:
            update_job_progress(job_id, 100, "Error communicating with AI Model API", error=str(req_err))
        except json.JSONDecodeError as json_err:
            update_job_progress(job_id, 100, "Failed to parse JSON from AI", error=str(json_err) + " Response was: " + raw_json_str)

    except Exception as e:
        update_job_progress(job_id, 100, "Failed with an internal error", error=str(e))
    finally:
        # Cleanup uploaded files from temp directory
        for path in file_paths:
            try:
                os.remove(path)
            except:
                pass


@app.get("/models")
def list_models():
    """Return the list of available LLM models for the frontend selector."""
    return {"models": AVAILABLE_MODELS, "default": DEFAULT_MODEL}


@app.post("/upload")
async def upload_files(
    background_tasks: BackgroundTasks, 
    files: list[UploadFile],
    model: Optional[str] = None
):
    if not files:
        return {"error": "No files uploaded."}
    
    # Validate model choice
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
    
    background_tasks.add_task(process_document_task, job_id, saved_paths, selected_model)
    
    return {"job_id": job_id, "message": "Files uploaded successfully.", "model": selected_model}

@app.get("/progress/{job_id}")
async def job_progress(job_id: str):
    """
    Server-Sent Events endpoint to stream progress to frontend.
    Frontend should use EventSource("/progress/{job_id}")
    """
    async def event_generator():
        last_progress = -1
        last_status = ""
        while True:
            job = jobs.get(job_id)
            if not job:
                yield f"data: {json.dumps({'error': 'Job not found', 'progress': 100})}\n\n"
                break
            
            # Only send event if state changed
            if job["progress"] != last_progress or job["status"] != last_status:
                # Need to use json.dumps for SSE data payload
                yield f"data: {json.dumps(job)}\n\n"
                last_progress = job["progress"]
                last_status = job["status"]

            if job["progress"] == 100 or job.get("error"):
                # Done, exit generator (closes SSE connection)
                break
            
            await asyncio.sleep(0.5)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
