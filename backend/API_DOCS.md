# Receipt Reader Backend API Documentation

This document describes the API endpoints provided by the FastAPI backend for the Receipt Reader application.

## Base URL
Local development: `http://localhost:8000`

## 1. Upload Files
Upload one or multiple PDF or image files to be processed by the OCR AI.

- **Endpoint:** `POST /upload`
- **Content-Type:** `multipart/form-data`
- **Body Parameters:**
  - `files` (Required): Array of files (images and PDFs only).

### Success Response (200 OK)
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Files uploaded successfully."
}
```

## 2. Listen to Progress (Server-Sent Events)
Subscribe to the real-time processing progress of a specific job using SSE (Server-Sent Events). The frontend should use the native `EventSource` API for this.

- **Endpoint:** `GET /progress/{job_id}`
- **Response Format:** `text/event-stream`

### SSE Data Payload Example
The stream emits JSON strings in the `data` field of the event stream:
```json
{
  "progress": 40,
  "status": "Found 2 images/pages. Sending to AI for OCR & Analysis...",
  "result": null,
  "error": null
}
```

### Final Event Payload (Success)
When processing is complete, `progress` will be `100` and `result` will contain the parsed array.
```json
{
  "progress": 100,
  "status": "Completed",
  "result": [
    {
      "SEQ NO": "00001",
      "merchant_name": "吉野家",
      "date": "2025-05-08",
      "total_amount": 136.0,
      "currency": "HKD",
      "category": "Meals & Entertainment",
      "payment_method": "Octopus",
      "summary": "和風牛肉丼等餐飲"
    }
  ],
  "error": null
}
```

### Final Event Payload (Error)
If an error occurs, `progress` will be `100` and the `error` field will contain the error message.
```json
{
  "progress": 100,
  "status": "Failed to parse JSON from AI",
  "result": null,
  "error": "Expecting value: line 1 column 1 (char 0)"
}
```

## Integrating in React (Frontend Guide)

Here's an example of how the frontend agent should implement the API calls in React:

```javascript
// 1. Upload files
const handleUpload = async (files) => {
    const formData = new FormData();
    files.forEach(file => formData.append("files", file));

    const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
    });
    const data = await response.json();
    return data.job_id;
};

// 2. Listen to progress (using EventSource)
const listenToProgress = (jobId) => {
    const evtSource = new EventSource(`http://localhost:8000/progress/${jobId}`);

    evtSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        // Update progress bar
        setProgressBarValue(data.progress);
        setStatusText(data.status);

        if (data.progress === 100) {
            evtSource.close(); // Important: Close connection when done
            
            if (data.error) {
                // Handle Error
                showError(data.error);
            } else if (data.result) {
                // Populate Table View
                setTableData(data.result);
            }
        }
    };
};
```
