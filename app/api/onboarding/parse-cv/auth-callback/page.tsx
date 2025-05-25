"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const AuthCallback = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error.message);
        router.push("/login");
        return;
      }

      if (!data.session) {
        router.push("/login");
        return;
      }

      const userId = data.session.user.id;
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("hasOnboarded")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError.message);
        router.push("/login");
        return;
      }

      if (profile?.hasOnboarded) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }

      setLoading(false);
    };

    handleAuth();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f0f0f] text-white">
      {loading ? <p>Loading...</p> : <p>Redirecting...</p>}
    </div>
  );
};

export default AuthCallback;
