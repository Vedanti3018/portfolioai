import argparse
import os
import sys
import json
import logging
from dotenv import load_dotenv
import requests
from io import BytesIO
import pdfplumber
from urllib.parse import urlparse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

try:
    from groq import Groq
except ImportError:
    logger.error("groq package not installed. Please run: pip install groq")
    sys.exit(1)

def get_file_content(file_path_or_url: str) -> BytesIO:
    """Get file content from local path or URL."""
    logger.info(f"Getting content from: {file_path_or_url}")
    
    if file_path_or_url.startswith(('http://', 'https://')):
        try:
            response = requests.get(file_path_or_url)
            response.raise_for_status()
            return BytesIO(response.content)
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching URL: {str(e)}")
            raise RuntimeError(f"Failed to fetch URL: {str(e)}")
    else:
        try:
            with open(file_path_or_url, 'rb') as f:
                return BytesIO(f.read())
        except IOError as e:
            logger.error(f"Error reading file: {str(e)}")
            raise RuntimeError(f"Failed to read file: {str(e)}")

def extract_text_from_pdf(file_path_or_url: str) -> str:
    """Extract text from a PDF file or URL."""
    logger.info(f"Extracting text from PDF: {file_path_or_url}")
    
    try:
        file_content = get_file_content(file_path_or_url)
        full_text = ""
        with pdfplumber.open(file_content) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    full_text += text + "\n"
        return full_text.strip()
    except Exception as e:
        logger.error(f"Failed to extract text from PDF: {str(e)}")
        raise

def clean_json_string(json_str):
    """Clean and parse JSON string, handling common LLM output issues."""
    try:
        # Remove markdown code blocks if present
        json_str = json_str.replace("```json", "").replace("```", "").strip()
        
        # Try to parse the JSON
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON: {str(e)}")
        logger.error(f"Raw JSON string: {json_str}")
        raise

def analyze_resume(resume_text, job_description, groq_api_key):
    """Analyze resume against job description and generate structured feedback."""
    logger.info("Starting resume analysis")
    
    prompt = f"""
You are an expert ATS (Applicant Tracking System) and resume optimization specialist.

TASK:
Analyze the following resume against the job description and provide structured feedback.
Focus on:
1. Keyword matching and gaps
2. Content optimization suggestions
3. Overall ATS compatibility

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Return your analysis in this exact JSON format:
{{
  "score": number (0-100),
  "keyword_gaps": [
    "string (specific missing keywords or skills)",
    ...
  ],
  "suggestions": [
    "string (specific improvement suggestions)",
    ...
  ],
  "structured_resume": {{
    "personal_info": {{
      "name": "string or null",
      "email": "string or null",
      "phone": "string or null",
      "location": "string or null",
      "summary": "string or null"
    }},
    "education": [
      {{
        "degree": "string or null",
        "institution": "string or null",
        "field_of_study": "string or null",
        "start_year": "string or null",
        "end_year": "string or null"
      }}
    ],
    "experience": [
      {{
        "company": "string or null",
        "designation": "string or null",
        "start_date": "string or null",
        "end_date": "string or null",
        "description": "string or null"
      }}
    ],
    "skills": {{
      "technical_skills": ["string"],
      "soft_skills": ["string"],
      "languages": ["string"],
      "keyword_gaps": ["string"]
    }}
  }}
}}

IMPORTANT:
- Score should be a number between 0-100
- All suggestions and keyword gaps must be specific and actionable
- The structured_resume should include all available information from the original resume
- Do not add any text outside the JSON object
- Return ONLY the JSON object, no markdown or extra text
"""
    try:
        client = Groq(api_key=groq_api_key)
        logger.info("Calling Groq API for resume analysis")
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are an expert ATS and resume optimization specialist. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            model="gemma2-9b-it",
            temperature=0.3,
            max_tokens=2500
        )
        
        content = completion.choices[0].message.content
        logger.info("Received response from Groq API")
        
        # Clean and parse the JSON
        analysis = clean_json_string(content)
        logger.info("Successfully parsed analysis result")
        
        # Validate required fields
        required_fields = ['score', 'keyword_gaps', 'suggestions', 'structured_resume']
        for field in required_fields:
            if field not in analysis:
                raise ValueError(f"Missing required field: {field}")
        
        return analysis
            
    except Exception as e:
        logger.error(f"Failed to analyze resume: {str(e)}")
        raise

def main():
    parser = argparse.ArgumentParser(description="Analyze and optimize a resume against a job description.")
    parser.add_argument('--resume_text', type=str, help='Resume text to analyze')
    parser.add_argument('--job_description', type=str, required=True, help='Job description to compare against')
    parser.add_argument('--resume_file', type=str, help='Path or URL to the PDF file to extract resume text from')
    args = parser.parse_args()

    logger.info("Starting resume optimization process")
    
    load_dotenv()
    groq_api_key = os.getenv('GROQ_API_KEY')
    if not groq_api_key:
        logger.error("GROQ_API_KEY not found in environment")
        sys.exit(1)

    resume_text = None
    if args.resume_text:
        resume_text = args.resume_text
    elif args.resume_file:
        logger.info(f"Extracting resume text from: {args.resume_file}")
        resume_text = extract_text_from_pdf(args.resume_file)
        if not resume_text:
            error_msg = 'Failed to extract text from PDF.'
            logger.error(error_msg)
            print(json.dumps({'error': error_msg}))
            sys.exit(1)
    else:
        error_msg = 'Either --resume_text or --resume_file must be provided.'
        logger.error(error_msg)
        print(json.dumps({'error': error_msg}))
        sys.exit(1)

    try:
        analysis = analyze_resume(resume_text, args.job_description, groq_api_key)
        # Print clean JSON without indentation for API consumption
        print(json.dumps(analysis))
    except Exception as e:
        logger.error(f"Resume optimization failed: {str(e)}")
        print(json.dumps({'error': str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main() 