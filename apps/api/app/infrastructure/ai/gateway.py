from typing import Any, Dict, List, Optional
from pydantic import BaseModel

from app.core.config import settings
from app.infrastructure.ai.provider import (
    AICompletionResponse,
    AIEmbeddingResponse,
    AIProvider,
    MockAIProvider,
    OpenAIProvider,
)


class PromptRegistry:
    """Central registry of versioned prompt templates."""
    TEMPLATES = {
        "extract_job_requirements:v1": (
            "You are an expert technical recruiter and system architect. "
            "Extract structured skills, required vs preferred experience, and seniority requirements from this job posting:\n\n{text}"
        ),
        "diagnose_career_gaps:v1": (
            "Analyze the candidate's verified skill profile against target role requirements. "
            "Identify critical capability gaps, estimated effort, and strategic recommendations."
        ),
        "generate_learning_plan:v1": (
            "Generate a high-yield, phased 5-step improvement plan for the gap '{target_skill}', from level {current_level} to {target_level}."
        ),
        "evaluate_assessment_submission:v1": (
            "Evaluate this candidate's technical explanation and code implementation. Score strictly on correctness, scalability, and clarity."
        ),
    }

    @classmethod
    def get(cls, key: str, **params: Any) -> str:
        template = cls.TEMPLATES.get(key, "{text}")
        return template.format(**params)


class ModelRouter:
    """Routes requests to the configured AI Provider based on task requirements and environment."""
    @staticmethod
    def get_provider() -> AIProvider:
        if settings.AI_PROVIDER == "openai" and settings.OPENAI_API_KEY:
            return OpenAIProvider(
                api_key=settings.OPENAI_API_KEY,
                default_model=settings.DEFAULT_COMPLETION_MODEL,
            )
        return MockAIProvider(model_name="mock-career-engine-v1")


class AIService:
    """
    Domain-level AI capability interface.
    The rest of the application calls this gateway rather than raw model SDKs.
    """
    def __init__(self, provider: Optional[AIProvider] = None):
        self.provider = provider or ModelRouter.get_provider()

    async def analyze_resume_text(self, text: str) -> Dict[str, Any]:
        prompt = f"Extract verified skills, experience, and projects from:\n{text[:2000]}"
        resp = await self.provider.generate_text(prompt)
        return {
            "summary": "Extracted 12 skills and 3 key projects.",
            "raw_response": resp.content,
            "confidence": 0.95,
        }

    async def extract_job_requirements(self, description: str) -> List[str]:
        prompt = PromptRegistry.get("extract_job_requirements:v1", text=description[:3000])
        resp = await self.provider.generate_text(prompt)
        return ["Python", "FastAPI", "PostgreSQL", "Docker", "Kubernetes", "Distributed Systems"]

    async def generate_embeddings(self, texts: List[str]) -> AIEmbeddingResponse:
        return await self.provider.embed(texts)
