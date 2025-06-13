// app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Hero from "@/components/Hero";

export default function HomePage() {
  return <Hero />;
}
