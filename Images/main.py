from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
import uuid
from PIL import Image
import io
import mimetypes
from pathlib import Path
from pydantic import BaseModel
from typing import Optional
import shutil

app = FastAPI(title="Images Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()
security_optional = HTTPBearer(auto_error=False)

# Configuration
UPLOAD_DIR = Path("uploads")
ALLOWED_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# Ensure upload directory exists
UPLOAD_DIR.mkdir(exist_ok=True)

class ImageUploadResponse(BaseModel):
    image_url: str
    file_name: str
    file_size: int
    mime_type: str

def validate_image_file(file: UploadFile) -> None:
    """Validate uploaded image file."""
    # Check file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Check file size
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Seek back to beginning

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File size too large. Maximum size: {MAX_FILE_SIZE} bytes"
        )

    # Validate MIME type
    mime_type, _ = mimetypes.guess_type(file.filename)
    if mime_type not in ['image/png', 'image/jpeg', 'image/webp']:
        raise HTTPException(
            status_code=400,
            detail="Invalid MIME type. Only PNG, JPEG, and WebP images are allowed."
        )

    # Validate image content
    try:
        image = Image.open(file.file)
        image.verify()  # Verify it's a valid image
        file.file.seek(0)  # Reset file pointer
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid image file. The file may be corrupted or not a valid image."
        )

def convert_to_webp(image_bytes: bytes, quality: int = 85) -> bytes:
    """Convert image to WebP format."""
    try:
        image = Image.open(io.BytesIO(image_bytes))

        # Convert to RGB if necessary (for PNG with transparency)
        if image.mode in ("RGBA", "LA", "P"):
            image = image.convert("RGB")

        # Save as WebP
        output = io.BytesIO()
        image.save(output, format='WebP', quality=quality)
        output.seek(0)
        return output.getvalue()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to convert image: {str(e)}"
        )

def create_user_directory(user_id: str) -> Path:
    """Create directory for user uploads."""
    user_dir = UPLOAD_DIR / user_id
    user_dir.mkdir(exist_ok=True)
    return user_dir

@app.post("/upload/candidate/{candidate_id}", response_model=ImageUploadResponse)
async def upload_candidate_image(
    candidate_id: str,
    file: UploadFile = File(...)
):
    """Upload image for candidate profile."""
    # Validate file
    validate_image_file(file)

    # Create user directory
    user_dir = create_user_directory(candidate_id)

    # Generate unique filename
    file_ext = Path(file.filename).suffix.lower()
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = user_dir / unique_filename

    # Read file content
    file_content = await file.read()

    # Convert to WebP
    webp_content = convert_to_webp(file_content)

    # Save WebP file
    webp_filename = f"{uuid.uuid4()}.webp"
    webp_path = user_dir / webp_filename

    with open(webp_path, "wb") as f:
        f.write(webp_content)

    # Return response
    return ImageUploadResponse(
        image_url=f"/images/candidate/{candidate_id}/{webp_filename}",
        file_name=webp_filename,
        file_size=len(webp_content),
        mime_type="image/webp"
    )

@app.post("/upload/employer/{employer_id}", response_model=ImageUploadResponse)
async def upload_employer_image(
    employer_id: str,
    file: UploadFile = File(...)
):
    """Upload image for employer profile."""
    # Validate file
    validate_image_file(file)

    # Create user directory
    user_dir = create_user_directory(employer_id)

    # Generate unique filename
    file_ext = Path(file.filename).suffix.lower()
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = user_dir / unique_filename

    # Read file content
    file_content = await file.read()

    # Convert to WebP
    webp_content = convert_to_webp(file_content)

    # Save WebP file
    webp_filename = f"{uuid.uuid4()}.webp"
    webp_path = user_dir / webp_filename

    with open(webp_path, "wb") as f:
        f.write(webp_content)

    # Return response
    return ImageUploadResponse(
        image_url=f"/images/employer/{employer_id}/{webp_filename}",
        file_name=webp_filename,
        file_size=len(webp_content),
        mime_type="image/webp"
    )

@app.post("/upload/company/{company_id}", response_model=ImageUploadResponse)
async def upload_company_image(
    company_id: str,
    file: UploadFile = File(...)
):
    """Upload image for company."""
    # Validate file
    validate_image_file(file)

    # Create user directory
    user_dir = create_user_directory(company_id)

    # Generate unique filename
    file_ext = Path(file.filename).suffix.lower()
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = user_dir / unique_filename

    # Read file content
    file_content = await file.read()

    # Convert to WebP
    webp_content = convert_to_webp(file_content)

    # Save WebP file
    webp_filename = f"{uuid.uuid4()}.webp"
    webp_path = user_dir / webp_filename

    with open(webp_path, "wb") as f:
        f.write(webp_content)

    # Return response
    return ImageUploadResponse(
        image_url=f"/images/company/{company_id}/{webp_filename}",
        file_name=webp_filename,
        file_size=len(webp_content),
        mime_type="image/webp"
    )

@app.post("/upload/job/{user_id}", response_model=ImageUploadResponse)
async def upload_job_image(
    user_id: str,
    file: UploadFile = File(...)
):
    """Upload image for job posting."""
    # Validate file
    validate_image_file(file)

    # Create user directory
    user_dir = create_user_directory(user_id)

    # Generate unique filename
    file_ext = Path(file.filename).suffix.lower()
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = user_dir / unique_filename

    # Read file content
    file_content = await file.read()

    # Convert to WebP
    webp_content = convert_to_webp(file_content)

    # Save WebP file
    webp_filename = f"{uuid.uuid4()}.webp"
    webp_path = user_dir / webp_filename

    with open(webp_path, "wb") as f:
        f.write(webp_content)

    # Return response
    return ImageUploadResponse(
        image_url=f"/images/job/{user_id}/{webp_filename}",
        file_name=webp_filename,
        file_size=len(webp_content),
        mime_type="image/webp"
    )

@app.get("/images/candidate/{candidate_id}/{filename}")
async def get_candidate_image(candidate_id: str, filename: str):
    """Serve candidate image."""
    file_path = UPLOAD_DIR / candidate_id / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")

    return FileResponse(
        path=file_path,
        media_type="image/webp",
        filename=filename
    )

@app.get("/images/employer/{employer_id}/{filename}")
async def get_employer_image(employer_id: str, filename: str):
    """Serve employer image."""
    file_path = UPLOAD_DIR / employer_id / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")

    return FileResponse(
        path=file_path,
        media_type="image/webp",
        filename=filename
    )

@app.get("/images/company/{company_id}/{filename}")
async def get_company_image(company_id: str, filename: str):
    """Serve company image."""
    file_path = UPLOAD_DIR / company_id / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")

    return FileResponse(
        path=file_path,
        media_type="image/webp",
        filename=filename
    )

@app.get("/images/job/{user_id}/{filename}")
async def get_job_image(user_id: str, filename: str):
    """Serve job image."""
    file_path = UPLOAD_DIR / user_id / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")

    return FileResponse(
        path=file_path,
        media_type="image/webp",
        filename=filename
    )

@app.delete("/images/job/{user_id}/{filename}")
async def delete_job_image(
    user_id: str,
    filename: str,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_optional)
):
    """Delete job image."""
    file_path = UPLOAD_DIR / user_id / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")

    try:
        file_path.unlink()
        return {"message": "Image deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete image: {str(e)}")

@app.delete("/images/candidate/{candidate_id}/{filename}")
async def delete_candidate_image(
    candidate_id: str,
    filename: str,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_optional)
):
    """Delete candidate image."""
    file_path = UPLOAD_DIR / candidate_id / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")

    try:
        file_path.unlink()
        return {"message": "Image deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete image: {str(e)}")

@app.delete("/images/employer/{employer_id}/{filename}")
async def delete_employer_image(
    employer_id: str,
    filename: str,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_optional)
):
    """Delete employer image."""
    file_path = UPLOAD_DIR / employer_id / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")

    try:
        file_path.unlink()
        return {"message": "Image deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete image: {str(e)}")

@app.delete("/images/company/{company_id}/{filename}")
async def delete_company_image(
    company_id: str,
    filename: str,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_optional)
):
    """Delete company image. Authentication is optional for internal service calls.
    After deleting the image, if the directory is empty, it will be removed as well."""
    file_path = UPLOAD_DIR / company_id / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")

    try:
        # Delete the image file
        file_path.unlink()
        
        # Check if the directory is empty and remove it if so
        company_dir = UPLOAD_DIR / company_id
        if company_dir.exists():
            # Check if directory is empty (no files or subdirectories)
            try:
                # Try to remove the directory - will raise OSError if not empty
                company_dir.rmdir()
                return {"message": "Image deleted successfully and directory removed"}
            except OSError:
                # Directory is not empty, which is fine
                pass
        
        return {"message": "Image deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete image: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
