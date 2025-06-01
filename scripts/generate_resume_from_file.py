import os
import sys
import tempfile
import json
import requests
import logging
from io import BytesIO
from urllib.parse import urlparse
from typing import Dict, Any, Optional

# Use textract for DOC/DOCX and PyPDF2 for PDF
import textract
from PyPDF2 import PdfReader

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stderr)
    ]
)
logger = logging.getLogger(__name__)

def get_file_content(file_path_or_url: str) -> tuple[BytesIO, str]:
    """Get file content from local path or URL."""
    logger.info(f"Getting content from: {file_path_or_url}")
    
    if file_path_or_url.startswith(('http://', 'https://')):
        try:
            response = requests.get(file_path_or_url)
            response.raise_for_status()
            return BytesIO(response.content), os.path.splitext(urlparse(file_path_or_url).path)[1].lower()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching URL: {str(e)}")
            raise RuntimeError(f"Failed to fetch URL: {str(e)}")
    else:
        try:
            with open(file_path_or_url, 'rb') as f:
                return BytesIO(f.read()), os.path.splitext(file_path_or_url)[1].lower()
        except IOError as e:
            logger.error(f"Error reading file: {str(e)}")
            raise RuntimeError(f"Failed to read file: {str(e)}")

def extract_text(file_path_or_url: str) -> str:
    """Extract text from PDF, DOC, or DOCX file or URL."""
    logger.info(f"Extracting text from: {file_path_or_url}")
    
    try:
        file_content, ext = get_file_content(file_path_or_url)
        
        if ext not in ['.pdf', '.doc', '.docx']:
            error_msg = f'Unsupported file type: {ext}'
            logger.error(error_msg)
            raise ValueError(error_msg)
        
        if ext == '.pdf':
            # Use PyPDF2 for PDF files
            logger.info("Processing PDF file with PyPDF2")
            reader = PdfReader(file_content)
            text = ""
            for i, page in enumerate(reader.pages, 1):
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
                logger.debug(f"Processed page {i}")
            return text.strip()
        else:
            # Use textract for DOC/DOCX files
            logger.info("Processing DOC/DOCX file with textract")
            # Save to temporary file for textract
            with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as temp_file:
                temp_file.write(file_content.getvalue())
                temp_file.flush()
                try:
                    return textract.process(temp_file.name).decode('utf-8')
                finally:
                    os.unlink(temp_file.name)
    except Exception as e:
        error_msg = f'Error extracting text from {file_path_or_url}: {str(e)}'
        logger.error(error_msg)
        raise RuntimeError(error_msg)

def validate_resume_json(data: Dict[str, Any]) -> bool:
    """Validate the structure of the resume JSON."""
    required_sections = ['personal', 'experience', 'education', 'skills']
    required_personal = ['name', 'title', 'email', 'phone', 'location', 'summary']
    
    try:
        # Check required sections
        for section in required_sections:
            if section not in data:
                logger.error(f"Missing required section: {section}")
                return False
        
        # Check required personal fields
        for field in required_personal:
            if field not in data['personal']:
                logger.error(f"Missing required personal field: {field}")
                return False
        
        # Validate experience entries
        for i, exp in enumerate(data['experience']):
            required_exp = ['company', 'position', 'startDate', 'endDate', 'description']
            for field in required_exp:
                if field not in exp:
                    logger.error(f"Missing required field in experience entry {i}: {field}")
                    return False
        
        # Validate education entries
        for i, edu in enumerate(data['education']):
            required_edu = ['school', 'degree', 'field', 'startDate', 'endDate']
            for field in required_edu:
                if field not in edu:
                    logger.error(f"Missing required field in education entry {i}: {field}")
                    return False
        
        return True
    except Exception as e:
        logger.error(f"Error validating resume JSON: {str(e)}")
        return False

def call_groq_api(extracted_text: str, job_title: Optional[str] = None, job_description: Optional[str] = None, user_name: Optional[str] = None, user_email: Optional[str] = None) -> Dict[str, Any]:
    """Call Groq API to generate structured resume JSON."""
    logger.info("Calling Groq API for resume generation")
    api_key = os.environ.get('GROQ_API_KEY')
    if not api_key:
        error_msg = 'GROQ_API_KEY not set in environment'
        logger.error(error_msg)
        raise RuntimeError(error_msg)
    
    # Determine the type of generation and create appropriate prompt
    if job_title and job_description:
        # File-based enhancement flow
        prompt = f"""
You are an expert resume writer. Given the following resume content and a target job, rewrite and structure the resume for ATS compatibility. 
IMPORTANT: You must respond with ONLY a valid JSON object, no other text. The JSON must have these exact fields:
{{
  "personal": {{ "name": "", "title": "", "email": "", "phone": "", "location": "", "summary": "" }},
  "experience": [{{ "company": "", "position": "", "startDate": "", "endDate": "", "description": "" }}],
  "education": [{{ "school": "", "degree": "", "field": "", "startDate": "", "endDate": "" }}],
  "skills": [],
  "projects": [{{ "title": "", "description": "", "startDate": "", "endDate": "" }}],
  "certifications": [{{ "name": "", "issuer": "", "date": "" }}],
  "awards": [{{ "award": "", "description": "", "date": "" }}],
}}

Resume Content:
{extracted_text}

Target Job Title: {job_title}
Target Job Description: {job_description}

Remember: Respond with ONLY the JSON object, no other text or explanation.
"""
    else:
        # Prompt-based generation flow
        prompt = f"""
You are an expert resume writer. Create a professional, complete resume for a candidate applying to the role of {extracted_text}.
- Do NOT mention the target company or designation (e.g., {extracted_text}) in the experience section.
- Instead, create a plausible work history at other companies and roles that would make the candidate a strong fit for this job.
- Use the provided name and email in the personal section.
- For all other sections (additional experience, education, skills, projects, certifications, awards), fill in realistic, professional, but fictional data as needed to make the resume look complete and impressive.
- If any section is missing, invent plausible details.

IMPORTANT: You must respond with ONLY a valid JSON object, no other text. The JSON must have these exact fields:
{{
  "personal": {{ 
    "name": "{user_name}",
    "title": "",
    "email": "{user_email}",
    "phone": "",
    "location": "",
    "summary": ""
  }},
  "experience": [{{ "company": "", "position": "", "startDate": "", "endDate": "", "description": "" }}],
  "education": [{{ "school": "", "degree": "", "field": "", "startDate": "", "endDate": "" }}],
  "skills": [
  {{"Technical Skills": "", "Soft Skills": "", "Languages": "", "Tools": ""}}],
  "projects": [{{ "title": "", "description": "", "startDate": "", "endDate": "" }}],
  "certifications": [{{ "name": "", "issuer": "", "date": "" }}],
  "awards": [{{ "award": "", "description": "", "date": "" }}],
}}

Target Role: {extracted_text}

Remember: Respond with ONLY the JSON object, no other text or explanation. Do NOT mention the target company or designation in the experience section.
"""

    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }
    data = {
        "messages": [
            {"role": "system", "content": "You are an expert resume writer. You must respond with ONLY valid JSON, no other text."},
            {"role": "user", "content": prompt}
        ],
        "model": "llama3-8b-8192",
        "temperature": 0.3,  # Lower temperature for more consistent JSON output
        "max_tokens": 4000
    }
    
    try:
        logger.info("Sending request to Groq API")
        response = requests.post('https://api.groq.com/openai/v1/chat/completions', headers=headers, json=data)
        response.raise_for_status()
        content = response.json()['choices'][0]['message']['content']
        
        # Debug: Print the raw response
        logger.debug("Raw API Response: %s", content)
        
        # Try to parse the JSON
        try:
            resume_json = json.loads(content)
            if not validate_resume_json(resume_json):
                raise ValueError("Invalid resume JSON structure")
            return resume_json
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing JSON: {str(e)}")
            logger.info("Attempting to clean the response...")
            
            # Try to extract JSON from the response if it's wrapped in other text
            import re
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                try:
                    resume_json = json.loads(json_match.group(0))
                    if not validate_resume_json(resume_json):
                        raise ValueError("Invalid resume JSON structure after cleaning")
                    return resume_json
                except json.JSONDecodeError:
                    error_msg = "Could not parse JSON from API response even after cleaning"
                    logger.error(error_msg)
                    raise RuntimeError(error_msg)
            else:
                error_msg = "No JSON object found in API response"
                logger.error(error_msg)
                raise RuntimeError(error_msg)
                
    except requests.exceptions.RequestException as e:
        error_msg = f"API request failed: {str(e)}"
        logger.error(error_msg)
        raise RuntimeError(error_msg)

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Generate a resume from a file (PDF, DOC, DOCX) or job title.")
    parser.add_argument('--file', type=str, help='Path or URL to the resume file (PDF, DOC, DOCX)')
    parser.add_argument('--job_title', type=str, help='Target job title (for enhancement)')
    parser.add_argument('--job_description', type=str, help='Target job description (for enhancement)')
    parser.add_argument('--user_name', type=str, help='User name (for prompt-based generation)')
    parser.add_argument('--user_email', type=str, help='User email (for prompt-based generation)')
    args = parser.parse_args()

    if args.file:
        extracted_text = extract_text(args.file)
    elif args.job_title:
        extracted_text = args.job_title
    else:
        print('[ERROR] No file or job title provided.', file=sys.stderr)
        sys.exit(1)

    try:
        resume_json = call_groq_api(
            extracted_text=extracted_text,
            job_title=args.job_title,
            job_description=args.job_description,
            user_name=args.user_name,
            user_email=args.user_email
        )
        if validate_resume_json(resume_json):
            print(json.dumps(resume_json, indent=2))
        else:
            print('[ERROR] Invalid resume JSON structure.', file=sys.stderr)
            sys.exit(1)
    except Exception as e:
        print(f"[ERROR] Failed to generate resume: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main() 