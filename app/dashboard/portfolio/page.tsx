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
    thumbnail: '/images/tech.png',
    colors: ['#1a365d', '#2c5282', '#4299e1', '#63b3ed']
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Clean and minimal design with earthy tones and subtle animations',
    thumbnail: '/images/minimal.png',
    colors: ['#D4A76A', '#7D9F7D', '#A67C52','#E6D5AC']
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Artistic design with gradient backgrounds and creative elements',
    thumbnail: '/images/create.png',
    colors: ['#FF6B6B', '#4ECDC4', '#2C3E50','#FFE66D']
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Modern black and white design for a clean, professional look',
    thumbnail: '/images/profess.png',
    colors: ['#2c3e50', '#34495e', '#e74c3c', '#7f8c8d']
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Bold neon colors on dark background for a tech-forward look',
    thumbnail: '/images/cyber.png',
    colors: ['#000000', '#00FF00', '#FF00FF', '#00FFFF']
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Elegant dark theme with modern typography and subtle highlights',
    thumbnail: '/images/dark.png',
    colors: ['#7c3aed', '#4c1d95', '#181828','#fbbf24']
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
        <div className="flex justify-center items-center mb-8">
          <h1 className="text-3xl font-bold">Choose Your Portfolio Template</h1>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-3 gap-4">
          {templates.map((template) => (
            <MotionCard
              key={template.id}
              className="group border-none bg-[#18181b]/90 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden hover:bg-[#18181b] transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="relative h-40 w-full overflow-hidden text-white">
                <Image
                  src={template.thumbnail}
                  alt={template.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <CardHeader> 
                <div className="flex items-center justify-between">
                  <CardTitle
                    className="text-xl font-semibold"
                    style={{ color: template.colors[template.colors.length - 1] }}
                  >
                    {template.name}
                  </CardTitle>
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
              <CardContent className="pb-6 flex flex-col items-center">
                <Button
                  className="w-full bg-white/10 text-white hover:bg-white/20 border border-white/20 mt-2"
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