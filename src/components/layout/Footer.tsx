'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <Link href="/about" className="text-gray-500 hover:text-gray-600">
            About
          </Link>
          <Link href="/privacy" className="text-gray-500 hover:text-gray-600">
            Privacy
          </Link>
          <Link href="/terms" className="text-gray-500 hover:text-gray-600">
            Terms
          </Link>
          <Link href="/contact" className="text-gray-500 hover:text-gray-600">
            Contact
          </Link>
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <p className="text-center text-xs leading-5 text-gray-500">
            &copy; {new Date().getFullYear()} PortfolioAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
