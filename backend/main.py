# main.py
import os
import io
import base64
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Form, Security
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from openai import AsyncOpenAI, APIError
from pydantic import BaseModel
from typing import List, Optional
from fastapi.security import APIKeyHeader

# Load environment variables from .env file
load_dotenv()

# ------------------- Configuration -------------------
DATABASE_URL = "sqlite:///prescriptions.db"
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
ADMIN_API_KEY = os.getenv("ADMIN_API_KEY") 

if not OPENROUTER_API_KEY:
    raise ValueError("API Key not found. Please set OPENROUTER_API_KEY in your .env file.")
if not ADMIN_API_KEY:
    raise ValueError("Admin API Key not found. Please set ADMIN_API_KEY in your .env file.")

# ------------------- OpenAI Client Setup -------------------
client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)
SITE_URL = "http://localhost:3000" 
SITE_NAME = "Prescription AI"      

# ------------------- FastAPI setup -------------------
app = FastAPI(title="Prescription Analyzer API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# ------------------- Pydantic Schemas -------------------
class PrescriptionBase(BaseModel):
    patient_name: str
    raw_text: str
    llm_extracted_info: str

class PrescriptionResponse(PrescriptionBase):
    id: int
    class Config:
        from_attributes = True

class PrescriptionUpdate(BaseModel):
    patient_name: Optional[str] = None
    llm_extracted_info: Optional[str] = None

# ------------------- Admin API Key Security -------------------
api_key_header = APIKeyHeader(name="X-Admin-API-Key", auto_error=False)

async def get_admin_api_key(api_key: str = Security(api_key_header)):
    if api_key == ADMIN_API_KEY:
        return api_key
    else:
        raise HTTPException(
            status_code=403, 
            detail="Invalid or missing Admin API Key"
        )

# ------------------- Routes (ALL PROTECTED) -------------------

@app.post("/upload/", response_model=PrescriptionResponse)
async def upload_prescription(
    file: UploadFile = File(...),
    patient_name: str = Form(...),
    db: Session = Depends(get_db),
    api_key: str = Depends(get_admin_api_key)
):
    try:
        contents = await file.read()
        encoded_image = base64.b64encode(contents).decode("utf-8")
        image_media_type = file.content_type

        prompt_text = """
Analyze the prescription image.
Extract the structured information.
Return ONLY the raw JSON object. Do not add any conversational text, markdown, or backticks.
Your output MUST be a valid JSON object with these exact keys:
{
  "patient_name": "string",
  "date": "string (DD-MM-YYYY)",
  "doctor_name": "string",
  "medicines": [
    {"name": "string", "dosage": "string", "frequency": "string"}
  ]
}
If any information is unclear, use "N/A".
"""
        llm_output = '{"error": "LLM API call failed"}'
        try:
            completion = await client.chat.completions.create(
                extra_headers={
                    "HTTP-Referer": SITE_URL,
                    "X-Title": SITE_NAME,
                },
                model="openai/gpt-4o-mini",
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
                temperature=0.0,
                response_format={"type": "json_object"}
            )
            llm_output = completion.choices[0].message.content

        except APIError as e:
            print(f"OpenRouter API call failed: {e}")
            raise HTTPException(status_code=503, detail=f"The external LLM service failed: {e.body.get('message', 'Unknown Error')}")

        prescription = Prescription(
            patient_name=patient_name,
            raw_text="[Image processed by gpt-4o-mini]",
            llm_extracted_info=llm_output
        )
        db.add(prescription)
        db.commit()
        db.refresh(prescription)
        
        return prescription

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected server error occurred: {str(e)}")


@app.get("/history/{patient_name}", response_model=List[PrescriptionResponse])
def get_history(
    patient_name: str, 
    db: Session = Depends(get_db),
    api_key: str = Depends(get_admin_api_key)
):
    records = db.query(Prescription).filter(Prescription.patient_name == patient_name).all()
    if not records:
        raise HTTPException(status_code=404, detail=f"No history found for patient: {patient_name}")
    
    return records

# ------------------- Admin Routes -------------------

@app.get("/admin/prescriptions/", response_model=List[PrescriptionResponse])
async def admin_get_all_prescriptions(
    db: Session = Depends(get_db),
    api_key: str = Depends(get_admin_api_key)
):
    return db.query(Prescription).all()


@app.put("/admin/prescriptions/{prescription_id}", response_model=PrescriptionResponse)
async def admin_update_prescription(
    prescription_id: int,
    prescription_data: PrescriptionUpdate,
    db: Session = Depends(get_db),
    api_key: str = Depends(get_admin_api_key)
):
    db_prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not db_prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
        
    update_data = prescription_data.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_prescription, key, value)
        
    db.commit()
    db.refresh(db_prescription)
    return db_prescription


@app.delete("/admin/prescriptions/{prescription_id}")
async def admin_delete_prescription(
    prescription_id: int,
    db: Session = Depends(get_db),
    api_key: str = Depends(get_admin_api_key)
):
    db_prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not db_prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
        
    # --- THIS IS THE FIX ---
    db.delete(db_prescription)
    db.commit() # This line saves the delete to the file.
    # --- END OF FIX ---
    
    return {"detail": f"Prescription {prescription_id} deleted successfully"}