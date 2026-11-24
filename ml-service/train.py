from pathlib import Path

import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report
from sklearn.metrics import classification_report, confusion_matrix


BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "tickets.csv"
MODEL_PATH = BASE_DIR / "models" / "ticket_model.joblib"

VALID_CATEGORIES = {
    "ACCESS",
    "BUG",
    "FEATURE",
    "SECURITY"
}


def train():
    data = pd.read_csv(DATA_PATH)

    required_columns = {"message", "category"}

    if not required_columns.issubset(data.columns):
        raise ValueError("El CSV debe tener message y category")

    data = data.dropna(subset=["message", "category"])
    data["message"] = data["message"].astype(str).str.strip()
    data["category"] = data["category"].astype(str).str.strip()

    data = data[data["message"] != ""]

    if not set(data["category"]).issubset(VALID_CATEGORIES):
        raise ValueError("El CSV contiene categorías no válidas")

    counts = data["category"].value_counts()

    if len(counts) != 4 or counts.min() < 2:
        raise ValueError(
            "Se necesitan al menos dos ejemplos por categoría"
        )

    X_train, X_test, y_train, y_test = train_test_split(
        data["message"],
        data["category"],
        test_size=0.2,
        stratify=data["category"],
        random_state=42
    )

    model = Pipeline([
        ("vectorizer", TfidfVectorizer(ngram_range=(1, 2))),
        ("classifier", LogisticRegression(max_iter=1000))
    ])

    model.fit(X_train, y_train)
    
    # Evaluación del modelo
    
    predictions = model.predict(X_test)

    print("\n=== REPORTE DE CLASIFICACIÓN ===")
    print(classification_report(y_test, predictions, zero_division=0))

    print("\n=== MATRIZ DE CONFUSIÓN ===")
    print(confusion_matrix(
        y_test,
        predictions,
        labels=model.classes_
    ))

    # Prueba con un mensaje nuevo
    new_message = ["Encontré datos de otros clientes"]

    category = model.predict(new_message)[0]
    confidence = model.predict_proba(new_message).max()

    print("\n=== PREDICCIÓN DE PRUEBA ===")
    print("Mensaje:", new_message[0])
    print("Categoría:", category)
    print("Score aproximado:", round(confidence, 3))

    predictions = model.predict(X_test)

    print("Resultados de evaluación:")
    print(classification_report(
        y_test,
        predictions,
        zero_division=0
    ))

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)

    print(f"Modelo guardado en: {MODEL_PATH}")


if __name__ == "__main__":
    train()

from pathlib import Path

import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report


BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "tickets.csv"
MODEL_PATH = BASE_DIR / "models" / "ticket_model.joblib"

VALID_CATEGORIES = {
    "ACCESS",
    "BUG",
    "FEATURE",
    "SECURITY"
}


def train():
    data = pd.read_csv(DATA_PATH)

    required_columns = {"message", "category"}

    if not required_columns.issubset(data.columns):
        raise ValueError("El CSV debe tener message y category")

    data = data.dropna(subset=["message", "category"])
    data["message"] = data["message"].astype(str).str.strip()
    data["category"] = data["category"].astype(str).str.strip()

    data = data[data["message"] != ""]

    if not set(data["category"]).issubset(VALID_CATEGORIES):
        raise ValueError("El CSV contiene categorías no válidas")

    counts = data["category"].value_counts()

    if len(counts) != 4 or counts.min() < 2:
        raise ValueError(
            "Se necesitan al menos dos ejemplos por categoría"
        )

    X_train, X_test, y_train, y_test = train_test_split(
        data["message"],
        data["category"],
        test_size=0.2,
        stratify=data["category"],
        random_state=42
    )

    model = Pipeline([
        ("vectorizer", TfidfVectorizer(ngram_range=(1, 2))),
        ("classifier", LogisticRegression(max_iter=1000))
    ])

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    print("Resultados de evaluación:")
    print(classification_report(
        y_test,
        predictions,
        zero_division=0
    ))

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)

    print(f"Modelo guardado en: {MODEL_PATH}")


if __name__ == "__main__":
    train()
