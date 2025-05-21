"use client";

import { useState } from "react";
import Link from "next/link";
import PricingToggle from "@/components/PricingToggle";

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  const priceLabels = {
    free: "Free",
    pro: isYearly ? "$8/mo (billed yearly)" : "$12/mo",
    agency: "$48/mo (billed yearly)",
    partner: "Custom"
  };

  return (
    <section className="min-h-screen bg-black text-white py-24 px-6 font-sans">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-4">Choose a Plan</h2>
        <p className="text-gray-400 text-lg md:text-xl mb-12">
          Get started for free. Upgrade for more features.
        </p>

        <PricingToggle onToggle={setIsYearly} />

        <div className="grid md:grid-cols-4 gap-6 mt-12 text-left">
          {/* Starter Plan */}
          <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-4">Starter</h3>
              <p className="text-4xl font-bold mb-2">Free</p>
              <ul className="space-y-2 text-sm text-zinc-300">
                <li>✓ 3 projects</li>
                <li>✓ 1 week of generation history</li>
                <li>✓ Project sharing</li>
                <li>✓ Purchase more credits</li>
              </ul>
            </div>
            <Link href="/signup" className="mt-8 block text-center bg-white text-black px-5 py-2 rounded-md font-semibold hover:bg-gray-100 transition">
              Get this plan
            </Link>
          </div>

          {/* Professional Plan */}
          <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800 shadow-lg transform scale-105 relative flex flex-col justify-between">
            <div className="absolute top-4 right-4 text-xs bg-green-600 text-white px-2 py-1 rounded-full">Best value</div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Professional</h3>
              <p className="text-4xl font-bold mb-2">$16</p>
              <p className="text-sm text-zinc-400 mb-6">⚙ 10,000 free monthly rollover credits</p>
              <ul className="space-y-2 text-sm text-zinc-300">
                <li>✓ Everything in Starter</li>
                <li>✓ 50 projects</li>
                <li>✓ Credits roll over to next month</li>
                <li>✓ Unlimited generation history</li>
                <li>✓ Custom asset storage</li>
                <li>✓ Commercial use</li>
              </ul>
            </div>
            <Link href="/signup" className="mt-8 block text-center bg-white text-black px-5 py-2 rounded-md font-semibold hover:bg-gray-100 transition">
              Get this plan
            </Link>
          </div>

          {/* Agency Plan */}
          <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-4">Agency</h3>
              <p className="text-4xl font-bold mb-2">$48</p>
              <p className="text-sm text-zinc-400 mb-6">⚙ 60,000 free monthly rollover credits</p>
              <ul className="space-y-2 text-sm text-zinc-300">
                <li>✓ Everything in Professional</li>
                <li>✓ Unlimited project files</li>
                <li>✓ 10% off additional credits</li>
              </ul>
            </div>
            <Link href="/signup" className="mt-8 block text-center bg-white text-black px-5 py-2 rounded-md font-semibold hover:bg-gray-100 transition">
              Get this plan
            </Link>
          </div>

          {/* AI Partner Plan */}
          <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-4">AI Partner</h3>
              <p className="text-4xl font-bold mb-2">Custom</p>
              <p className="text-sm text-zinc-400 mb-6">⚙ Tailored AI guidance</p>
              <ul className="space-y-2 text-sm text-zinc-300">
                <li>✓ Everything in Agency</li>
                <li>✓ Custom-built workflows</li>
                <li>✓ Slack access to FLORA team</li>
                <li>✓ On-demand strategic guidance</li>
                <li>✓ White-glove onboarding</li>
              </ul>
            </div>
            <Link href="#contact" className="mt-8 block text-center bg-white text-black px-5 py-2 rounded-md font-semibold hover:bg-gray-100 transition">
              Get in touch
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
