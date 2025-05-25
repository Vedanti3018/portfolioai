import sys
import json
import os
import pdfplumber
import requests
from io import BytesIO
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

def extract_text_from_url(pdf_url):
    try:
        # Download PDF from URL
        response = requests.get(pdf_url)
        response.raise_for_status()
        
        # Read PDF from bytes
        pdf_file = BytesIO(response.content)
        full_text = ""
        with pdfplumber.open(pdf_file) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    full_text += text + "\n"

        return {
            "success": True,
            "text": full_text.strip()
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def extract_info_with_groq(text):
    try:
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))

        prompt = """
You are a helpful assistant that extracts structured information from a resume text. 

Extract all available details and when extracting `skills`, carefully classify them into:
- "technical_skills": programming languages, tools, frameworks, data science libraries, AI/ML tools, platforms, software
- "soft_skills": communication, problem-solving, adaptability, leadership, critical thinking, teamwork, etc.
- "languages": spoken or written languages like English, Hindi, Spanish, etc.

Only classify a skill if it's clearly present in the text. Do not guess. Use lowercase consistently unless it's a proper name or acronym.

Return all data in this exact JSON format:

{
  "basic_info": {
    "name": "string or null",
    "email": "string or null",
    "phone": "string or null",
    "country": "string or null",
    "education": [
      {
        "degree": "string or null",
        "institution": "string or null",
        "field_of_study": "string or null",
        "start_year": "string or null",
        "end_year": "string or null"
      }
    ]
  },
  "professional_info": {
    "current_designation": "string or null",
    "skills": {
      "technical_skills": ["string"],
      "soft_skills": ["string"],
      "languages": ["string"]
    },
    "experience": [
      {
        "company": "string or null",
        "designation": "string or null",
        "start_date": "string or null",
        "end_date": "string or null",
        "description": "string or null"
      }
    ],
    "certifications": [
      {
        "name": "string or null",
        "issuer": "string or null",
        "year": "string or null"
      }
    ],
    "projects": [
      {
        "title": "string or null",
        "description": "string or null",
        "technologies": ["string"],
      }
    ],
    "linkedin_url": "string or null",
    "portfolio_url": "string or null"
  }
}

Only include fields if data is clearly available. If a value is missing, use null or an empty string/array where appropriate.
Do not add extra explanations or comments. Output only the raw JSON.
"""

        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": f"Extract structured info from the following resume text:\n\n{text}"}
            ],
            model="gemma2-9b-it",
            temperature=0.1
        )

        content = completion.choices[0].message.content
        # Clean and parse the content
        content = content.replace("```json", "").replace("```", "").strip()
        result_json = json.loads(content)

        return {
            "success": True,
            "data": result_json
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({
            "success": False,
            "error": "Please provide a PDF URL"
        }))
        sys.exit(1)
        
    pdf_url = sys.argv[1]
    # pdf_url = "https://dpgqkccpercvfxutjfxe.supabase.co/storage/v1/object/public/resumes/8ed33051-0785-4aea-8f88-1b62b2f4ad23/1748172560939.pdf"
    
    # First extract text from PDF
    pdf_result = extract_text_from_url(pdf_url)
    if not pdf_result["success"]:
        print(json.dumps(pdf_result))
        sys.exit(1)
        
    # Then extract information using Groq
    groq_result = extract_info_with_groq(pdf_result["text"])
    print(json.dumps(groq_result)) 