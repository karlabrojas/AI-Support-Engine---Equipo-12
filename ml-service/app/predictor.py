from pathlib import Path
import joblib


MODEL_PATH = (
    Path(__file__).resolve().parents[1]
    / "models"
    / "ticket_model.joblib"
)


def load_model():
    if not MODEL_PATH.exists() or MODEL_PATH.stat().st_size == 0:
        raise RuntimeError(
            "Modelo ML no encontrado. Ejecuta primero train.py"
        )

    return joblib.load(MODEL_PATH)


model = load_model()


def predict_category(message: str):
    probabilities = model.predict_proba([message])[0]
    classes = model.classes_

    best_index = probabilities.argmax()

    return {
        "category": str(classes[best_index]),
        "confidence": float(probabilities[best_index])
    }
