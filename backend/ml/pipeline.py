import torch
from ml.ocrmodel import OCRModel, preprocess_image, ctc_decode

ocr_model = OCRModel()
ocr_model.eval()


def analyze_prescription(image_bytes):
    img = preprocess_image(image_bytes)

    with torch.no_grad():
        logits = ocr_model(img)
        raw_text = ctc_decode(logits)

    # TEMP: Replace with trained BiLSTM NER output
    result = {
        "patient_name": "Sachin Sansaar",
        "date": "12-10-2022",
        "doctor_name": "N/A",
        "medicines": [
            {"name": "Augmentin 625mg", "dosage": "1-0-1", "frequency": "5 days"},
            {"name": "Enzflam", "dosage": "1-0-1", "frequency": "5 days"},
            {"name": "Pand 40mg", "dosage": "1-0-0", "frequency": "5 days"},
            {"name": "Hexigel gum paint", "dosage": "1-0-1", "frequency": "1 week"}
        ]
    }

    return result
