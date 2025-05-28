export async function generateResumeFromFile(
  fileUrl: string,
  jobTitle: string,
  jobDescription: string,
  userId: string
) {
  const response = await fetch('/api/generate-resume', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fileUrl,
      jobTitle,
      jobDescription,
      userId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to generate resume');
  }

  return response.json();
} 