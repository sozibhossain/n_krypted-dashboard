"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authApi, getApiErrorMessage } from "@/lib/api";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus the first input on load
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9a-zA-Z]*$/.test(value)) return;

    const newOtp = [...otp];
    // Take the last character entered
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().slice(0, 5);
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    const nextIndex = Math.min(pastedData.length, 4);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");

    if (code.length < 5) {
      toast.error("Bitte geben Sie den vollständigen 5-stelligen Code ein.");
      return;
    }

    try {
      setIsLoading(true);
      await authApi.verifyOtp({ email, code });
      toast.success("Code erfolgreich verifiziert!");
      router.push(`/reset-password?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`);
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(err, "Der Code konnte nicht verifiziert werden.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-xl sm:text-2xl font-bold text-[#1E1E1E] mb-2">
        OTP überprüfen
      </h2>
      <p className="text-xs sm:text-sm text-[#718096] max-w-sm mb-8 leading-relaxed">
        Bestätigen Sie Ihr Konto, um Signature Dish weiter zu entdecken.
      </p>

      <form onSubmit={handleSubmit} className="w-full space-y-6 text-center">
        {/* 5 OTP input boxes matching design */}
        <div className="flex items-center justify-center gap-3" onPaste={handlePaste}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => { inputRefs.current[idx] = el; }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              disabled={isLoading}
              className="w-12 h-14 text-center text-lg font-bold rounded-xl border border-[#90CAF9] bg-white text-[#1E1E1E] focus:outline-none focus:ring-2 focus:ring-[#0097A7] focus:border-transparent transition-all shadow-xs"
            />
          ))}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 rounded-xl bg-[#0097A7] hover:bg-[#00838F] text-white font-medium text-base shadow-sm"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Wird verifiziert...</span>
            </div>
          ) : (
            "Verifizieren"
          )}
        </Button>

        <div className="text-center pt-2">
          <Link
            href="/signin"
            className="inline-flex items-center gap-1 text-xs sm:text-sm text-[#718096] hover:text-[#0097A7]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Zurück zur Anmeldung</span>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="text-center py-8 text-sm text-gray-500">Laden...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
