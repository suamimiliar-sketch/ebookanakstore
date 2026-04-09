"""Cloudinary signed upload helper for the admin image uploader."""
import time
import hashlib
from app.core.config import get_settings

settings = get_settings()


def generate_upload_signature(folder: str = "ebookanak") -> dict:
    """Return params the frontend needs for a signed unsigned-style upload."""
    timestamp = int(time.time())
    to_sign = f"folder={folder}&timestamp={timestamp}{settings.CLOUDINARY_API_SECRET}"
    signature = hashlib.sha1(to_sign.encode()).hexdigest()
    return {
        "cloud_name": settings.CLOUDINARY_CLOUD_NAME,
        "api_key": settings.CLOUDINARY_API_KEY,
        "timestamp": timestamp,
        "folder": folder,
        "signature": signature,
    }
