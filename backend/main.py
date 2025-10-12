# from fastapi import FastAPI, UploadFile, Form
# from fastapi.middleware.cors import CORSMiddleware
# from sqlalchemy import create_engine, Column, Integer, String, Text
# from sqlalchemy.orm import declarative_base, sessionmaker
# import pytesseract
# from PIL import Image
# from googletrans import Translator
# import shutil, os

# app = FastAPI()
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Database setup
# Base = declarative_base()
# engine = create_engine("sqlite:///prescriptions.db", connect_args={"check_same_thread": False})
# SessionLocal = sessionmaker(bind=engine)
# session = SessionLocal()

# class Prescription(Base):
#     __tablename__ = "prescriptions"
#     id = Column(Integer, primary_key=True, index=True)
#     patient_name = Column(String, index=True)
#     raw_text = Column(Text)
#     translated_text = Column(Text)

# Base.metadata.create_all(engine)
# translator = Translator()

# UPLOAD_DIR = "uploads"
# os.makedirs(UPLOAD_DIR, exist_ok=True)

# @app.post("/upload/")
# async def upload_prescription(file: UploadFile, patient_name: str = Form(...)):
#     file_path = os.path.join(UPLOAD_DIR, file.filename)
#     with open(file_path, "wb") as buffer:
#         shutil.copyfileobj(file.file, buffer)

#     # OCR extraction
#     text = pytesseract.image_to_string(Image.open(file_path))

#     # Translation (to English if in Hindi/Telugu)
#     translated = translator.translate(text, dest="en").text

#     # Save to DB
#     prescription = Prescription(patient_name=patient_name, raw_text=text, translated_text=translated)
#     session.add(prescription)
#     session.commit()

#     return {"patient_name": patient_name, "raw_text": text, "translated_text": translated}

# @app.get("/history/{patient_name}")
# def get_history(patient_name: str):
#     records = session.query(Prescription).filter(Prescription.patient_name == patient_name).all()
#     return [{"raw_text": r.raw_text, "translated_text": r.translated_text} for r in records]


# # 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
# main.py
import os
import io
import base64
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from openai import AsyncOpenAI, APIError # <-- New import

# Load environment variables from .env file
load_dotenv()

# ------------------- Configuration -------------------
DATABASE_URL = "sqlite:///prescriptions.db"
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

if not OPENROUTER_API_KEY:
    raise ValueError("API Key not found. Please set OPENROUTER_API_KEY in your .env file.")

# ------------------- OpenAI Client Setup -------------------
# This client is configured to use OpenRouter's API
client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)

# Optional: Add your site details for OpenRouter analytics
# You can customize these or remove the 'extra_headers' if you don't need them
SITE_URL = "http://localhost:3000" # Your frontend URL
SITE_NAME = "Prescription AI"      # Your project name

# ------------------- FastAPI setup -------------------
app = FastAPI(title="Prescription Analyzer API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# (Database setup remains the same...)
# ------------------- Database setup -------------------
Base = declarative_base()
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Prescription(Base):
    __tablename__ = "prescriptions"
    id = Column(Integer, primary_key=True, index=True)
    patient_name = Column(String, index=True)
    raw_text = Column(Text)
    llm_extracted_info = Column(Text)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ------------------- Routes -------------------

@app.post("/upload/")
async def upload_prescription(
    file: UploadFile = File(...),
    patient_name: str = Form(...),
    db: Session = Depends(get_db)
):
    try:
        contents = await file.read()
        encoded_image = base64.b64encode(contents).decode("utf-8")
        image_media_type = file.content_type

        prompt_text = """
You are a medical AI assistant. Analyze the prescription image provided.
Extract the structured information and return ONLY a valid JSON object with the following keys:
- "patient_name": string
- "date": string (in DD-MM-YYYY format)
- "doctor_name": string
- "medicines": a list of objects, where each object has "name", "dosage", and "frequency".
If any information is unclear, use "N/A".
"""
        # --- The API call is now done using the OpenAI client ---
        llm_output = '{"error": "LLM API call failed"}'
        try:
            completion = await client.chat.completions.create(
                extra_headers={
                    "HTTP-Referer": SITE_URL,
                    "X-Title": SITE_NAME,
                },
                model="mistralai/mistral-small-3.2-24b-instruct:free", # Vision-compatible free model
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt_text},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:{image_media_type};base64,{encoded_image}"
                                },
                            },
                        ],
                    }
                ],
                max_tokens=1024,
                temperature=0,
                response_format={"type": "json_object"}
            )
            llm_output = completion.choices[0].message.content

        except APIError as e:
            print(f"OpenRouter API call failed: {e}")
            raise HTTPException(status_code=503, detail=f"The external LLM service failed: {e.body.get('message', 'Unknown Error')}")

        # (Saving to DB remains the same...)
        prescription = Prescription(
            patient_name=patient_name,
            raw_text="[Image processed directly by vision model]",
            llm_extracted_info=llm_output
        )
        db.add(prescription)
        db.commit()
        db.refresh(prescription)

        return {
            "id": prescription.id,
            "patient_name": patient_name,
            "llm_extracted_info": llm_output
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected server error occurred: {str(e)}")

# (The /history endpoint remains the same...)
@app.get("/history/{patient_name}")
def get_history(patient_name: str, db: Session = Depends(get_db)):
    records = db.query(Prescription).filter(Prescription.patient_name == patient_name).all()
    if not records:
        raise HTTPException(status_code=404, detail=f"No history found for patient: {patient_name}")
    
    return [
        {
            "id": r.id,
            "raw_text": r.raw_text,
            "llm_extracted_info": r.llm_extracted_info
        }
        for r in records
    ]