from pathlib import Path
from typing import Protocol

from app.core.config import settings


class ObjectStorage(Protocol):
    """Protocol for object and artifact storage (resumes, exports, evaluation bundles)."""
    async def upload(self, key: str, data: bytes, content_type: str = "application/octet-stream") -> str:
        ...

    async def download(self, key: str) -> bytes:
        ...

    async def delete(self, key: str) -> bool:
        ...

    async def get_url(self, key: str) -> str:
        ...


class LocalStorage:
    """Local filesystem storage implementation for offline development."""
    def __init__(self, root_dir: str = "./storage"):
        self.root_dir = Path(root_dir)
        self.root_dir.mkdir(parents=True, exist_ok=True)

    async def upload(self, key: str, data: bytes, content_type: str = "application/octet-stream") -> str:
        file_path = self.root_dir / key
        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.write_bytes(data)
        return f"/storage/{key}"

    async def download(self, key: str) -> bytes:
        file_path = self.root_dir / key
        if not file_path.exists():
            raise FileNotFoundError(f"Object {key} not found in local storage")
        return file_path.read_bytes()

    async def delete(self, key: str) -> bool:
        file_path = self.root_dir / key
        if file_path.exists():
            file_path.unlink()
            return True
        return False

    async def get_url(self, key: str) -> str:
        return f"http://localhost:8000/storage/{key}"


def get_storage() -> ObjectStorage:
    return LocalStorage(root_dir=settings.STORAGE_LOCAL_ROOT)
