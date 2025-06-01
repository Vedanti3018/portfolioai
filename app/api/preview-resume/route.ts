import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('templateId');
    const resumeId = searchParams.get('resumeId');

    if (!templateId || !resumeId) {
      return NextResponse.json(
        { error: 'Missing templateId or resumeId' },
        { status: 400 }
      );
    }

    // Fetch resume data
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .single();

    if (resumeError || !resume) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }

    // Read template file
    const templatePath = path.join(process.cwd(), 'portfolio-templates', `${templateId}.html`);
    const templateContent = fs.readFileSync(templatePath, 'utf-8');

    // Compile template
    const template = Handlebars.compile(templateContent);
    const html = template(resume);

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error generating resume preview:', error);
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    );
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