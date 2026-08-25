# AI Gateway & Intelligence Architecture

JobPilot isolates all Large Language Model and embedding calls behind a provider-independent **AI Gateway**.

---

## 1. Gateway Interfaces & Caching

The application never invokes external vendor SDKs (e.g. OpenAI, Anthropic) directly in domain services. Instead, it calls `AIService`:

```python
class AIService:
    async def analyze_resume_text(self, text: str) -> Dict[str, Any]: ...
    async def extract_job_requirements(self, description: str) -> List[str]: ...
    async def generate_embeddings(self, texts: List[str]) -> AIEmbeddingResponse: ...
```

### Deterministic Analysis Caching
Deterministic AI operations (such as identical job requirement extractions) are cached by `hashlib.sha256(content + prompt_version)` to avoid redundant external billing and network latency.
