# Images Service

A FastAPI service for handling image uploads and management for the JobsViet platform.

## Features

- Image upload for candidates, employers, and companies
- Automatic conversion to WebP format
- File validation (type, size, content)
- Organized storage by user/company ID
- RESTful API endpoints

## API Endpoints

### Upload Images

- `POST /upload/candidate/{candidate_id}` - Upload candidate profile image
- `POST /upload/employer/{employer_id}` - Upload employer profile image
- `POST /upload/company/{company_id}` - Upload company image

### Retrieve Images

- `GET /images/candidate/{candidate_id}/{filename}` - Get candidate image
- `GET /images/employer/{employer_id}/{filename}` - Get employer image
- `GET /images/company/{company_id}/{filename}` - Get company image

### Delete Images

- `DELETE /images/candidate/{candidate_id}/{filename}` - Delete candidate image
- `DELETE /images/employer/{employer_id}/{filename}` - Delete employer image
- `DELETE /images/company/{company_id}/{filename}` - Delete company image

## Requirements

- Python 3.8+
- FastAPI
- Pillow (PIL)
- Uvicorn

## Installation

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Run the service:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Configuration

- Upload directory: `./uploads`
- Max file size: 5MB
- Allowed formats: PNG, JPEG, WebP
- Output format: WebP

## Security

- Bearer token authentication required for uploads and deletions
- File type validation
- Image content verification
- Size limits enforcement
