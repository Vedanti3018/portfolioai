'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, FileText, PenLine } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

const MotionCard = motion(Card);

export default function OnboardingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'upload' | 'manual' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to upload a resume');
        router.push('/login');
        return;
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please upload a PDF or Word document');
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        throw new Error('File size must be less than 5MB');
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/onboarding/parse-cv', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to parse resume');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to parse resume');
      }

      // Save to onboarding_drafts
      const { error: draftError } = await supabase
        .from('onboarding_drafts')
        .upsert({
          id: session.user.id,
          parsed_data: data.data,
          updated_at: new Date().toISOString()
        });

      if (draftError) {
        throw new Error(`Failed to save draft: ${draftError.message}`);
      }

      toast.success('Resume uploaded successfully!');
      router.push('/onboarding/review');
    } catch (error) {
      console.error('Error uploading file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload resume';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualEntry = () => {
    router.push('/onboarding/manual');
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white pt-24">
      <MotionCard
        className="w-full max-w-md border-none bg-[#18181b]/90 rounded-2xl shadow-2xl backdrop-blur-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <CardContent className="p-8 space-y-7 text-white">
          <div className="flex flex-col items-center space-y-2">
            <Image src="/logo.svg" alt="Brand Logo" width={48} height={48} className="mx-auto" />
            <h2 className="text-2xl font-semibold">Complete Your Profile</h2>
            <p className="text-sm text-gray-400 text-center">
              Choose how you'd like to add your information
            </p>
          </div>

          {isLoading || isProcessing ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-sm text-gray-400">
                {isLoading ? 'Processing your resume...' : 'Setting up manual entry...'}
              </p>
            </div>
          ) : !selectedMethod ? (
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 bg-white/10 text-white border border-white/20 hover:bg-white/20 font-medium py-3 rounded-lg transition"
                onClick={() => setSelectedMethod('upload')}
              >
                <Upload size={20} />
                Upload Resume
              </Button>

              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 bg-white/10 text-white border border-white/20 hover:bg-white/20 font-medium py-3 rounded-lg transition"
                onClick={() => setSelectedMethod('manual')}
              >
                <PenLine size={20} />
                Answer short QnA
              </Button>
            </div>
          ) : selectedMethod === 'upload' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-[#23232a] border-white/20 hover:bg-white/5 transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileText className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-400">PDF, DOC, or DOCX</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    disabled={isLoading}
                  />
                </label>
              </div>

              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 bg-white/10 text-white border border-white/20 hover:bg-white/20 font-medium py-3 rounded-lg transition"
                onClick={() => setSelectedMethod(null)}
              >
                Back to Options
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-400 text-center">
                You'll be able to enter your information in the next step
              </p>
              <Button
                className="w-full bg-blue-600 text-white hover:bg-blue-700 font-semibold py-3 rounded-lg transition"
                onClick={handleManualEntry}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Continue to Manual Entry'
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 bg-white/10 text-white border border-white/20 hover:bg-white/20 font-medium py-3 rounded-lg transition"
                onClick={() => setSelectedMethod(null)}
              >
                Back to Options
              </Button>
            </div>
          )}
        </CardContent>
      </MotionCard>
    </div>
  );
} 