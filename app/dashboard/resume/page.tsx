'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

const MotionCard = motion(Card);

// Define resume templates with sample images and color swatches
const templates = [
  {
    id: 'ats-modern',
    name: 'ATS Modern',
    description: 'Clean, professional design optimized for ATS systems with clear section hierarchy',
    thumbnail: '/templates/resume-ats-modern.png',
    colors: ['#000000', '#333333', '#666666', '#999999']
  },
  {
    id: 'ats-classic',
    name: 'ATS Classic',
    description: 'Traditional format with optimal readability and ATS compatibility',
    thumbnail: '/templates/resume-ats-classic.png',
    colors: ['#000000', '#333333', '#666666', '#999999']
  },
  {
    id: 'ats-minimal',
    name: 'ATS Minimal',
    description: 'Minimalist design focused on content and ATS optimization',
    thumbnail: '/templates/resume-ats-minimal.png',
    colors: ['#000000', '#333333', '#666666', '#999999']
  }
];

export default function ResumePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }
      } catch (err) {
        console.error('Error checking auth:', err);
        setError('Failed to verify authentication');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] text-white p-8">
        <MotionCard
          className="w-full max-w-md border-none bg-[#18181b]/90 rounded-2xl shadow-2xl backdrop-blur-md text-center p-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <CardContent className="space-y-4">
            <h2 className="text-xl font-semibold text-red-500">Error</h2>
            <p className="text-gray-400">{error}</p>
            <Button onClick={() => router.push('/login')}>Back to Login</Button>
          </CardContent>
        </MotionCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Choose Your Resume Template</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <MotionCard
              key={template.id}
              className="group border-none bg-[#18181b]/90 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden hover:bg-[#18181b] transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={template.thumbnail}
                  alt={template.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">{template.name}</CardTitle>
                  <div className="flex gap-1">
                    {template.colors.map((color, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded-sm border border-white/20"
                        style={{ backgroundColor: color }}
                        title={`Color ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-300">{template.description}</p>
                <Button
                  className="w-full bg-white/10 text-white hover:bg-white/20 border border-white/20"
                  onClick={() => router.push(`/dashboard/resume/preview/${template.id}`)}
                >
                  Use Template
                </Button>
              </CardContent>
            </MotionCard>
          ))}
        </div>
      </div>
    </div>
  );
} 