'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { FaLinkedin, FaXTwitter, FaYoutube, FaPinterest, FaFacebook } from 'react-icons/fa6';

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

const features = [
  {
    icon: '🎨',
    title: 'AI Portfolio Builder',
    description:
      'Paste your LinkedIn, upload a résumé, or answer guided questions. OlioAI builds you a mobile-friendly, professional portfolio — instantly. Export as HTML or host on a custom subdomain.',
    image: '/images/poortf.jpg',
    imageFirst: true,
  },
  {
    icon: '🎙',
    title: 'AI Cover Letter Generator',
    description:
      "Get grilled like it's game day. Role-specific questions, transcript feedback, confidence scoring, and improvement tips — all powered by AI.",
    image: '/images/cover.jpg',
    imageFirst: false,
  },
  {
    icon: '📄',
    title: 'AI CV Generator',
    description:
      'No résumé? No problem. We will extract your experience, skills, and metrics via dynamic prompts. One-click generation for tailored, job-specific cover letters with adjustable tone.',
    image: '/images/resume.jpg',
    imageFirst: true,
  },
  {
    icon: '🧠',
    title: 'Skill Gap Analyzer',
    description:
      'Identify areas for improvement and receive personalized recommendations to enhance your profile.',
    image: '/images/skill-gap-sample.jpg',
    imageFirst: false,
  },
];

const whyChooseUs = [
  {
    icon: '🚀',
    title: 'Start Fast',
    description: 'No templates. Just results. Enter your info and let AI do the rest.',
  },
  {
    icon: '🧩',
    title: 'All-in-One Platform',
    description: 'No more juggling sites. Résumé, portfolio, interview prep—it\'s all here.',
  },
  {
    icon: '🤖',
    title: 'Smarter Than Templates',
    description: 'Your materials are tailored with job-matching precision using AI.',
  },
  {
    icon: '📈',
    title: 'Built to Scale Your Search',
    description: 'Apply smarter and faster with AI-backed optimization.',
  },
];

const howItWorks = [
  {
    title: 'Step 1: Import',
    description: 'Upload your résumé, paste your LinkedIn, or answer a few guided questions.',
    color: 'text-red-400',
  },
  {
    title: 'Step 2: Generate',
    description: 'Let AI build your portfolio site, résumé, and cover letters—all in minutes.',
    color: 'text-red-400',
  },
  {
    title: 'Step 3: Optimize & Apply',
    description: 'Get real-time feedback, tailor your applications, and track job alerts.',
    color: 'text-red-400',
  },
];



const testimonials = [
  {
    name: 'John Doe',
    role: 'Software Engineer',
    image: '/images/john-doe.jpg',
    feedback: 'OlioAI has been a game-changer for my job search. It helped me optimize my resume and cover letter in no time.',
  },
  {
    name: 'Jane Smith',
    role: 'Product Manager',
    image: '/images/jane-smith.jpg',
    feedback: 'The AI interview coach was incredibly helpful in preparing for my job interviews. I felt more confident after using it.',
  },
  {
    name: 'Mike Johnson',
    role: 'Data Scientist',
    image: '/images/mike-johnson.jpg',
    feedback: 'OlioAI has made my job search much more efficient. I can now apply to multiple jobs with ease.',
  },
];

const faqs = [
  {
    question: 'How long does it take to get a job using OlioAI?',
    answer: 'It depends on your job search strategy and the number of applications you make. However, our AI tools can help you optimize your job search and increase your chances of getting hired.',
  },
  {
    question: 'Can I use OlioAI if I don\'t have a LinkedIn account?',
    answer: 'Yes, you can use OlioAI even if you don\'t have a LinkedIn account. You can paste your résumé or answer guided questions to get started.',
  },
  {
    question: 'Is OlioAI free to use?',
    answer: 'Yes, OlioAI offers a free plan with essential job search tools. You can upgrade to a premium plan for advanced AI tools and features.',
  },
];

const trustedLogos = [
  '/images/trusted-logo-1.png',
  '/images/trusted-logo-2.png',
  '/images/trusted-logo-3.png',
  '/images/trusted-logo-4.png',
  '/images/trusted-logo-5.png',
  '/images/trusted-logo-6.png',
  '/images/trusted-logo-7.png',
  '/images/trusted-logo-8.png',
];

const footerColumns = [
  {
    heading: 'Products',
    color: 'text-white',
    links: ['LinkedIn Review', "Who's Hiring", 'Resume Review', 'Job Tracker', 'Resume Builder'],
  },
  {
    heading: 'Important',
    color: 'text-white',
    links: ['Free LinkedIn Review', "Who's Hiring", 'Premium Toolkit', 'Interview Guides', 'Job Search Tips', 'ChatGPT Guides', 'Help Center'],
  },
  {
    heading: 'Resources',
    color: 'text-white',
    links: ['Resume Template', 'Community', 'Job Search Blog', 'Gift Cards', 'Become an Affiliate'],
  },
  {
    heading: 'Company',
    color: 'text-white',
    links: ['About', 'Contact', 'Privacy', 'Terms'],
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Hero Section (Inspired by FloraFauna.ai) */}
      <motion.section
        className="w-full min-h-screen flex flex-col items-center justify-center px-4 relative"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <motion.div
          className="text-sm bg-green-500/20 text-green-400 rounded-full px-4 py-1 mb-6"
          variants={fadeInUp}
        >
          OlioAI launches new AI-powered job search tools →
        </motion.div>
        <motion.h1
          className="text-5xl md:text-7xl font-bold text-center mb-6 leading-tight"
          variants={fadeInUp}
        >
          Your intelligent career tool.
        </motion.h1>
        <motion.p
          className="text-xl text-gray-300 text-center mb-10 max-w-2xl"
          variants={fadeInUp}
        >
          Every job search tool, thoughtfully connected.
        </motion.p>
        <motion.div className="flex gap-4" variants={fadeInUp}>
          <Button
            size="lg"
            className="bg-white text-black hover:bg-gray-200 px-6 py-4 text-lg font-semibold rounded-lg"
            asChild
          >
            <Link href="/signup">Try for free</Link>
          </Button>
        </motion.div>
        <motion.div
          className="absolute bottom-10 flex flex-col items-center"
          variants={fadeInUp}
        >
          <p className="text-gray-400 text-sm mb-4">Trusted by top professionals at</p>
          <div className="flex flex-wrap justify-center gap-6 opacity-80">
            {trustedLogos.map((logo, idx) => (
              <Image
                key={idx}
                src={logo}
                alt={`Trusted logo ${idx + 1}`}
                width={80}
                height={30}
                className="grayscale opacity-80 hover:opacity-100 transition-opacity duration-300"
              />
            ))}
          </div>
        </motion.div>
      </motion.section>

      {/* Features Section with Alternating Layout */}
      <section className="w-full max-w-7xl mx-auto px-4 py-32">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Everything You Need in One Place
        </motion.h2>
        <div className="space-y-32">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              className={`flex flex-col ${feature.imageFirst ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: idx * 0.2 }}
              viewport={{ once: true }}
            >
              {/* Image Section */}
              <motion.div
                className="w-full md:w-1/2"
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.2 + 0.2 }}
                viewport={{ once: true }}
              >
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
              </motion.div>

              {/* Content Section */}
              <motion.div
                className="w-full md:w-1/2 space-y-6"
                initial={{ x: feature.imageFirst ? 50 : -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.2 + 0.3 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-3xl font-bold mb-4">{feature.title}</h3>
                <p className="text-xl text-gray-300 leading-relaxed">{feature.description}</p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.2 + 0.4 }}
                  viewport={{ once: true }}
                >
                  <Button
                    variant="outline"
                    className="mt-6 border-white/20 hover:border-white/40 text-black"
                    asChild
                  >
                    <Link href="/signup">Learn More →</Link>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>
 
      {/* Why Choose Us Section */}
      <section className="w-full max-w-7xl mx-auto px-4 py-32">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Why OlioAI?
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {whyChooseUs.map((item, idx) => (
            <motion.div
              key={idx}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-300">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full max-w-7xl mx-auto px-4 py-32 flex flex-col md:flex-row items-center gap-16">
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">How It Works</h2>
          <p className="text-gray-300 mb-6">
            Transform your job search with our streamlined, AI-powered process.
          </p>
          <div className="space-y-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-2 text-red-400">Step 1: Import</h3>
              <p className="text-gray-300">Upload your résumé or connect your LinkedIn profile.</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-2 text-red-400">Step 2: Generate</h3>
              <p className="text-gray-300">Let AI build your portfolio, resume, and cover letter instantly.</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-2 text-red-400">Step 3: Optimize & Apply</h3>
              <p className="text-gray-300">Get real-time feedback and apply to tailored job opportunities.</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Image
            src="/images/how-it-works-sample.jpg"
            alt="How It Works"
            width={500}
            height={500}
            className="rounded-2xl shadow-lg"
          />
        </motion.div>
      </section>


      {/* Testimonials Section */}
      <section className="w-full max-w-7xl mx-auto px-4 py-32">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-16 text-yellow-400"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          What Our Users Say
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 flex flex-col items-center text-center shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <Image
                src={testimonial.image}
                alt={testimonial.name}
                width={80}
                height={80}
                className="rounded-full mb-4"
              />
              <p className="text-gray-300 mb-4">{testimonial.feedback}</p>
              <h3 className="text-lg font-semibold">{testimonial.name}</h3>
              <p className="text-gray-300">{testimonial.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full max-w-7xl mx-auto px-4 py-32">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Frequently Asked Questions
        </motion.h2>
        <div className="space-y-8">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-semibold mb-2">{faq.question}</h3>
              <p className="text-gray-300">{faq.answer}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full max-w-7xl mx-auto px-4 py-32 text-center">
        <motion.h2
          className="text-3xl md:text-4xl font-bold mb-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Start Your Job Search the Smart Way
        </motion.h2>
        <motion.p
          className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Let AI turn your background into your biggest advantage.
          Try OlioAI free—no credit card required.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            size="lg"
            className="bg-white text-black hover:bg-gray-200 px-8 py-6 text-lg font-semibold rounded-lg"
            asChild
          >
            <Link href="/signup">Create My Portfolio Now</Link>
          </Button>
        </motion.div>
      </section>

      {/* Footer Section */}
      <footer className="w-full bg-gray-950/50 py-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          {footerColumns.map((column, idx) => (
            <div key={idx}>
              <h3 className={`text-lg font-semibold mb-4 ${column.color}`}>
                {column.heading}
              </h3>
              <ul className="space-y-2">
                {column.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link href="#" className="text-gray-300 hover:text-white">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300">© 2025 OlioAI. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="#" className="text-gray-300 hover:text-white">
              <FaLinkedin size={24} />
            </Link>
            <Link href="#" className="text-gray-300 hover:text-white">
              <FaXTwitter size={24} />
            </Link>
            <Link href="#" className="text-gray-300 hover:text-white">
              <FaYoutube size={24} />
            </Link>
            <Link href="#" className="text-gray-300 hover:text-white">
              <FaPinterest size={24} />
            </Link>
            <Link href="#" className="text-gray-300 hover:text-white">
              <FaFacebook size={24} />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}