'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  bio: string | null;
  website: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  twitter_url: string | null;
};

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
        setProfile(null);
      } else {
        setProfile(data);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  const toggleDropdown = () => setShowDropdown((prev) => !prev);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div className="text-white p-4">Loading...</div>;
  if (!profile) return <div className="text-white p-4">No profile found.</div>;

  return (
    <main className="flex min-h-screen bg-[#141a1f] text-white font-sans">
      {/* Sidebar */}
      <aside className="w-80 p-4 border-r border-gray-700 bg-[#1f272e]">
        

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute top-40 left-4 w-40 bg-black rounded shadow z-10">
              <ul className="text-sm">
                <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">Settings</li>
                <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">Account</li>
                <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer" onClick={handleLogout}>
                  Sign Out
                </li>
              </ul>
            </div>
          )}

        {/* Nav */}
        <nav className="flex flex-col gap-2">
          {[
            { label: 'Dashboard', icon: 'House' },
            { label: 'Portfolio', icon: 'Briefcase' },
            { label: 'Resume', icon: 'File' },
            { label: 'Cover Letters', icon: 'Envelope' },
            { label: 'Job Alerts', icon: 'Bell' },
          ].map(({ label, icon }) => (
            <div
              key={label}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl ${
                label === 'Dashboard' ? 'bg-[#2b3640]' : 'hover:bg-[#2b3640]'
              }`}
            >
              <Icon name={icon} />
              <p className="text-sm font-medium">{label}</p>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <section className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        <h2 className="text-lg font-semibold mb-2">Manage</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-4">
          {[
            { label: 'Portfolio', icon: 'Briefcase' },
            { label: 'Resume', icon: 'File' },
            { label: 'Cover Letters', icon: 'Envelope' },
            { label: 'Job Alerts', icon: 'Bell' },
          ].map(({ label, icon }) => (
            <div
              key={label}
              className="flex flex-col items-start gap-3 p-4 rounded-lg border border-[#3d4d5c] bg-[#1f272e]"
            >
              <Icon name={icon} />
              <p className="text-sm font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function Icon({ name }: { name: string }) {
  const icons: Record<string, string> = {
    House: 'M224,115.55V208a16,16...',
    Briefcase: 'M216,56H176V48a24...',
    File: 'M213.66,82.34l-56...',
    Envelope: 'M224,48H32a8,8...',
    Bell: 'M221.8,175.94C216.25...',
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="white"
      viewBox="0 0 256 256"
    >
      <path d={icons[name] || ''} />
    </svg>
  );
}
