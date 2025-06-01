// components/Hero.tsx
'use client';

import { motion, useScroll, useTransform, HTMLMotionProps } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { FaLinkedin, FaXTwitter, FaYoutube, FaPinterest, FaFacebook } from 'react-icons/fa6';

const features = [
  {
    icon: '🎨',
    title: 'AI Portfolio Builder',
    description:
      'Paste your LinkedIn, upload a résumé, or answer guided questions. OlioAI builds you a mobile-friendly, professional portfolio — instantly. Export as HTML or host on a custom subdomain.',
    image: '/images/port.png',
  },
  {
    icon: '📄',
    title: 'AI CV & Cover Letter Generator',
    description:
      'No résumé? No problem. We will extract your experience, skills, and metrics via dynamic prompts. One-click generation for tailored, job-specific cover letters with adjustable tone.',
    image: '/images/cover.png',
  },
  {
    icon: '📈',
    title: 'Resume & Portfolio Optimizer',
    description:
      'Get a real-time readiness score. Match your profile to any job description. See keyword gaps and rewrite suggestions instantly.',
    image: '/images/resum.png',
  },
  {
    icon: '🎙',
    title: 'AI Interview Coach',
    description:
      "Get grilled like it's game day. Role-specific questions, transcript feedback, confidence scoring, and improvement tips — all powered by AI.",
    image: '/images/interview-coach.png',
  },
  {
    icon: '🔔',
    title: 'Smart Job Alerts',
    description:
      'Cut through the noise. Receive handpicked jobs based on your skillset and preferences.',
    image: '/images/job-alerts.png',
  },
  {
    icon: '🧠',
    title: 'Skill Gap Analyzer',
    description:
      'Identify areas for improvement and receive personalized recommendations to enhance your profile.',
    image: '/images/skill-gap-analyzer.png',
  },
];

const testimonials = [
  {
    name: 'John Doe',
    role: 'Software Engineer',
    image: '/images/john-doe.jpg',
    feedback: 'OlioAI has been a game-changer for my job search. It helped me optimize my resume and cover letter in no time.'
  },
  {
    name: 'Jane Smith',
    role: 'Product Manager',
    image: '/images/jane-smith.jpg',
    feedback: 'The AI interview coach was incredibly helpful in preparing for my job interviews. I felt more confident after using it.'
  },
  {
    name: 'Mike Johnson',
    role: 'Data Scientist',
    image: '/images/mike-johnson.jpg',
    feedback: 'OlioAI has made my job search much more efficient. I can now apply to multiple jobs with ease.'
  },
];

const faqs = [
  {
    question: 'How long does it take to get a job using OlioAI?',
    answer: 'It depends on your job search strategy and the number of applications you make. However, our AI tools can help you optimize your job search and increase your chances of getting hired.'
  },
  {
    question: 'Can I use OlioAI if I don\'t have a LinkedIn account?',
    answer: 'Yes, you can use OlioAI even if you don\'t have a LinkedIn account. You can paste your résumé or answer guided questions to get started.'
  },
  {
    question: 'Is OlioAI free to use?',
    answer: 'Yes, OlioAI offers a free plan with essential job search tools. You can upgrade to a premium plan for advanced AI tools and features.'
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const floatingAnimation = {
  animate: {
    y: [0, -20, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      repeatType: "loop",
      ease: 'easeInOut',
    },
  },
};

const floatingAnimation2 = {
  animate: {
    x: [0, 20, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      repeatType: "loop",
      ease: 'easeInOut',
    },
  },
};

const parallaxImage = {
  initial: { y: 0 },
  animate: (custom: number) => ({
    y: custom,
    transition: { type: 'spring', stiffness: 30, damping: 20 },
  }),
};

// Type declarations for motion components
const MotionSection = motion.section;
const MotionDiv = motion.div;
const MotionH1 = motion.h1;
const MotionP = motion.p;
const MotionH2 = motion.h2;

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Sample card images for the row
  const cardImages = [
    '/images/port.png',
    '/images/cover.png',
    '/images/resum.png',
    '/images/opyi.png',
    '/images/sample-card5.png',
  ];

  // Features data
  const features = [
    {
      icon: '🧑‍💻',
      title: 'AI Portfolio Builder',
      description: 'Instantly create a professional portfolio from your LinkedIn or résumé.'
    },
    {
      icon: '📄',
      title: 'Resume Generator',
      description: 'Tailored, ATS-friendly documents in one click.'
    },
    {
      icon: '✉️',
      title: 'Cover Letter',
      description: 'Generate personalized cover letters for every job.'
    },
    {
      icon: '📊',
      title: 'Job Tracker',
      description: 'Organize and track all your applications in one place.'
    },
    {
      icon: '🧠',
      title: 'Skill Gap Analyzer',
      description: 'See where you stand and get personalized improvement tips.'
    },
  ];

  // Trusted by logos (placeholder)
  const trustedLogos = [
    '/images/logo1.png',
    '/images/logo2.png',
    '/images/logo3.png',
    '/images/logo4.png',
    '/images/logo5.png',
  ];

  // Stats
  const stats = [
    { value: '500k+', label: 'Job Seekers Served' },
    { value: '60%', label: 'Faster to Interviews' },
    { value: '2x', label: 'More Job Offers' },
  ];

  // Testimonials
  const testimonials = [
    {
      name: 'Jane Doe',
      role: 'Product Manager',
      image: '/images/jane.png',
      feedback: 'OlioAI helped me land my dream job in weeks!'
    },
    {
      name: 'John Smith',
      role: 'Software Engineer',
      image: '/images/john.png',
      feedback: 'The resume and cover letter tools are a game changer.'
    },
    {
      name: 'Priya Patel',
      role: 'Data Analyst',
      image: '/images/priya.png',
      feedback: 'Tracking my job applications has never been easier.'
    },
  ];

  // FAQ
  const faqs = [
    {
      question: 'How does OlioAI work?',
      answer: 'OlioAI uses AI to help you build portfolios, resumes, and cover letters, and track your job search in one place.'
    },
    {
      question: 'Is there a free plan?',
      answer: 'Yes! You can get started for free and upgrade for advanced features.'
    },
    {
      question: 'Can I use it without LinkedIn?',
      answer: 'Absolutely. You can upload your resume or answer a few questions to get started.'
    },
  ];

  // Pricing
  const pricing = [
    {
      plan: 'Free',
      price: '$0',
      features: [
        '1 Portfolio',
        'Basic Resume Generator',
        'Job Tracker',
        'Skill Gap Analyzer',
      ],
    },
    {
      plan: 'Premium',
      price: '$23.99/mo',
      features: [
        'Unlimited Portfolios',
        'Advanced Resume & Cover Letter',
        'Priority Support',
        'All Free Features',
      ],
    },
  ];

  // Footer columns
  const footerColumns = [
    {
      heading: 'Products',
      color: 'text-orange-400',
      links: ['LinkedIn Review', "Who's Hiring", 'Resume Review', 'Job Tracker', 'Resume Builder'],
    },
    {
      heading: 'Important',
      color: 'text-red-400',
      links: ['Free LinkedIn Review', "Who's Hiring", 'Premium Toolkit', 'Interview Guides', 'Job Search Tips', 'ChatGPT Guides', 'Help Center'],
    },
    {
      heading: 'Resources',
      color: 'text-yellow-400',
      links: ['Resume Template', 'Community', 'Job Search Blog', 'Gift Cards', 'Become an Affiliate'],
    },
    {
      heading: 'Company',
      color: 'text-green-400',
      links: ['About', 'Contact', 'Privacy', 'Terms'],
    },
  ];

  // Animated logo row (marquee)
  const marqueeLogos = [
    '/images/logo1.png',
    '/images/logo2.png',
    '/images/logo3.png',
    '/images/logo4.png',
    '/images/logo5.png',
    '/images/logo1.png',
    '/images/logo2.png',
    '/images/logo3.png',
    '/images/logo4.png',
    '/images/logo5.png',
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-x-clip">
      {/* Hero Section - Clean, Centered, Animated */}
      <section className="w-full flex flex-col items-center justify-center pt-32 pb-20 px-4">
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-6 leading-tight text-white">
          Your AI Career Edge
        </h1>
        <p className="text-xl text-gray-400 text-center mb-10">
          Portfolios, résumés, interviews — simplified.
        </p>
        <div className="mb-14">
          <Button
            size="lg"
            className="bg-white text-black hover:bg-gray-100 px-8 py-6 text-lg font-semibold rounded-xl shadow"
            asChild
          >
            <Link href="/signup">Create yours now! →</Link>
          </Button>
        </div>
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            initial: {},
            animate: {
              transition: { staggerChildren: 0.15 }
            }
          }}
          style={{ display: 'flex', flexDirection: 'row', alignItems: 'end', justifyContent: 'center', gap: '2rem', width: '100%', maxWidth: '48rem' }}
        >
          {cardImages.map((src, idx) => (
            <motion.div
              key={src}
              variants={{
                initial: { opacity: 0, y: 40 },
                animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
              }}
              style={{ borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 4px 32px #0004', background: '#18181b', border: '1px solid #27272a', width: '12rem', height: '16rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <img src={src} alt={`Sample card ${idx + 1}`} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* E-commerce Section */}
      <section className="w-full max-w-6xl mx-auto px-4 py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Premium Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pro Portfolio Builder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold mb-2">Pro Portfolio Builder</h3>
            <p className="text-gray-400 mb-6">Advanced customization, analytics, and unlimited portfolios.</p>
            <div className="mt-auto">
              <div className="mb-4">
                <span className="text-2xl font-bold">$19</span>
                <span className="text-gray-400">/month</span>
              </div>
              <Button className="w-full bg-white text-black hover:bg-gray-100">
                Get Started
              </Button>
            </div>
          </motion.div>

          {/* Resume & Cover Letter Pack */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-xl font-semibold mb-2">Resume & Cover Letter Pack</h3>
            <p className="text-gray-400 mb-6">AI-powered resume builder with ATS optimization and matching cover letters.</p>
            <div className="mt-auto">
              <div className="mb-4">
                <span className="text-2xl font-bold">$29</span>
                <span className="text-gray-400">/month</span>
              </div>
              <Button className="w-full bg-white text-black hover:bg-gray-100">
                Get Started
              </Button>
            </div>
          </motion.div>

          {/* Interview Pro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Interview Pro</h3>
            <p className="text-gray-400 mb-6">Advanced interview prep with AI coaching and performance analytics.</p>
            <div className="mt-auto">
              <div className="mb-4">
                <span className="text-2xl font-bold">$39</span>
                <span className="text-gray-400">/month</span>
              </div>
              <Button className="w-full bg-white text-black hover:bg-gray-100">
                Get Started
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Bundle Offer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl p-8 text-center"
        >
          <div className="inline-block bg-white/10 rounded-full px-4 py-1 text-sm font-medium text-white mb-4">
            BEST VALUE
          </div>
          <h3 className="text-2xl font-bold mb-2">All-Access Bundle</h3>
          <p className="text-gray-400 mb-6">Get access to all premium tools and future updates</p>
          <div className="mb-6">
            <span className="text-3xl font-bold">$49</span>
            <span className="text-gray-400">/month</span>
            <span className="ml-2 text-green-400">Save 55%</span>
          </div>
          <Button size="lg" className="bg-white text-black hover:bg-gray-100 px-8">
            Get the Bundle
          </Button>
        </motion.div>
      </section>

      {/* Trusted By Section */}
      <section className="w-full max-w-5xl mx-auto px-4 py-12 flex flex-col items-center">
        <p className="text-gray-400 text-lg mb-6 text-center">Trusted by 500,000+ job seekers</p>
        <div className="flex flex-row flex-wrap items-center justify-center gap-8 opacity-80">
          {trustedLogos.map((logo, idx) => (
            <img key={idx} src={logo} alt={`Logo ${idx + 1}`} className="h-10 w-auto grayscale opacity-80" />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-6xl mx-auto px-4 pb-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-shadow duration-200">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full max-w-5xl mx-auto px-4 py-24 flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1 flex flex-col items-center md:items-start">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center md:text-left">How It Works</h2>
          <div className="flex flex-col md:flex-row gap-8 w-full">
            <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-lg mb-6 md:mb-0">
              <h3 className="text-xl font-semibold mb-2 text-red-400">Before</h3>
              <ul className="text-gray-400 list-disc list-inside space-y-2">
                <li>Manual, time-consuming process</li>
                <li>Scattered tools and documents</li>
                <li>Constant rejections</li>
              </ul>
            </div>
            <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold mb-2 text-green-400">After</h3>
              <ul className="text-gray-400 list-disc list-inside space-y-2">
                <li>Automated, AI-powered workflow</li>
                <li>All-in-one platform</li>
                <li>More interviews, less stress</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Product Tour Section */}
      <section className="w-full max-w-6xl mx-auto px-4 py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Product Tour</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center text-center shadow-lg">
            <div className="text-4xl mb-4">🧑‍💻</div>
            <h3 className="text-xl font-semibold mb-2">Step 1: Import</h3>
            <p className="text-gray-400">Upload your résumé or connect your LinkedIn profile.</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center text-center shadow-lg">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Step 2: Generate</h3>
            <p className="text-gray-400">Let AI build your portfolio, resume, and cover letter instantly.</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center text-center shadow-lg">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold mb-2">Step 3: Apply & Track</h3>
            <p className="text-gray-400">Apply to jobs and track your progress in one dashboard.</p>
          </div>
        </div>
      </section>

      {/* Results / Stats Section */}
      <section className="w-full max-w-5xl mx-auto px-4 py-24 flex flex-col items-center">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Real Results for Job Seekers Like You</h2>
        <div className="flex flex-row flex-wrap items-center justify-center gap-12">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className="text-5xl font-bold text-white mb-2">{stat.value}</span>
              <span className="text-gray-400 text-lg text-center">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full max-w-6xl mx-auto px-4 py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center text-center shadow-lg">
              <img src={t.image} alt={t.name} className="w-16 h-16 rounded-full mb-4 object-cover" />
              <h3 className="font-semibold mb-1">{t.name}</h3>
              <p className="text-gray-400 text-sm mb-2">{t.role}</p>
              <p className="text-gray-300">{t.feedback}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full max-w-4xl mx-auto px-4 py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
              <p className="text-gray-400">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="w-full flex flex-col items-center justify-center py-24 px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">Ready to get hired faster?</h2>
        <Button size="lg" className="bg-white text-black hover:bg-gray-100 px-8 py-6 text-lg font-semibold rounded-xl shadow">
          Start for Free →
        </Button>
      </section>

      {/* Footer / Contact Section */}
      <footer className="w-full bg-black border-t border-zinc-800 py-16 px-4 flex flex-col md:flex-row items-start md:items-center justify-between max-w-7xl mx-auto gap-12 md:gap-0">
        {/* Left: Logo, Brand, Tagline, Socials */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="flex-1 flex flex-col items-start mb-8 md:mb-0"
        >
          <div className="flex items-center mb-4">
            <img src="/logo.svg" alt="OlioAI Logo" className="w-12 h-12 rounded-full mr-3" />
            <span className="text-2xl font-bold text-white">OlioAI</span>
          </div>
          <p className="text-gray-400 mb-6 max-w-xs">
            Your Career Copilot. AI-assisted tools and resources to get hired at top tech and startup companies 10X faster.
          </p>
          <div className="flex flex-row gap-4 text-2xl text-gray-400">
            <motion.span whileHover={{ color: '#0A66C2' }}>
              <a href="#" aria-label="LinkedIn"><FaLinkedin /></a>
            </motion.span>
            <motion.span whileHover={{ color: '#fff' }}>
              <a href="#" aria-label="X"><FaXTwitter /></a>
            </motion.span>
            <motion.span whileHover={{ color: '#FF0000' }}>
              <a href="#" aria-label="YouTube"><FaYoutube /></a>
            </motion.span>
            <motion.span whileHover={{ color: '#E60023' }}>
              <a href="#" aria-label="Pinterest"><FaPinterest /></a>
            </motion.span>
            <motion.span whileHover={{ color: '#1877F3' }}>
              <a href="#" aria-label="Facebook"><FaFacebook /></a>
            </motion.span>
          </div>
        </motion.div>
        {/* Right: Footer Columns */}
        <div className="flex-[2] grid grid-cols-2 md:grid-cols-4 gap-8 w-full md:w-auto">
          {footerColumns.map((col, idx) => (
            <motion.div
              key={col.heading}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 * idx }}
            >
              <div className="flex flex-col items-start">
                <h4 className={`text-lg font-bold mb-4 ${col.color}`}>{col.heading}</h4>
                <ul className="space-y-2">
                  {col.links.map((link, i) => (
                    <li key={i}>
                      <a href="#" className="text-gray-300 hover:text-white transition-colors duration-150">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </footer>
    </div>
  );
}
