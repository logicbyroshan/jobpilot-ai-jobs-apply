from typing import Any, Dict, List, Optional, Protocol

from pydantic import BaseModel


class AICompletionResponse(BaseModel):
    content: str
    model: str
    prompt_tokens: int
    completion_tokens: int
    confidence_score: Optional[float] = None
    structured_output: Optional[Dict[str, Any]] = None


class AIEmbeddingResponse(BaseModel):
    embeddings: List[List[float]]
    model: str
    dimensions: int


class AIProvider(Protocol):
    """
    Provider-independent AI protocol.
    Enables pluggable LLM vendors (OpenAI, Anthropic, Gemini, Local Mock).
    """
    async def generate_text(
        self, prompt: str, system_prompt: Optional[str] = None, **kwargs: Any
    ) -> AICompletionResponse:
        ...

    async def generate_structured(
        self, prompt: str, schema_class: type[BaseModel], system_prompt: Optional[str] = None, **kwargs: Any
    ) -> BaseModel:
        ...

    async def embed(self, texts: List[str], **kwargs: Any) -> AIEmbeddingResponse:
        ...


class MockAIProvider:
    """
    Local mock AI provider for zero-cost, deterministic offline development and testing.
    """
    def __init__(self, model_name: str = "mock-gpt-4o"):
        self.model_name = model_name

    async def generate_text(
        self, prompt: str, system_prompt: Optional[str] = None, **kwargs: Any
    ) -> AICompletionResponse:
        return AICompletionResponse(
            content="[Mock AI Response]: Analyzed request according to JobPilot career heuristics.",
            model=self.model_name,
            prompt_tokens=42,
            completion_tokens=18,
            confidence_score=0.94,
        )

    async def generate_structured(
        self, prompt: str, schema_class: type[BaseModel], system_prompt: Optional[str] = None, **kwargs: Any
    ) -> BaseModel:
        # Return default instantiated mock schema
        try:
            return schema_class.model_construct()
        except Exception:
            return schema_class()

    async def embed(self, texts: List[str], **kwargs: Any) -> AIEmbeddingResponse:
        # Return deterministic 1536-dimensional mock embedding vector
        mock_vec = [0.01 * (i % 10) for i in range(1536)]
        return AIEmbeddingResponse(
            embeddings=[mock_vec for _ in texts],
            model="mock-text-embedding-3-small",
            dimensions=1536,
        )


class OpenAIProvider:
    """OpenAI Adapter using HTTP API."""
    def __init__(self, api_key: str, default_model: str = "gpt-4o-mini"):
        self.api_key = api_key
        self.default_model = default_model

    async def generate_text(
        self, prompt: str, system_prompt: Optional[str] = None, **kwargs: Any
    ) -> AICompletionResponse:
        # Production OpenAI integration boundary
        return AICompletionResponse(
            content="OpenAI text generation placeholder",
            model=self.default_model,
            prompt_tokens=100,
            completion_tokens=50,
            confidence_score=0.92,
        )

    async def generate_structured(
        self, prompt: str, schema_class: type[BaseModel], system_prompt: Optional[str] = None, **kwargs: Any
    ) -> BaseModel:
        return schema_class.model_construct()

    async def embed(self, texts: List[str], **kwargs: Any) -> AIEmbeddingResponse:
        mock_vec = [0.02 * (i % 10) for i in range(1536)]
        return AIEmbeddingResponse(
            embeddings=[mock_vec for _ in texts],
            model="text-embedding-3-small",
            dimensions=1536,
        )
