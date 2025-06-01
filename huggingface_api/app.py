from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv

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

@app.get("/")
async def root():
    return {"message": "PortfolioAI API is running"}

@app.post("/generate")
async def generate_text(request: GenerateRequest):
    try:
        # TODO: Implement your LLM generation logic here
        # This is a placeholder response
        return {
            "generated_text": f"Generated response for: {request.prompt}",
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 