// components/Hero.tsx
import Link from "next/link";

export default function Hero() {
  return (
    <section className="flex flex-col items-center text-center px-10 py-40 max-w-2xl mx-auto gap-8">
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-sans text-white leading-tight whitespace-nowrap">
        Your AI Career Edge.
      </h1>
      <p className="text-gray-400 text-xl md:text-2xl lg:text-3xl max-w-xl">
      Portfolios, résumés, interviews — simplified.
      </p>

      <div className="flex space-x-6">
        <Link
          href="/signup"
          className="bg-white text-black px-5 py-2 rounded-md text-sm font-semibold hover:bg-gray-100 transition"
        >
          Create Yours Now
        </Link>
      </div>
    </section>
  );
}
