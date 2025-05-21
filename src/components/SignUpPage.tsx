"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";

const MotionCard = motion(Card);

const SignUpPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push("/dashboard");
      }
    };
    checkSession();
  }, [router]);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailSignUp = async () => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (!name.trim()) {
      setErrorMsg("Please enter your name.");
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setErrorMsg("Please enter a valid email.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const { data,error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
        if (error.message.includes("already registered")) {
          setErrorMsg("Email already exists. Please login instead.");
        } else {
          setErrorMsg(error.message);
        }
      } else if (data.user) {
        setSuccessMsg("Signup successful! Please check your email to confirm.");
        // Optional: Automatically redirect after delay or when user confirms email
      }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      setErrorMsg(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f0f0f] px-4">
      <MotionCard
        className="w-full max-w-md border border-gray-800 bg-[#1a1a1a] rounded-2xl shadow-xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <CardContent className="p-8 space-y-6 text-white">
          <div className="text-center space-y-2">
            <Image src="/logo.svg" alt="Brand Logo" width={48} height={48} className="mx-auto" />
            <h2 className="text-2xl font-semibold">Welcome to PortfolioAI</h2>
            <p className="text-sm text-gray-400">Create your AI-powered career kit</p>
          </div>

          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-200"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <FcGoogle size={20} />
            Continue with Google
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-600" />
            <span className="text-sm text-gray-400">OR</span>
            <div className="flex-1 h-px bg-gray-600" />
          </div>

          <div className="space-y-3">
            <Input
              type="text"
              placeholder="Your name"
              className="bg-[#2a2a2a] border border-gray-700 text-white placeholder-gray-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              type="email"
              placeholder="Your email"
              className="bg-[#2a2a2a] border border-gray-700 text-white placeholder-gray-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <Input
              type="password"
              placeholder="Your password"
              className="bg-[#2a2a2a] border border-gray-700 text-white placeholder-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              
            />

            {errorMsg && <p className="text-sm text-red-500 text-center">{errorMsg}</p>}
            {successMsg && <p className="text-sm text-green-500 text-center">{successMsg}</p>}

            <Button
              className="w-full bg-gray-100 text-black hover:bg-white"
              onClick={handleEmailSignUp}
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign up"}
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500 pt-2">
            By continuing, you agree to our{" "}
            <span className="underline cursor-pointer">Terms of Service</span> &{" "}
            <span className="underline cursor-pointer">Privacy Policy</span>.
          </p>
        </CardContent>
      </MotionCard>
    </div>
  );
};

export default SignUpPage;
