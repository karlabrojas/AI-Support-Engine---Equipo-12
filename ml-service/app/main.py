from fastapi import FastAPI, HTTPException

from app.predictor import predict_category
from app.schemas import TicketRequest, PredictionResponse


app = FastAPI(title="AI Support ML Service")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict", response_model=PredictionResponse)
def predict(ticket: TicketRequest):
    message = ticket.message.strip()

    if not message:
        raise HTTPException(
            status_code=400,
            detail="El mensaje no puede estar vacío"
        )

    try:
        prediction = predict_category(message)

        return PredictionResponse(
            category=prediction["category"],
            confidence=prediction["confidence"]
        )

    except Exception:
        raise HTTPException(
            status_code=503,
            detail="El servicio ML no pudo procesar la solicitud"
        )
