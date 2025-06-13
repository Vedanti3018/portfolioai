"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function BlankResumePage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const createBlankResume = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      const { data: resume, error } = await supabase
        .from('resumes')
        .insert([
          {
            user_id: session.user.id,
            title: 'New Resume',
            content: {
              personal: {
                name: '',
                title: '',
                email: '',
                phone: '',
                location: '',
                summary: '',
              },
              experience: [],
              education: [],
              skills: [],
            },
            is_primary: false,
            target_title: null,
            target_description: null,
            ai_prompt: null,
            source_type: 'blank',
            downloaded: false,
            deleted_at: null
          }
        ])
        .select()
        .single();
      if (error) {
        // Handle error
        return;
      }
      router.push(`/dashboard/resume/edit/${resume.id}`);
    };
    createBlankResume();
  }, [router, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] text-white">
      <span className="text-lg">Creating blank resume...</span>
    </div>
  );
} 