import argparse
import os
import sys
import logging
from dotenv import load_dotenv
import requests
from io import BytesIO

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
    import PyPDF2
except ImportError:
    logger.error("PyPDF2 package not installed. Please run: pip install PyPDF2")
    sys.exit(1)

def extract_text_from_pdf(file_path):
    """Extract text from a PDF file."""
    logger.info(f"Extracting text from PDF: {file_path}")
    
    try:
        if file_path.startswith('http://') or file_path.startswith('https://'):
            # Download the file from the URL
            response = requests.get(file_path)
            response.raise_for_status()
            file = BytesIO(response.content)
        else:
            # Local file
            file = open(file_path, 'rb')
        
        # Create PDF reader object
        pdf_reader = PyPDF2.PdfReader(file)
        
        # Extract text from each page
        text = ''
        for page in pdf_reader.pages:
            text += page.extract_text() + '\n'
        
        logger.info("Successfully extracted text from PDF")
        return text.strip()
            
    except Exception as e:
        logger.error(f"Failed to extract text from PDF: {str(e)}")
        raise

def main():
    parser = argparse.ArgumentParser(description="Extract text from a PDF file.")
    parser.add_argument('--file_path', type=str, required=True, help='Path to the PDF file')
    args = parser.parse_args()

    logger.info("Starting PDF text extraction")
    
    try:
        text = extract_text_from_pdf(args.file_path)
        print(text)
    except Exception as e:
        logger.error(f"PDF extraction failed: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main() 