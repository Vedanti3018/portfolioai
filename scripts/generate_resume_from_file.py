import os
import sys
import tempfile
import json
import requests
import logging
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
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

def download_file(url: str) -> str:
    """Download a file from URL and return the local path."""
    logger.info(f"Downloading file from URL: {url}")
    local_filename = os.path.join(tempfile.gettempdir(), os.path.basename(urlparse(url).path))
    
    try:
        with requests.get(url, stream=True) as r:
            r.raise_for_status()
            with open(local_filename, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
        logger.info(f"File downloaded successfully to: {local_filename}")
        return local_filename
    except requests.exceptions.RequestException as e:
        logger.error(f"Error downloading file: {str(e)}")
        raise RuntimeError(f"Failed to download file: {str(e)}")

def extract_text(file_path: str) -> str:
    """Extract text from PDF, DOC, or DOCX file."""
    logger.info(f"Extracting text from file: {file_path}")
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext not in ['.pdf', '.doc', '.docx']:
        error_msg = f'Unsupported file type: {ext}'
        logger.error(error_msg)
        raise ValueError(error_msg)
    
    try:
        if ext == '.pdf':
            # Use PyPDF2 for PDF files
            logger.info("Processing PDF file with PyPDF2")
            reader = PdfReader(file_path)
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
            return textract.process(file_path).decode('utf-8')
    except Exception as e:
        error_msg = f'Error extracting text from {file_path}: {str(e)}'
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
            required_edu = ['Institute', 'Degree', 'field', 'startDate', 'endDate']
            for field in required_edu:
                if field not in edu:
                    logger.error(f"Missing required field in education entry {i}: {field}")
                    return False
        
        return True
    except Exception as e:
        logger.error(f"Error validating resume JSON: {str(e)}")
        return False

def call_groq_api(extracted_text: str, job_title: str, job_description: str) -> Dict[str, Any]:
    """Call Groq API to generate structured resume JSON."""
    logger.info("Calling Groq API for resume generation")
    api_key = os.environ.get('GROQ_API_KEY')
    if not api_key:
        error_msg = 'GROQ_API_KEY not set in environment'
        logger.error(error_msg)
        raise RuntimeError(error_msg)
    
    prompt = f"""
You are an expert resume writer. Given the following resume content and a target job, rewrite and structure the resume for ATS compatibility. 
IMPORTANT: You must respond with ONLY a valid JSON object, no other text. The JSON must have these exact fields:
{{
  "personal": {{ "name": "", "title": "", "email": "", "phone": "", "location": "", "summary": "" }},
  "experience": [{{ "company": "", "position": "", "startDate": "", "endDate": "", "description": "" }}],
  "education": [{{ "Institute": "", "Degree": "", "field": "", "startDate": "", "endDate": "" }}],
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
    parser = argparse.ArgumentParser(description='Generate structured resume JSON from file or prompt and job info using Groq.')
    parser.add_argument('--file', help='Path or URL to the resume file (PDF, DOC, DOCX)')
    parser.add_argument('--prompt', help='Raw resume prompt text (alternative to file)')
    parser.add_argument('--job_title', required=True, help='Target job title')
    parser.add_argument('--job_description', required=True, help='Target job description')
    args = parser.parse_args()

    logger.info("Starting resume generation process")
    logger.info(f"Input file: {args.file}")
    logger.info(f"Prompt: {args.prompt}")
    logger.info(f"Target job title: {args.job_title}")

    if not args.file and not args.prompt:
        logger.error('Either --file or --prompt must be provided.')
        sys.exit(1)

    extracted_text = None
    cleanup = False
    file_path = None

    if args.prompt:
        extracted_text = args.prompt
        logger.info('Using prompt as resume content.')
    else:
        # Download if URL
        if args.file.startswith('http://') or args.file.startswith('https://'):
            file_path = download_file(args.file)
            cleanup = True
        else:
            file_path = args.file
            cleanup = False
        try:
            extracted_text = extract_text(file_path)
            logger.info("Text extraction completed successfully")
        except Exception as e:
            logger.error(f"Error extracting text: {str(e)}")
            sys.exit(1)

    try:
        resume_json = call_groq_api(extracted_text, args.job_title, args.job_description)
        logger.info("Resume JSON generation completed successfully")
        print(json.dumps(resume_json, indent=2))
    except Exception as e:
        logger.error(f"Error in main process: {str(e)}")
        sys.exit(1)
    finally:
        if cleanup and file_path:
            try:
                os.remove(file_path)
                logger.info(f"Cleaned up temporary file: {file_path}")
            except Exception as e:
                logger.error(f"Error cleaning up temporary file: {str(e)}")

if __name__ == '__main__':
    main() 