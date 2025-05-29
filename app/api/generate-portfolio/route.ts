import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import path from 'path';
import fs from 'fs/promises';
import jszip from 'jszip';
import JSZip from 'jszip';

// Helper function to render Handlebars-style templates
function renderTemplate(template: string, data: any): string {
  // Replace basic variables
  let rendered = template
    .replace(/{{name}}/g, data.basic_info?.name || '')
    .replace(/{{title}}/g, data.basic_info?.current_designation || '')
    .replace(/{{email}}/g, data.basic_info?.email || '')
    .replace(/{{phone}}/g, data.basic_info?.phone || '')
    .replace(/{{country}}/g, data.basic_info?.country || '')
    .replace(/{{description}}/g, data.description || '')
    .replace(/{{currentYear}}/g, new Date().getFullYear().toString());

  // Handle social links conditionally
  if (data.linkedin_url) {
    rendered = rendered.replace(/{{#if linkedin}}([\s\S]*?){{\/if}}/g, '$1');
    rendered = rendered.replace(/{{linkedin}}/g, data.linkedin_url);
  } else {
    rendered = rendered.replace(/{{#if linkedin}}[\s\S]*?{{\/if}}/g, '');
  }

  if (data.github_url) {
    rendered = rendered.replace(/{{#if github}}([\s\S]*?){{\/if}}/g, '$1');
    rendered = rendered.replace(/{{github}}/g, data.github_url);
  } else {
    rendered = rendered.replace(/{{#if github}}[\s\S]*?{{\/if}}/g, '');
  }

  // Handle skills sections
  if (data.skills) {
    // Technical skills
    if (data.skills.technical_skills?.length > 0) {
      const technicalSkillsHtml = data.skills.technical_skills
        .map((skill: string) => `<li>${skill}</li>`)
        .join('');
      rendered = rendered.replace(/{{#each skills\.technical_skills}}([\s\S]*?){{\/each}}/g, technicalSkillsHtml);
    } else {
      rendered = rendered.replace(/{{#each skills\.technical_skills}}[\s\S]*?{{\/each}}/g, '');
    }

    // Soft skills
    if (data.skills.soft_skills?.length > 0) {
      const softSkillsHtml = data.skills.soft_skills
        .map((skill: string) => `<li>${skill}</li>`)
        .join('');
      rendered = rendered.replace(/{{#each skills\.soft_skills}}([\s\S]*?){{\/each}}/g, softSkillsHtml);
    } else {
      rendered = rendered.replace(/{{#each skills\.soft_skills}}[\s\S]*?{{\/each}}/g, '');
    }

    // Languages
    if (data.skills.languages?.length > 0) {
      const languagesHtml = data.skills.languages
        .map((lang: string) => `<li>${lang}</li>`)
        .join('');
      rendered = rendered.replace(/{{#each skills\.languages}}([\s\S]*?){{\/each}}/g, languagesHtml);
    } else {
      rendered = rendered.replace(/{{#each skills\.languages}}[\s\S]*?{{\/each}}/g, '');
    }
  }

  // Handle experience section
  if (data.experience?.length > 0) {
    const experienceHtml = data.experience
      .map((exp: any) => `
        <div class="experience-item">
          <h3>${exp.company || ''}</h3>
          <p class="position">${exp.position || ''}</p>
          <p class="date">${exp.start_date || ''} - ${exp.end_date || ''}</p>
          <p class="description">${exp.description || ''}</p>
        </div>
      `)
      .join('');
    rendered = rendered.replace(/{{#each experience}}([\s\S]*?){{\/each}}/g, experienceHtml);
  } else {
    rendered = rendered.replace(/{{#each experience}}[\s\S]*?{{\/each}}/g, '');
  }

  // Handle education section
  if (data.education?.length > 0) {
    const educationHtml = data.education
      .map((edu: any) => `
        <div class="education-item">
          <h3>${edu.institution || ''}</h3>
          <p class="degree">${edu.degree || ''} in ${edu.field_of_study || ''}</p>
          <p class="date">${edu.start_date || ''} - ${edu.end_date || ''}</p>
          <p class="description">${edu.description || ''}</p>
        </div>
      `)
      .join('');
    rendered = rendered.replace(/{{#each education}}([\s\S]*?){{\/each}}/g, educationHtml);
  } else {
    rendered = rendered.replace(/{{#each education}}[\s\S]*?{{\/each}}/g, '');
  }

  // Handle projects section
  if (data.projects?.length > 0) {
    const projectsHtml = data.projects
      .map((project: any) => `
        <div class="project-item">
          <h3>${project.name || ''}</h3>
          <p class="date">${project.start_date || ''} - ${project.end_date || ''}</p>
          <p class="description">${project.description || ''}</p>
          ${project.url ? `<a href="${project.url}" target="_blank">View Project <i class="fas fa-external-link-alt"></i></a>` : ''}
        </div>
      `)
      .join('');
    rendered = rendered.replace(/{{#each projects}}([\s\S]*?){{\/each}}/g, projectsHtml);
  } else {
    rendered = rendered.replace(/{{#each projects}}[\s\S]*?{{\/each}}/g, '');
  }

  // Handle certifications section
  if (data.certifications?.length > 0) {
    const certificationsHtml = data.certifications
      .map((cert: any) => `
        <div class="certification-item">
          <h3>${cert.name || ''}</h3>
          <p class="issuer">Issued by: ${cert.issuer || ''}</p>
          <p class="date">Date: ${cert.date || ''}</p>
          ${cert.url ? `<a href="${cert.url}" target="_blank">View Certificate <i class="fas fa-external-link-alt"></i></a>` : ''}
        </div>
      `)
      .join('');
    rendered = rendered.replace(/{{#each certifications}}([\s\S]*?){{\/each}}/g, certificationsHtml);
  } else {
    rendered = rendered.replace(/{{#each certifications}}[\s\S]*?{{\/each}}/g, '');
  }

  // Handle testimonials section
  if (data.testimonials?.length > 0) {
    const testimonialsHtml = data.testimonials
      .map((testimonial: any) => `
        <div class="testimonial-item">
          <div class="testimonial-header">
            <img src="${testimonial.photo || ''}" alt="${testimonial.name || ''}" class="testimonial-photo">
            <div class="testimonial-info">
              <h3>${testimonial.name || ''}</h3>
              <p class="date">${testimonial.date || ''}</p>
              <div class="rating">
                ${'★'.repeat(testimonial.rating || 0)}${'☆'.repeat(5 - (testimonial.rating || 0))}
              </div>
            </div>
          </div>
          <p class="testimonial-text">${testimonial.text || ''}</p>
        </div>
      `)
      .join('');
    rendered = rendered.replace(/{{#if testimonials}}([\s\S]*?){{\/if}}/g, '$1');
    rendered = rendered.replace(/{{#each testimonials}}([\s\S]*?){{\/each}}/g, testimonialsHtml);
  } else {
    rendered = rendered.replace(/{{#if testimonials}}[\s\S]*?{{\/if}}/g, '');
  }

  return rendered;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const templateFileName = searchParams.get('template');

  if (!templateFileName) {
    return NextResponse.json({ error: 'Template file name is required' }, { status: 400 });
  }
  
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // 1. Fetch user portfolio data from Supabase
    const { data: portfolio, error: fetchError } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means 'no rows found'
      console.error('Error fetching portfolio data for download:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch portfolio data' }, { status: 500 });
    }

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio data not found. Please save your portfolio first.' }, { status: 404 });
    }

    // Prepare data for the template from the fetched portfolio
    const userData = {
        user: {
            name: portfolio.basic_info?.name || portfolio.title || '',
            email: portfolio.basic_info?.email || '',
            phone: portfolio.basic_info?.phone || '',
            country: portfolio.basic_info?.country || '',
            current_designation: portfolio.basic_info?.current_designation || '',
        },
        portfolio: {
            title: portfolio.title || '',
            description: portfolio.description || '',
            theme: portfolio.theme || 'dark',
        },
        skills: portfolio.skills || { technical_skills: [], soft_skills: [], languages: [] },
        education: portfolio.education || [],
        experience: portfolio.experience || [],
        projects: portfolio.projects || [],
        certifications: portfolio.certifications || [],
    };

    // 2. Render the template
    const generatedHtml = await renderTemplate(templateFileName, userData);
    
    // 3. Create a new JSZip instance and add the generated HTML
    const zip = new jszip();
    zip.file('index.html', generatedHtml);

    // 4. Generate the zip file content
    const zipContent = await zip.generateAsync({ type: 'nodebuffer' });

    // 5. Send the zip file as a download
    return new NextResponse(zipContent, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="portfolio.zip"',
      },
    });

  } catch (error) {
    console.error('Error generating portfolio for download:', error);
    return NextResponse.json({ error: 'Failed to generate portfolio for download' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log('[API] /api/generate-portfolio POST handler entered');
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('[API] No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request data
    const { portfolioData, templateId } = await request.json();
    console.log('[API] Received data:', { portfolioData, templateId });
    if (!portfolioData || !templateId) {
      console.log('[API] Missing required data');
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const isPreview = searchParams.get('preview') === 'true';
    console.log('[API] isPreview:', isPreview);

    // Read the template HTML file
    const templatePath = path.join(process.cwd(), 'portfolio-templates', `${templateId}.html`);
    let templateHtml = await fs.readFile(templatePath, 'utf-8');
    console.log('[API] Loaded template HTML from:', templatePath);

    // Read the corresponding CSS file
    const cssPath = path.join(process.cwd(), 'portfolio-templates', `${templateId}.css`);
    let cssContent = '';
    try {
      cssContent = await fs.readFile(cssPath, 'utf-8');
      console.log('[API] Loaded CSS from:', cssPath);
    } catch (error) {
      console.warn(`[API] CSS file not found for template ${templateId}`);
    }

    // Render the template with the portfolio data
    const renderedHtml = renderTemplate(templateHtml, portfolioData);
    console.log('[API] Rendered HTML length:', renderedHtml.length);

    // For preview mode, return the HTML with embedded CSS
    if (isPreview) {
      const htmlWithCss = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${cssContent}</style>
        </head>
        <body>
          ${renderedHtml}
        </body>
        </html>
      `;
      console.log('[API] Returning preview HTML');
      return new NextResponse(htmlWithCss, {
        headers: {
          'Content-Type': 'text/html',
        }
      });
    }

    // For download mode, create a zip file
    console.log('[API] Creating zip file...');
    const zip = new JSZip();
    zip.file('index.html', renderedHtml);
    zip.file('styles.css', cssContent);

    // Generate zip file
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    console.log('[API] Zip file generated, size:', (zipBlob as any).size || 'unknown');

    // Return the zip file
    console.log('[API] Returning zip file response');
    return new NextResponse(zipBlob, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="portfolio-${templateId}.zip"`
      }
    });

  } catch (error) {
    console.error('[API] Error generating portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to generate portfolio' },
      { status: 500 }
    );
  }
}

function generateSectionHtml(section: string, data: any): string {
  switch (section) {
    case 'education':
      return data.map((edu: any) => `
        <div class="education-item">
          <h3>${edu.institution}</h3>
          <p class="degree">${edu.degree} in ${edu.field_of_study}</p>
          <p class="date">${edu.start_date} - ${edu.end_date}</p>
          <p class="description">${edu.description}</p>
        </div>
      `).join('');

    case 'experience':
      return data.map((exp: any) => `
        <div class="experience-item">
          <h3>${exp.company}</h3>
          <p class="position">${exp.position}</p>
          <p class="date">${exp.start_date} - ${exp.end_date}</p>
          <p class="description">${exp.description}</p>
        </div>
      `).join('');

    case 'projects':
      return data.map((project: any) => `
        <div class="project-item">
          <h3>${project.name}</h3>
          <p class="date">${project.start_date} - ${project.end_date}</p>
          <p class="description">${project.description}</p>
          ${project.url ? `<a href="${project.url}" target="_blank">View Project</a>` : ''}
        </div>
      `).join('');

    case 'skills':
      return `
        <div class="skills-container">
          <div class="technical-skills">
            <h3>Technical Skills</h3>
            <ul>${data.technical_skills.map((skill: string) => `<li>${skill}</li>`).join('')}</ul>
          </div>
          <div class="soft-skills">
            <h3>Soft Skills</h3>
            <ul>${data.soft_skills.map((skill: string) => `<li>${skill}</li>`).join('')}</ul>
          </div>
          <div class="languages">
            <h3>Languages</h3>
            <ul>${data.languages.map((lang: string) => `<li>${lang}</li>`).join('')}</ul>
          </div>
        </div>
      `;

    case 'certifications':
      return data.map((cert: any) => `
        <div class="certification-item">
          <h3>${cert.name}</h3>
          <p class="issuer">${cert.issuer}</p>
          <p class="date">${cert.date}</p>
          ${cert.url ? `<a href="${cert.url}" target="_blank">View Certificate</a>` : ''}
        </div>
      `).join('');

    case 'testimonials':
      return data.map((testimonial: any) => `
        <div class="testimonial-item">
          <div class="testimonial-header">
            <img src="${testimonial.photo}" alt="${testimonial.name}" class="testimonial-photo">
            <div class="testimonial-info">
              <h3>${testimonial.name}</h3>
              <p class="date">${testimonial.date}</p>
              <div class="rating">${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}</div>
            </div>
          </div>
          <p class="testimonial-text">${testimonial.text}</p>
        </div>
      `).join('');

    default:
      return '';
  }
} 