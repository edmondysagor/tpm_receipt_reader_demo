import flet as ft
import os
import pandas as pd
from paddleocr import PaddleOCR
import requests
import re
from flet import FilePicker, FilePickerResultEvent

# 預設 OCR 模型
ocr = PaddleOCR(
    use_angle_cls=True,
    lang='ch',
    det_model_dir='C:/Users/edmon/.paddleocr/whl/det/ch_PP-OCRv3_det_mobile_infer',
    rec_model_dir='C:/Users/edmon/.paddleocr/whl/rec/ch_PP-OCRv3_rec_mobile_infer',
    cls_model_dir='C:/Users/edmon/.paddleocr/whl/cls/ch_ppocr_mobile_v2.0_cls_infer'
)



API_KEY_FILE = "user_api_key.txt"

def read_saved_api_key():
    if os.path.exists(API_KEY_FILE):
        with open(API_KEY_FILE, "r") as f:
            return f.read().strip()
    return ""

def save_api_key(key):
    with open(API_KEY_FILE, "w") as f:
        f.write(key)

def ocr_image(image_path):
    result = ocr.ocr(image_path, cls=True)
    lines = []
    for line in result[0]:
        text = line[1][0]
        conf = line[1][1]
        if conf > 0.7:
            lines.append(text)
    return "\n".join(lines)

def analyze_text_with_together(api_key, ocr_text):
    url = "https://api.together.ai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
        "messages": [
            {"role": "user", "content": f"請幫我將以下每張收據的 OCR 結果整理成清楚的固定格式，包括：日期、商戶名稱、地址、金額、付款方式，並修正可能錯字。請以繁體中文或英文顯示。日期格式請充一為yyyy-mm-dd，另外有副本既記錄都保留。請以如下格式輸出，每張收據前請用「1. 檔名.jpg」開頭 ：\n\n{ocr_text}"}
        ],
        "temperature": 0.5
    }
    response = requests.post(url, headers=headers, json=data)
    if response.status_code == 200:
        return response.json()["choices"][0]["message"]["content"]
    else:
        return f"❌ 出錯：{response.status_code}\n{response.text}"

def parse_llm_response_to_rows(llm_text):
    rows = []
    current = {}
    lines = llm_text.splitlines()

    for line in lines:
        line = line.strip()
        match = re.match(r"^\d+\.\s+(.+\.(?:jpg|jpeg|png))$", line, re.IGNORECASE)
        if match:
            if current:
                rows.append(current)
            current = {"Filename": match.group(1).strip()}
            continue
        if "日期" in line:
            current["Receipt Date"] = line.split("：", 1)[-1].strip(" *")
        elif "商戶名稱" in line:
            current["Merchant Name"] = line.split("：", 1)[-1].strip(" *")
        elif "地址" in line:
            current["Address"] = line.split("：", 1)[-1].strip(" *")
        elif "金額" in line:
            current["Amount"] = line.split("：", 1)[-1].strip(" *")
        elif "付款方式" in line:
            current["Payment Method"] = line.split("：", 1)[-1].strip(" *")
    if current:
        rows.append(current)
    return rows

def process_all_receipts(folder_path, output_folder, api_key, output_console, progress_bar, progress_text):
    image_files = sorted([f for f in os.listdir(folder_path) if f.lower().endswith((".jpg", ".jpeg", ".png"))])
    ocr_blocks = []
    filenames_used = []
    total = len(image_files)

    for idx, filename in enumerate(image_files):
        full_path = os.path.join(folder_path, filename)
        output_console.controls.append(ft.Text(f"🔍 正在 OCR：{filename}"))
        output_console.update()

        ocr_text = ocr_image(full_path)
        if ocr_text:
            ocr_blocks.append(f"【{filename}】\n{ocr_text}")
            filenames_used.append(filename)

        progress = (idx + 1) / total
        progress_bar.value = progress
        progress_bar.update()
        progress_text.value = f"進度：{int(min(progress, 0.99) * 100)}%"
        progress_text.update()

    if not ocr_blocks:
        print("⚠ 沒有有效圖片可進行 OCR")
        return [], ""

    combined_prompt = "\n\n".join(ocr_blocks)
    print("🤖 傳送至 Together.ai 分析中...")
    result = analyze_text_with_together(api_key, combined_prompt)
    print("📩 LLM 回傳原文如下：\n")
    print(result)

    rows = parse_llm_response_to_rows(result)
    for idx, row in enumerate(rows):
        row["Filename"] = filenames_used[idx] if idx < len(filenames_used) else ""

    df = pd.DataFrame(rows)
    output_path = os.path.join(output_folder, "receipt_master.xlsx")
    df.to_excel(output_path, index=False)
    progress_bar.value = 1.0
    progress_bar.update()
    progress_text.value = "進度：100%"
    progress_text.update()
    output_console.controls.append(ft.Text(f"✅ 結果已儲存：{output_path}"))
    output_console.update()
    return [result], output_path

def main(page: ft.Page):
    folder_picker = FilePicker()
    output_picker = FilePicker()
    progress_bar = ft.ProgressBar(width=400, value=0)
    progress_text = ft.Text("進度：0%", width=100)
    output_console = ft.ListView(height=250, auto_scroll=True)

    def pick_input_folder_result(e: FilePickerResultEvent):
        if e.path:
            folder_input.value = e.path
            page.update()

    def pick_output_folder_result(e: FilePickerResultEvent):
        if e.path:
            output_input.value = e.path
            page.update()

    folder_picker.on_result = pick_input_folder_result
    output_picker.on_result = pick_output_folder_result

    page.title = "OCR 收據辨識工具"
    folder_input = ft.TextField(label="收據圖片資料夾（請手動輸入）", width=400)
    output_input = ft.TextField(label="輸出 Excel 資料夾（請手動輸入）", width=400)
    api_input = ft.TextField(label="API Key（可留空只做 OCR）", password=True, can_reveal_password=True, value=read_saved_api_key())
    llm_output_area = ft.TextField(label="LLM 歸類結果預覽（純文字）", multiline=True, read_only=True, height=250)

    def start_process(e):
        input_path = folder_input.value.strip()
        output_path = output_input.value.strip()
        api_key = api_input.value.strip()

        if not input_path or not output_path:
            output_console.controls.append(ft.Text("❌ 請填寫收據與輸出資料夾路徑"))
            output_console.update()
            return

        save_api_key(api_key)

        result_blocks, master_file_path = process_all_receipts(input_path, output_path, api_key, output_console, progress_bar, progress_text)
        llm_output_area.value = "\n\n".join(result_blocks)
        page.update()

    page.overlay.append(folder_picker)
    page.overlay.append(output_picker)
    page.add(
        ft.Row([
            folder_input,
            ft.ElevatedButton("📂 選擇收據資料夾", on_click=lambda _: folder_picker.get_directory_path()),
        ]),
        ft.Row([
            output_input,
            ft.ElevatedButton("📂 選擇輸出資料夾", on_click=lambda _: output_picker.get_directory_path()),
        ]),
        api_input,
        ft.ElevatedButton("🚀 開始處理", on_click=start_process),
        output_console,
        ft.Row([
            progress_bar,
            progress_text
        ]),
        llm_output_area
    )

ft.app(target=main)