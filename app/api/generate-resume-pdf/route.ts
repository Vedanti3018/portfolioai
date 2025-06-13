import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { writeFileSync, unlinkSync, readFileSync } from 'fs';

interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

interface ResumeContent {
  personal: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  experience: Experience[];
  education: Education[];
  skills: string[];
  projects?: {
    title: string;
    url?: string;
    description: string;
    startDate: string;
    endDate: string;
  }[];
  awards?: {
    award: string;
    date: string;
    description: string;
  }[];
  certifications?: {
    name: string;
    issuer: string;
    date: string;
  }[];
}

export async function POST(request: Request) {
  try {
    const { resumeId, content } = await request.json() as { resumeId: string; content: ResumeContent };

    // Get the user's session
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Create a temporary HTML file
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    const htmlPath = path.join(tempDir, `${resumeId}.html`);
    const pdfPath = path.join(tempDir, `${resumeId}.pdf`);

    // Generate HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Resume</title>
          <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Roboto', sans-serif;
              line-height: 1.6;
              color: #000;
              max-width: 800px;
              margin: 0 auto;
              padding: 2rem;
            }
            .header {
              text-align: center;
              margin-bottom: 2rem;
            }
            .header h1 {
              font-size: 2rem;
              margin: 0;
            }
            .header p {
              margin: 0.5rem 0;
              color: #666;
            }
            .section {
              margin-bottom: 2rem;
            }
            .section h2 {
              font-size: 1.5rem;
              border-bottom: 2px solid #000;
              padding-bottom: 0.5rem;
              margin-bottom: 1rem;
            }
            .item {
              margin-bottom: 1rem;
            }
            .item h3 {
              font-size: 1.2rem;
              margin: 0;
            }
            .item .meta {
              color: #666;
              font-size: 0.9rem;
              margin: 0.25rem 0;
            }
            .item .description {
              margin-top: 0.5rem;
            }
            .skills {
              display: flex;
              flex-wrap: wrap;
              gap: 0.5rem;
            }
            .skill {
              background: #f0f0f0;
              padding: 0.25rem 0.5rem;
              border-radius: 4px;
              font-size: 0.9rem;
            }
            .award-title {
              color: #1d4ed8;
              text-decoration: underline;
              font-weight: bold;
            }
            .project-link {
              color: #2563eb;
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${content.personal.name}</h1>
            <p>${content.personal.title}</p>
            <p>${content.personal.email} | ${content.personal.phone} | ${content.personal.location}</p>
          </div>

          <div class="section">
            <h2>Summary</h2>
            <p>${content.personal.summary}</p>
          </div>

          <div class="section">
            <h2>Experience</h2>
            ${content.experience.map((exp) => `
              <div class="item">
                <h3>${exp.position}</h3>
                <div class="meta">${exp.company} | ${exp.startDate} - ${exp.endDate}</div>
                <div class="description">${exp.description}</div>
              </div>
            `).join('')}
          </div>

          <div class="section">
            <h2>Education</h2>
            ${content.education.map((edu) => `
              <div class="item">
                <h3>${edu.degree} in ${edu.field}</h3>
                <div class="meta">${edu.school} | ${edu.startDate} - ${edu.endDate}</div>
              </div>
            `).join('')}
          </div>

          <div class="section">
            <h2>Skills</h2>
            <div class="skills">
              ${content.skills.map((skill) => `
                <span class="skill">${skill}</span>
              `).join('')}
            </div>
          </div>

          ${content.projects && content.projects.length > 0 ? `
          <div class="section">
            <h2>Projects</h2>
            ${content.projects.map((project) => `
              <div class="item">
                <h3>${project.title} ${project.url ? `<a href='${project.url}' class='project-link'>(Link)</a>` : ''}</h3>
                <div class="meta">${project.startDate} - ${project.endDate}</div>
                <div class="description">${project.description}</div>
              </div>
            `).join('')}
          </div>
          ` : ''}

          ${content.awards && content.awards.length > 0 ? `
          <div class="section">
            <h2>Awards & Achievements</h2>
            ${content.awards.map((award) => `
              <div class="item">
                <div class="award-title">${award.award}</div>
                <div class="meta">${award.date}</div>
                <div class="description">${award.description}</div>
              </div>
            `).join('')}
          </div>
          ` : ''}

          ${content.certifications && content.certifications.length > 0 ? `
          <div class="section">
            <h2>Certifications</h2>
            ${content.certifications.map((cert) => `
              <div class="item">
                <h3>${cert.name}</h3>
                <div class="meta">${cert.issuer} | ${cert.date}</div>
              </div>
            `).join('')}
          </div>
          ` : ''}

        </body>
      </html>
    `;

    // Write HTML to file
    writeFileSync(htmlPath, htmlContent);

    // Generate PDF using WeasyPrint
    await new Promise((resolve, reject) => {
      const weasyprint = spawn('weasyprint', [htmlPath, pdfPath]);
      
      weasyprint.on('close', (code) => {
        if (code === 0) {
          resolve(null);
        } else {
          reject(new Error(`WeasyPrint exited with code ${code}`));
        }
      });

      weasyprint.on('error', (err) => {
        reject(err);
      });
    });

    // Read the PDF file
    const pdfBuffer = readFileSync(pdfPath);

    // Clean up temporary files
    unlinkSync(htmlPath);
    unlinkSync(pdfPath);

    // Return the PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="resume.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return new NextResponse('Error generating PDF', { status: 500 });
  }
} 