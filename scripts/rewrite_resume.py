import argparse
import os
import sys
import json
import logging
from dotenv import load_dotenv

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

def extract_structured_fields(resume_text, groq_api_key):
    """Use Groq LLM to extract structured fields from resume text."""
    logger.info("Starting structured field extraction from resume")
    
    prompt = """
You are a helpful assistant that extracts structured information from a resume text. 

Extract all available details and when extracting `skills`, carefully classify them into:
- "technical_skills": programming languages, tools, frameworks, data science libraries, AI/ML tools, platforms, software
- "soft_skills": communication, problem-solving, adaptability, leadership, critical thinking, teamwork, etc.
- "languages": spoken or written languages like English, Hindi, Spanish, etc.

Return all data in this exact JSON format:
{
  "personal_info": {
    "name": "string or null",
    "email": "string or null",
    "phone": "string or null",
    "location": "string or null",
    "summary": "string or null"
  },
  "education": [
    {
      "degree": "string or null",
      "institution": "string or null",
      "field_of_study": "string or null",
      "start_year": "string or null",
      "end_year": "string or null"
    }
  ],
  "experience": [
    {
      "company": "string or null",
      "designation": "string or null",
      "start_date": "string or null",
      "end_date": "string or null",
      "description": "string or null"
    }
  ],
  "skills": {
    "technical_skills": ["string"],
    "soft_skills": ["string"],
    "languages": ["string"]
  }
}
Only include fields if data is clearly available. If a value is missing, use null or an empty string/array where appropriate.
Do not add extra explanations or comments. Output only the raw JSON.
"""
    try:
        client = Groq(api_key=groq_api_key)
        logger.info("Calling Groq API for structured field extraction")
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": f"Extract structured info from the following resume text:\n\n{resume_text}"}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.1
        )
        content = completion.choices[0].message.content
        content = content.replace("```json", "").replace("```", "").strip()
        structured_data = json.loads(content)
        logger.info("Successfully extracted structured fields")
        return structured_data
    except Exception as e:
        logger.error(f"Failed to extract structured fields: {str(e)}")
        raise

def merge_suggestions_and_gaps(structured_data, suggestions, keyword_gaps):
    """Merge suggestions and keyword gaps into the structured data."""
    logger.info("Merging suggestions and keyword gaps into structured data")
    
    # Convert suggestions and gaps to lists if they're strings
    if isinstance(suggestions, str):
        suggestions = [s.strip() for s in suggestions.split('\n') if s.strip()]
    if isinstance(keyword_gaps, str):
        keyword_gaps = [k.strip() for k in keyword_gaps.split(',') if k.strip()]
    
    # Add suggestions and gaps to the structured data
    structured_data['suggestions'] = suggestions
    if 'skills' not in structured_data:
        structured_data['skills'] = {}
    structured_data['skills']['keyword_gaps'] = keyword_gaps
    
    logger.info(f"Merged {len(suggestions)} suggestions and {len(keyword_gaps)} keyword gaps")
    return structured_data

def main():
    parser = argparse.ArgumentParser(description="Rewrite a resume using suggestions and keyword gaps.")
    parser.add_argument('--resume_text', type=str, required=True, help='Original resume text')
    parser.add_argument('--suggestions', type=str, required=True, help='Suggestions for improvement (as bullet points)')
    parser.add_argument('--keyword_gaps', type=str, required=True, help='Comma-separated keyword gaps')
    args = parser.parse_args()

    logger.info("Starting resume rewrite process")
    
    load_dotenv()
    groq_api_key = os.getenv('GROQ_API_KEY')
    if not groq_api_key:
        logger.error("GROQ_API_KEY not found in environment")
        sys.exit(1)

    # Step 1: Extract structured fields from the resume
    try:
        structured = extract_structured_fields(args.resume_text, groq_api_key)
        logger.info("Successfully extracted structured fields from resume")
    except Exception as e:
        logger.error(f"Failed to extract structured fields: {str(e)}")
        print(json.dumps({'error': f'Failed to extract structured fields: {str(e)}'}))
        sys.exit(1)

    # Step 2: Generate revised resume as structured JSON
    prompt = f"""
You are an expert resume writer and ATS optimization specialist.

TASK:
Given the following structured resume data, suggestions, and keyword gaps, generate a revised resume as a JSON object with the same structure. 
- Incorporate the suggestions and keyword gaps as bullet points in the appropriate sections (especially Skills).
- Use active voice and concise language.
- Output ONLY the revised resume as a JSON object, no extra text or markdown.
- Suggestions and skills must be arrays of strings (bullet points).

STRUCTURED RESUME DATA:
{json.dumps(structured)}

SUGGESTIONS (bullet points):
{args.suggestions}

KEYWORD GAPS (bullet points):
{args.keyword_gaps}

IMPORTANT: You MUST return a single JSON object with the following structure:
{{
  "personal_info": {{ ... }},
  "education": [ ... ],
  "experience": [ ... ],
  "skills": {{
    "technical_skills": [ ... ],
    "soft_skills": [ ... ],
    "languages": [ ... ],
    "keyword_gaps": [ ... ]
  }},
  "suggestions": [ ... ]
}}

Do NOT return a plain array or any text outside the JSON object.
"""
    try:
        logger.info("Calling Groq API for resume revision")
        client = Groq(api_key=groq_api_key)
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are an expert resume writer and ATS optimization specialist. Output only the revised resume as a JSON object."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=2500,
            temperature=0.5,
        )
        content = completion.choices[0].message.content
        content = content.replace("```json", "").replace("```", "").strip()
        
        # Parse and validate the JSON output
        try:
            revised_resume = json.loads(content)
            logger.info("Successfully generated revised resume")
            
            # Ensure suggestions and keyword gaps are properly merged
            revised_resume = merge_suggestions_and_gaps(
                revised_resume,
                args.suggestions,
                args.keyword_gaps
            )
            
            # Print the final structured JSON
            print(json.dumps(revised_resume, indent=2))
            
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON output from LLM: {str(e)}")
            print(json.dumps({'error': f'Invalid JSON output from LLM: {str(e)}'}))
            sys.exit(1)
            
    except Exception as e:
        logger.error(f"Failed to rewrite resume: {str(e)}")
        print(json.dumps({'error': f'Failed to rewrite resume: {str(e)}'}))
        sys.exit(1)

if __name__ == '__main__':
    main() 