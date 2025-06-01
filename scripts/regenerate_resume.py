import argparse
import os
import sys
import json
import logging
from dotenv import load_dotenv

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

try:
    from groq import Groq
except ImportError:
    logger.error("groq package not installed. Please run: pip install groq")
    sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Regenerate a resume using LLM and a prompt.")
    parser.add_argument('--prompt', type=str, required=True, help='Prompt for the LLM')
    args = parser.parse_args()

    load_dotenv()
    groq_api_key = os.getenv('GROQ_API_KEY')
    if not groq_api_key:
        logger.error("GROQ_API_KEY not found in environment")
        sys.exit(1)

    try:
        client = Groq(api_key=groq_api_key)
        logger.info("Calling Groq API for resume regeneration")
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a professional resume writer. Return only valid JSON."},
                {"role": "user", "content": args.prompt}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.3,
            max_tokens=2500
        )
        content = completion.choices[0].message.content
        content = content.replace("```json", "").replace("```", "").strip()
        print(content)
    except Exception as e:
        logger.error(f"Resume regeneration failed: {str(e)}")
        print(json.dumps({'error': str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main() 