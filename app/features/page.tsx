'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, FileText, Bell, Brain, Code, Zap, Shield, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Features', path: '/features' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'Docs', path: '/docs' },
];

const features = [
  {
    icon: <Sparkles className="h-8 w-8 text-white" />,
    title: 'AI Portfolio Builder',
    description: 'Create stunning, professional portfolios in minutes. Our AI analyzes your experience and creates a personalized showcase that highlights your strengths.',
    image: '/images/portfolio-builder.png'
  },
  {
    icon: <FileText className="h-8 w-8 text-white" />,
    title: 'Smart Résumé Generator',
    description: 'Generate ATS-optimized résumés and cover letters tailored to each job description. Our AI ensures your application stands out.',
    image: '/images/resume-generator.png'
  },
  {
    icon: <Bell className="h-8 w-8 text-white" />,
    title: 'Intelligent Job Alerts',
    description: 'Get personalized job recommendations based on your skills, experience, and preferences. Never miss the perfect opportunity.',
    image: '/images/job-alerts.png'
  },
  {
    icon: <Brain className="h-8 w-8 text-white" />,
    title: 'AI Interview Coach',
    description: 'Practice interviews with our AI coach. Get real-time feedback and improve your responses to common interview questions.',
    image: '/images/interview-coach.png'
  },
  {
    icon: <Code className="h-8 w-8 text-white" />,
    title: 'Code Portfolio Integration',
    description: 'Automatically showcase your GitHub projects and contributions. Let your code speak for itself.',
    image: '/images/portfolio-builder.png'
  },
  {
    icon: <Zap className="h-8 w-8 text-white" />,
    title: 'One-Click Applications',
    description: 'Apply to multiple jobs with a single click. Our AI customizes your application for each position.',
    image: '/images/resume-generator.png'
  }
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Image src="/images/logo.svg" alt="OlioAI" width={32} height={32} />
              <span className="ml-2 text-xl font-semibold">OlioAI</span>
            </div>

            {/* Center Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Right Navigation */}
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white">
                Login
              </Link>
              <Button
                className="bg-white text-black hover:bg-gray-100 border-none"
                onClick={() => window.location.href = '/signup'}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-40 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ display: 'block' }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Powerful Features for Your Career
              </h1>
              <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Everything you need to build your professional presence and land your dream job.
              </p>
            </motion.div>
          </div>

          {/* Features Grid */}
          <div className="space-y-24">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}
              >
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="bg-zinc-900 rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-colors">
                      <div className="mb-6">{feature.icon}</div>
                      <h2 className="text-2xl font-semibold mb-4">{feature.title}</h2>
                      <p className="text-lg text-gray-300 leading-relaxed mb-6">
                        {feature.description}
                      </p>
                      <Button
                        className="bg-white text-black hover:bg-gray-100 border-none"
                        onClick={() => window.location.href = '/signup'}
                      >
                        Learn More
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </motion.div>
                </div>
                <div className={`relative h-[400px] ${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      className="object-cover rounded-2xl"
                    />
                  </motion.div>
                </div>
              </div>
            ))}
          </div>

          {/* Final CTA */}
          <div className="text-center mt-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              style={{ display: 'block' }}
            >
              <h2 className="text-2xl font-semibold mb-6">Ready to transform your career?</h2>
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-100 px-10 py-6 text-lg"
                onClick={() => window.location.href = '/signup'}
              >
                Get Started for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 