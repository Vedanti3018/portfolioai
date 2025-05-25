// lib/groqClient.ts
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function extractResumeData(text: string) {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an intelligent resume section parser.

Analyze the provided text, which is a section from a resume, and extract structured information into JSON.

Based on the content, identify what type of section it is (e.g., Education, Experience, Skills, Personal Info, etc.) and return ONLY the relevant part of the full resume JSON structure.

For example:
- If the text is the Education section, return: { "education": [...] }
- If the text is the Experience section, return: { "experience": [...] }
- If the text contains basic personal info, return: { "basic_info": { ... }, "professional_info": { "linkedin_url": ..., "portfolio_url": ... } }
- If the text is the Skills section, return: { "skills": { ... } }

Here is the overall desired JSON structure (return only the relevant part):

{
  "basic_info": {
    "name": string,
    "email": string,
    "phone": string,
    "age": string | number,
    "country": string
  },
  "education": [
    {
      "degree": string,
      "institution": string,
      "field_of_study": string,
      "location": string,
      "start_year": string,
      "end_year": string
    }
  ],
  "experience": [
    {
      "company": string,
      "designation": string,
      "location": string,
      "start_date": string,
      "end_date": string,
      "duration": string,
      "description": string
    }
  ],
   "skills": {
      "technical_skills": [string],
      "soft_skills": [string],
      "languages": [string]
    },
    "certifications": [
      {
        "name": string,
        "issuer": string,
        "year": string
      }
    ],
    "projects": [
      {
        "title": string,
        "description": string,
        "technologies": [string],
        "role": string,
        "duration": string
      }
    ],
    "awards": [
        {
            "name": string,
            "year": string,
            "issuer": string
        }
    ],
    "publications": [
        {
            "title": string,
            "publisher": string,
            "year": string,
            "url": string
        }
    ],
     "volunteer": [
        {
            "organization": string,
            "role": string,
            "start_date": string,
            "end_date": string,
            "description": string
        }
     ],
    "linkedin_url": string,
    "portfolio_url": string
}

Rules:
- Return ONLY valid JSON containing only the relevant keys for the section provided.
- Do not return any explanation or text outside the JSON.
- If any field is missing within the section, use null or an empty string/array for that specific part.
- Include ALL relevant entries for the section.
- Normalize dates to readable formats (e.g., "Jan 2022 - Dec 2023").
- For experience, calculate "duration" if not explicitly stated.`
        },
        {
          role: 'user',
          content: `Resume Section Text:\n"""${text}"""`
        }
      ],
      model: 'gemma2-9b-it',
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from Groq');
    }

    try {
      // We expect a partial JSON matching one or more top-level keys (e.g., { "education": [...] })
      const parsed = JSON.parse(response);
       // Basic validation: check if the parsed object has any of the expected top-level keys
       const expectedKeys = ['basic_info', 'education', 'experience', 'skills', 'certifications', 'projects', 'awards', 'publications', 'volunteer', 'linkedin_url', 'portfolio_url'];
       const hasExpectedKey = expectedKeys.some(key => Object.prototype.hasOwnProperty.call(parsed, key));

       if (!hasExpectedKey) {
            console.error('Parsed data is missing expected top-level keys:', parsed);
           throw new Error("Parsed data does not contain expected resume section keys.");
       }

      return parsed;
    } catch (error) {
      console.error('Raw Groq response:', response);
      throw new Error(`Failed to parse or validate JSON from Groq response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Groq API error:', error);
    throw error;
  }
}
