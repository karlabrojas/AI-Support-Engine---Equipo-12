from typing import Literal
from pydantic import BaseModel, Field


Category = Literal["ACCESS", "BUG", "FEATURE", "SECURITY"]


class TicketRequest(BaseModel):
    message: str = Field(min_length=1, max_length=5000)


class PredictionResponse(BaseModel):
    category: Category
    confidence: float = Field(ge=0, le=1)
    mode: Literal["machine-learning"] = "machine-learning"
