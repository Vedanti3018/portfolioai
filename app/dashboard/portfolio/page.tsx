'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const MotionCard = motion(Card);

// Define templates with sample images and color swatches
const templates = [
  {
    id: 'tech-developer',
    name: 'Tech Developer',
    description: 'Modern tech-focused design with code-inspired elements and interactive features',
    thumbnail: '/templates/tech-developer.png',
    colors: ['#1a365d', '#2c5282', '#4299e1', '#63b3ed']
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Clean and minimal design with earthy tones and subtle animations',
    thumbnail: '/templates/minimalist.png',
    colors: ['#E6D5AC', '#7D9F7D', '#A67C52', '#D4A76A']
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Artistic design with gradient backgrounds and creative elements',
    thumbnail: '/templates/creative-professional.png',
    colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#2C3E50']
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Modern black and white design for a clean, professional look',
    thumbnail: '/templates/professional.png',
    colors: ['#2c3e50', '#34495e', '#e74c3c', '#7f8c8d']
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Bold neon colors on dark background for a tech-forward look',
    thumbnail: '/templates/cyberpunk.png',
    colors: ['#000000', '#00FF00', '#FF00FF', '#00FFFF']
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Elegant dark theme with modern typography and subtle highlights',
    thumbnail: '/templates/dark.png',
    colors: ['#7c3aed', '#4c1d95', '#fbbf24', '#181828']
  }
];

export default function PortfolioPage() {
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
          <h1 className="text-3xl font-bold">Choose Your Portfolio Template</h1>
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
                  onClick={() => router.push(`/dashboard/portfolio/preview/${template.id}`)}
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