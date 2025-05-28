'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';
import { Home, Briefcase, FileText, Mail, Bell, LayoutDashboard, FolderOpen, Settings, CreditCard, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MotionCard = motion(Card);

const sidebarItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Portfolio', path: '/dashboard/portfolio', icon: Briefcase },
  { name: 'Resume', path: '/dashboard/resume', icon: FileText },
  { name: 'Cover Letters', path: '/dashboard/cover-letters', icon: Mail },
  { name: 'Job Alerts', path: '/dashboard/job-alerts', icon: Bell },
  { name: 'Recent Projects', path: '/dashboard/projects', icon: FolderOpen },
  // { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  // { name: 'Billing', path: '/dashboard/billing', icon: CreditCard },
  // { name: 'Profile', path: '/dashboard/profile', icon: User },
];

const features = [
  {
    title: 'AI Portfolio Builder',
    description: 'Generates a responsive, host-ready site from your inputs.',
    image: '/images/port.png',
    link: '/dashboard/portfolio'
  },
  {
    title: 'AI CV Generator',
    description: 'Creates ATS-friendly PDF/docx résumés.',
    image: '/images/resum.png',
    link: '/dashboard/resume'
  },
  {
    title: 'AI Cover-Letter Writer',
    description: 'One-click, job-specific letters tailored to your data.',
    image: '/images/cover.png',
    link: '/dashboard/cover-letters'
  },
  {
    title: 'Job-Opening Alert Engine',
    description: 'Personalized job alerts via email & in-app.',
    image: '/images/job-alerts.png',
    link: '/dashboard/job-alerts'
  },
];

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, [supabase.auth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#18181b] via-[#101014] to-[#23232a]">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  // Redirect unauthenticated users to login
  if (!user) {
    router.push('/login');
    return null; // Prevent rendering until redirect
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex">
      {/* Right Sidebar */}
      <div className="w-64 bg-black border-r border-white/10 p-6 space-y-6 fixed top-16 left-0 bottom-0 hidden md:block">
        {/* Removed user profile section as it is in Navbar */}
        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <Link key={item.path} href={item.path} className="flex items-center space-x-3 text-gray-400 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md transition-colors">
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-8 md:ml-64 pt-24">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {/* Manage Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6">Manage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Link href={feature.link} key={index}>
                <MotionCard
                  className="bg-[#18181b] border border-white/10 text-white rounded-lg overflow-hidden h-full"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  {feature.image && (
                    <div className="w-full h-32 relative">
                       <Image
                         src={feature.image}
                         alt={feature.title}
                         fill
                         sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                         style={{ objectFit: 'cover' }}
                       />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-400">{feature.description}</p>
                  </CardContent>
                </MotionCard>
              </Link>
            ))}
          </div>
        </section>

        {/* AI Interview Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6">AI Interview</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MotionCard
              className="bg-[#18181b] border border-white/10 text-white rounded-lg overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: features.length * 0.1 }}
            >
              <CardContent className="p-6 space-y-4">
                <span className="text-blue-400 font-semibold text-sm">New</span>
                <h3 className="text-lg font-semibold">AI Interview</h3>
                <p className="text-sm text-gray-400">Practice your interview skills with our AI-powered interview simulator.</p>
                <Button className="bg-white text-black hover:bg-gray-100 border-none font-semibold px-4 py-2 rounded-md">
                  Start Interview
                </Button>
              </CardContent>
            </MotionCard>

             <div className="w-full h-48 relative rounded-lg overflow-hidden">
                <Image
                  src="/images/interview-coach.png"
                  alt="AI Interview Coach"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  style={{ objectFit: 'cover' }}
                />
             </div>

          </div>
        </section>

        {/* Add more sections for other features like Optimizer, Coaching, etc. */}
      </main>
    </div>
  );
} 