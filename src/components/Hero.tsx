// components/Hero.tsx
import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="flex flex-col items-center text-center px-10 py-40 max-w-3xl mx-auto gap-10">
      {/* Headline */}
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-sans text-white leading-tight whitespace-nowrap">
        Your AI Career Edge.
      </h1>

      {/* Subheading */}
      <p className="text-gray-400 text-xl md:text-2xl lg:text-3xl max-w-xl">
        Portfolios, résumés, interviews — simplified.
      </p>

      {/* CTA */}
      <div className="flex space-x-6">
        <Link
          href="/signup"
          className="bg-white text-black px-6 py-3 rounded-md text-sm font-semibold hover:bg-gray-100 transition"
        >
          Create Yours Now
        </Link>
      </div>

      {/* Feature Highlights */}
      <div className="grid md:grid-cols-3 gap-6 mt-12 text-gray-300 text-left">
        <div className="bg-zinc-800 p-6 rounded-xl shadow-sm">
          <h3 className="text-white font-semibold text-lg mb-2">✨ AI-Powered Builder</h3>
          <p>Instantly generate portfolio sections with smart prompts and resume analysis.</p>
        </div>
        <div className="bg-zinc-800 p-6 rounded-xl shadow-sm">
          <h3 className="text-white font-semibold text-lg mb-2">⚡ Real-Time Editing</h3>
          <p>Customize content, visuals, and layouts without ever touching code.</p>
        </div>
        <div className="bg-zinc-800 p-6 rounded-xl shadow-sm">
          <h3 className="text-white font-semibold text-lg mb-2">📄 Auto Resume Sync</h3>
          <p>Upload your resume — we’ll structure and beautify it automatically.</p>
        </div>
      </div>

      {/* Image or illustration (optional) */}
      <div className="mt-16">
        <Image
          src="/hero-dashboard.png"
          alt="AI Portfolio Preview"
          width={900}
          height={600}
          className="rounded-xl shadow-md"
        />
      </div>

      {/* Social Proof (optional) */}
      <p className="text-sm text-gray-500 mt-8">
        Trusted by developers and designers across 50+ countries
      </p>
    </section>
  );
}
