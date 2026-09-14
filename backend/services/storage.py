import os
import uuid
import logging
from abc import ABC, abstractmethod
from typing import Optional

logger = logging.getLogger("pharmaguard.storage")


class StorageProvider(ABC):
    @abstractmethod
    def upload_file(self, file_bytes: bytes, filename: str, content_type: str, user_id: str) -> str:
        """Upload a file payload and return a persistent storage key."""
        pass

    @abstractmethod
    def download_file(self, storage_key: str, user_id: str) -> Optional[bytes]:
        """Download a file by its storage key, enforcing user access isolation."""
        pass

    @abstractmethod
    def delete_file(self, storage_key: str, user_id: str) -> bool:
        """Delete a file by its storage key."""
        pass


class LocalStorageProvider(StorageProvider):
    """Local filesystem storage provider for development environments."""

    def __init__(self, base_dir: str = "uploads"):
        self.base_dir = os.path.abspath(base_dir)
        os.makedirs(self.base_dir, exist_ok=True)

    def _resolve_path(self, storage_key: str, user_id: str) -> str:
        # Enforce user folder path containment to prevent path traversal
        clean_key = os.path.basename(storage_key)
        user_dir = os.path.join(self.base_dir, user_id)
        os.makedirs(user_dir, exist_ok=True)
        return os.path.join(user_dir, clean_key)

    def upload_file(self, file_bytes: bytes, filename: str, content_type: str, user_id: str) -> str:
        clean_filename = os.path.basename(filename)
        unique_name = f"{uuid.uuid4()}_{clean_filename}"
        file_path = self._resolve_path(unique_name, user_id)

        with open(file_path, "wb") as f:
            f.write(file_bytes)

        logger.info(f"Saved file {clean_filename} for user {user_id} at {unique_name}")
        return unique_name

    def download_file(self, storage_key: str, user_id: str) -> Optional[bytes]:
        file_path = self._resolve_path(storage_key, user_id)
        if not os.path.isfile(file_path):
            return None
        with open(file_path, "rb") as f:
            return f.read()

    def delete_file(self, storage_key: str, user_id: str) -> bool:
        file_path = self._resolve_path(storage_key, user_id)
        if os.path.isfile(file_path):
            try:
                os.remove(file_path)
                return True
            except OSError:
                return False
        return False


class S3StorageProvider(StorageProvider):
    """S3-compatible persistent object storage for production (AWS, Cloudflare R2, MinIO)."""

    def __init__(self):
        self.bucket = os.getenv("S3_BUCKET_NAME", "pharmaguard-docs")
        self.region = os.getenv("AWS_REGION", "us-east-1")
        # Defer boto3 import so it's only required when S3 backend is explicitly enabled
        try:
            import boto3  # type: ignore
            self.s3_client = boto3.client("s3", region_name=self.region)
        except ImportError:
            logger.warning("boto3 is not installed. Falling back to local storage.")
            self.s3_client = None

    def upload_file(self, file_bytes: bytes, filename: str, content_type: str, user_id: str) -> str:
        clean_filename = os.path.basename(filename)
        key = f"users/{user_id}/docs/{uuid.uuid4()}_{clean_filename}"
        if self.s3_client:
            self.s3_client.put_object(
                Bucket=self.bucket,
                Key=key,
                Body=file_bytes,
                ContentType=content_type or "application/octet-stream",
            )
        return key

    def download_file(self, storage_key: str, user_id: str) -> Optional[bytes]:
        # Enforce that key must start with users/{user_id}/ to prevent cross-user access
        if not storage_key.startswith(f"users/{user_id}/"):
            logger.warning(f"Security Alert: User {user_id} attempted unauthorized access to {storage_key}")
            return None
        if self.s3_client:
            try:
                res = self.s3_client.get_object(Bucket=self.bucket, Key=storage_key)
                return res["Body"].read()
            except Exception as e:
                logger.error(f"Error fetching {storage_key} from S3: {e}")
                return None
        return None

    def delete_file(self, storage_key: str, user_id: str) -> bool:
        if not storage_key.startswith(f"users/{user_id}/"):
            return False
        if self.s3_client:
            try:
                self.s3_client.delete_object(Bucket=self.bucket, Key=storage_key)
                return True
            except Exception:
                return False
        return False


def get_storage_provider() -> StorageProvider:
    """Factory retrieving the configured storage provider."""
    backend_choice = os.getenv("STORAGE_BACKEND", "local").lower()
    if backend_choice == "s3" and os.getenv("S3_BUCKET_NAME"):
        provider = S3StorageProvider()
        if provider.s3_client:
            return provider
    return LocalStorageProvider()
