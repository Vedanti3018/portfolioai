import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import { compile } from 'handlebars';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('templateId');
    const resumeData = searchParams.get('resumeData');

    if (!templateId) {
      return new NextResponse('Template ID is required', { status: 400 });
    }

    // Get the user's session
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Load the template HTML
    const templatePath = path.join(process.cwd(), 'resume-templates', `${templateId}.html`);
    const templateContent = fs.readFileSync(templatePath, 'utf-8');

    // Compile the template
    const template = compile(templateContent);

    // Parse the resume data
    const parsedResumeData = resumeData ? JSON.parse(decodeURIComponent(resumeData)) : null;

    // Render the template with the resume data
    const html = template(parsedResumeData || {});

    // Return the rendered HTML
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error generating resume preview:', error);
    return new NextResponse('Error generating resume preview', { status: 500 });
  }
}

function generateResumeHtml(template: string, resumeData: any) {
  if (!resumeData) {
    return template; // Return template with empty data
  }

  // Replace placeholders in the template with actual data
  let html = template;

  // Personal Information
  const personal = resumeData.content.personal;
  html = html.replace(/{{name}}/g, personal.name || '');
  html = html.replace(/{{title}}/g, personal.title || '');
  html = html.replace(/{{email}}/g, personal.email || '');
  html = html.replace(/{{phone}}/g, personal.phone || '');
  html = html.replace(/{{location}}/g, personal.location || '');
  html = html.replace(/{{summary}}/g, personal.summary || '');

  // Experience
  const experienceHtml = resumeData.content.experience
    .map((exp: any) => `
      <div class="item">
        <div class="item-header">
          <div class="item-title">${exp.position}</div>
          <div class="item-subtitle">${exp.company}</div>
          <div class="item-date">${exp.startDate} - ${exp.endDate}</div>
        </div>
        <div class="item-description">${exp.description}</div>
      </div>
    `)
    .join('');
  html = html.replace(/{{experience}}/g, experienceHtml);

  // Education
  const educationHtml = resumeData.content.education
    .map((edu: any) => `
      <div class="item">
        <div class="item-header">
          <div class="item-title">${edu.degree} in ${edu.field}</div>
          <div class="item-subtitle">${edu.school}</div>
          <div class="item-date">${edu.startDate} - ${edu.endDate}</div>
        </div>
      </div>
    `)
    .join('');
  html = html.replace(/{{education}}/g, educationHtml);

  // Skills
  const skillsHtml = resumeData.content.skills
    .map((skill: string) => `<div class="skill-item">${skill}</div>`)
    .join('');
  html = html.replace(/{{skills}}/g, skillsHtml);

  return html;
} 