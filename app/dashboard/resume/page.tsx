'use client';

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Sparkles, Plus } from 'lucide-react';

const options = [
  {
    title: 'Existing Resume',
    description: 'Select or upload a resume to start editing',
    icon: <FileText className="w-8 h-8 text-blue-400" />,
    href: '/dashboard/resume/select',
  },
  {
    title: 'AI Prompt',
    description: 'Generate a resume using a custom prompt',
    icon: <Sparkles className="w-8 h-8 text-purple-400" />,
    href: '/dashboard/resume/aiprompt',
  },
  {
    title: 'Blank Template',
    description: 'Start with a blank resume template',
    icon: <Plus className="w-8 h-8 text-green-400" />,
    href: '/dashboard/resume/blank',
  },
];

export default function ResumePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4">
      <h1 className="text-3xl font-bold mt-12 mb-10 text-center text-white">
       How Would You Like to Create Your Resume?
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {options.map((option) => (
          <Card
            key={option.title}
            className="bg-[#18181b] border border-white/10 text-white cursor-pointer hover:shadow-2xl hover:border-blue-500 transition-all p-8 flex flex-col items-center justify-center min-h-[220px]"
            onClick={() => router.push(option.href)}
          >
            <div className="mb-4">{option.icon}</div>
            <CardHeader className="text-center p-0 mb-2">
              <CardTitle className="text-xl font-semibold mb-2">{option.title}</CardTitle>
              <CardDescription className="text-gray-400 text-base">{option.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
} 