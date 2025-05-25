// app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Hero from "@/components/Hero";

export default function HomePage() {
  return <Hero />;
}
