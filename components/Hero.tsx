// components/Hero.tsx
'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

const features = [
  {
    icon: '🎨',
    title: 'AI Portfolio Builder',
    description: 'Auto-generates a stunning, fully-hosted site with your skills, projects, and achievements — no design skills needed.',
    image: '/images/portfolio-builder.png'
  },
  {
    icon: '📄',
    title: 'Résumé & Cover Letter Generator',
    description: 'One-click, ATS-optimized documents tailored to each job description.',
    image: '/images/resume-generator.png'
  },
  {
    icon: '💡',
    title: 'Job Alerts, Smarter',
    description: 'Cut through the noise. Receive handpicked jobs based on your skillset and preferences.',
    image: '/images/job-alerts.png'
  },
  {
    icon: '🧠',
    title: 'AI Interview Coach',
    description: "Real-time mock interviews with actionable feedback. Train like it's game day.",
    image: '/images/interview-coach.png'
  }
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function Hero() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <motion.h1 
              {...fadeInUp}
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6"
            >
              Your AI Career Edge
            </motion.h1>
            <motion.p 
              {...fadeInUp}
              transition={{ delay: 0.1 }}
              className="text-xl sm:text-2xl text-gray-400 mb-8"
            >
              Portfolios, résumés, interviews — simplified.
            </motion.p>
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-100 px-8 py-6 text-lg"
                asChild
              >
                <Link href="/signup">Get Started →</Link>
              </Button>
            </motion.div>
          </div>

          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.3 }}
            className="text-center mb-16"
          >
            <p className="text-lg text-gray-400 mb-4">
              Early-career? Career-switching?
            </p>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Spend less time building portfolios and more time getting hired.
              OlioAI turns your raw info — a CV, LinkedIn URL, or even a Q&A — into everything you need to stand out.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                {...fadeInUp}
                transition={{ delay: 0.1 * index }}
                className="bg-zinc-900 rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{feature.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </div>
                </div>
                <div className="mt-6 relative aspect-[16/9] w-full overflow-hidden rounded-lg">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Callout Block */}
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.5 }}
            className="bg-zinc-900 rounded-2xl p-8 border border-white/10 mb-16"
          >
            <h2 className="text-2xl font-bold mb-4">From Raw to Ready in Minutes</h2>
            <p className="text-gray-400 mb-6">
              Drop a résumé, paste your LinkedIn, or answer a few questions — and OlioAI gets to work.
              No templates. No guessing. Just results.
            </p>
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/process-demo.png"
                alt="Process Demo"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </motion.div>

          {/* Testimonial */}
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.6 }}
            className="text-center mb-16"
          >
            <blockquote className="text-xl text-gray-400 italic mb-4">
              "I went from zero to portfolio + CV + interviews in one weekend. OlioAI is the career copilot I didn't know I needed."
            </blockquote>
            <p className="text-white font-medium">— Anjali S., Junior Data Scientist</p>
          </motion.div>

          {/* Final CTA */}
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.7 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold mb-6">Get job-ready in less than 30 minutes.</h2>
            <Button
              size="lg"
              className="bg-white text-black hover:bg-gray-100 px-8 py-6 text-lg"
              asChild
            >
              <Link href="/signup">Start for Free →</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
