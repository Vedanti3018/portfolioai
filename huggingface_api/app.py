from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../scripts')))

# Import script functions
from optimize_resume import analyze_resume
from generate_cover_letter import generate_cover_letter_api
from generate_summary import generate_summary
from extract_pdf import extract_text_from_pdf

# Load environment variables
load_dotenv()

app = FastAPI(title="PortfolioAI API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your Vercel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    prompt: str
    max_length: Optional[int] = 500
    temperature: Optional[float] = 0.7

class ResumeRequest(BaseModel):
    text: str
    job_description: Optional[str] = None

class CoverLetterRequest(BaseModel):
    resume_text: str
    job_description: str
    full_name: Optional[str] = ""
    email: Optional[str] = ""
    address: Optional[str] = ""
    phone: Optional[str] = ""
    date: Optional[str] = ""
    hiring_manager: Optional[str] = ""
    hiring_title: Optional[str] = ""
    company: Optional[str] = ""
    company_address: Optional[str] = ""

class SummaryRequest(BaseModel):
    portfolio_data: dict

class ExtractPDFRequest(BaseModel):
    file_path: str

@app.get("/")
async def root():
    return {"message": "PortfolioAI API is running"}

@app.post("/generate")
async def generate_text(request: GenerateRequest):
    try:
        # TODO: Implement your LLM generation logic here
        return {
            "generated_text": f"Generated response for: {request.prompt}",
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-resume")
async def generate_resume(req: ResumeRequest):
    try:
        groq_api_key = os.getenv('GROQ_API_KEY')
        if not groq_api_key:
            raise HTTPException(status_code=500, detail="GROQ_API_KEY not set")
        result = analyze_resume(req.text, req.job_description or '', groq_api_key)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-cover-letter")
async def generate_cover_letter(req: CoverLetterRequest):
    try:
        cover_letter = generate_cover_letter_api(
            resume_text=req.resume_text,
            job_description=req.job_description,
            full_name=req.full_name,
            email=req.email,
            address=req.address,
            phone=req.phone,
            date=req.date,
            hiring_manager=req.hiring_manager,
            hiring_title=req.hiring_title,
            company=req.company,
            company_address=req.company_address
        )
        return {"cover_letter": cover_letter}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-summary")
async def summary(req: SummaryRequest):
    try:
        result = generate_summary(req.portfolio_data)
        return {"summary": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/extract-pdf")
async def extract_pdf(req: ExtractPDFRequest):
    try:
        text = extract_text_from_pdf(req.file_path)
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 