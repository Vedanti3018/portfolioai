'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Book, Code, Settings, HelpCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Features', path: '/features' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'Docs', path: '/docs' },
];

const sections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: <Book className="h-6 w-6 text-white" />,
    content: 'Learn how to set up your account and start using OlioAI to build your professional presence.'
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    icon: <Code className="h-6 w-6 text-white" />,
    content: 'Detailed documentation for integrating OlioAI into your applications.'
  },
  {
    id: 'configuration',
    title: 'Configuration',
    icon: <Settings className="h-6 w-6 text-white" />,
    content: 'Customize your experience with advanced settings and preferences.'
  },
  {
    id: 'support',
    title: 'Support',
    icon: <HelpCircle className="h-6 w-6 text-white" />,
    content: 'Get help with common issues and learn about best practices.'
  }
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('getting-started');

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Image src="/logo.svg" alt="OlioAI" width={32} height={32} />
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
                variant="outline"
                className="bg-white text-black hover:bg-gray-100 border-none"
                onClick={() => window.location.href = '/signup'}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-40 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'block' }}
            className="text-center mb-32"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Documentation
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Everything you need to know about using OlioAI effectively.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-white text-black'
                        : 'text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {section.icon}
                      <span className="font-medium">{section.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                style={{ display: 'block' }}
                className="bg-zinc-900 rounded-2xl p-8 border border-white/10"
              >
                <h2 className="text-2xl font-semibold mb-6">
                  {sections.find(s => s.id === activeSection)?.title}
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-8">
                  {sections.find(s => s.id === activeSection)?.content}
                </p>
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={() => window.location.href = '/signup'}
                >
                  Learn More
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 