# PortfolioAI Hugging Face API

This is the API service for PortfolioAI, deployed on Hugging Face Spaces.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

## Running Locally

```bash
uvicorn app:app --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

- `GET /`: Health check endpoint
- `POST /generate`: Generate text using the LLM
  - Request body:
    ```json
    {
      "prompt": "Your prompt here",
      "max_length": 500,
      "temperature": 0.7
    }
    ```

## Deployment to Hugging Face

1. Create a new Space on Hugging Face
2. Choose "Docker" as the SDK
3. Push your code to the Space
4. Configure environment variables in the Space settings

## Integration with Vercel Frontend

Update your frontend environment variables to point to your Hugging Face API endpoint:

```env
NEXT_PUBLIC_API_URL=https://your-space-name.hf.space
``` 