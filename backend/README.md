# GTM Repository - Backend

Flask-based backend API for the GTM (Go-to-Market) Repository portal.

## Installation

### 1. Create Virtual Environment

```bash
python -m venv venv
source venv/Scripts/activate  # On Windows
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Setup

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` with your Azure Blob Storage credentials:

```
FLASK_ENV=development
FLASK_PORT=5000
AZURE_STORAGE_CONNECTION_STRING=your_connection_string
AZURE_STORAGE_CONTAINER_NAME=gtm-videos
```

## Running the API

```bash
python app.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Get All Resources
```
GET /api/resources
```
Returns list of all GTM resources with header, description, tags, and video URLs.

**Response:**
```json
[
  {
    "id": 1,
    "header": "Product Launch Strategy",
    "description": "Comprehensive guide...",
    "tags": ["Launch", "Strategy", "Product"],
    "video_url": "https://..."
  }
]
```

### Get Single Resource
```
GET /api/resources/<id>
```
Returns a specific resource by ID.

### Get All Tags
```
GET /api/tags
```
Returns list of all unique tags.

**Response:**
```json
["Launch", "Strategy", "Product", "Market Research", ...]
```

### Health Check
```
GET /api/health
```
Returns service health status.

## Project Structure

```
backend/
├── app.py              # Main Flask application
├── blob_service.py     # Azure Blob Storage integration
├── gtm_data.py         # Static GTM resource definitions
├── requirements.txt    # Python dependencies
├── .env.example        # Environment variables template
└── README.md          # This file
```

## Azure Blob Storage Setup

1. Create Azure Storage Account in Azure Portal
2. Create a container named `gtm-videos`
3. Upload your demo video files to the container
4. Copy the connection string from Storage Account > Access Keys
5. Set `AZURE_STORAGE_CONNECTION_STRING` in `.env`

## Video URL Format

Update the `video_url` in `gtm_data.py` with your actual blob storage URLs:

```
https://youraccount.blob.core.windows.net/gtm-videos/video-name.mp4
```

## CORS Configuration

The backend includes CORS support for frontend integration. Configure allowed origins in the `app.py` if needed.

## Error Handling

- `404`: Resource or endpoint not found
- `500`: Internal server error
- All errors return JSON response with error message
