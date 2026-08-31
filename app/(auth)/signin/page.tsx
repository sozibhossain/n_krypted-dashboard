"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Bitte geben Sie E-Mail und Passwort ein.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast.error(res.error || "Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Daten.");
      } else {
        toast.success("Erfolgreich angemeldet!");
        router.replace("/");
      }
    } catch {
      toast.error("Ein unerwarteter Fehler ist aufgetreten.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-xl sm:text-2xl font-bold text-[#1E1E1E] mb-2">
        Willkommen bei Signature Dish
      </h2>
      <p className="text-xs sm:text-sm text-[#718096] max-w-sm mb-8 leading-relaxed">
        Melden Sie sich an, um weiterhin unvergessliche Spezialitäten in Ihrer Nähe zu entdecken.
      </p>

      <form onSubmit={handleSubmit} className="w-full space-y-5 text-left">
        <label className="flex flex-col gap-2 text-xs font-semibold text-[#334155]">
          <span>E-Mail</span>
          <Input
            type="email"
            placeholder="Ihre E-Mail-Adresse"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
            className="h-12 border-[#90CAF9] focus-visible:ring-[#0097A7]"
          />
        </label>

        <label className="flex flex-col gap-2 text-xs font-semibold text-[#334155]">
          <span>Passwort</span>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Ihr Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              className="h-12 border-[#90CAF9] focus-visible:ring-[#0097A7] pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </label>

        <div className="flex items-center justify-between text-xs sm:text-sm pt-1 pb-2">
          <label className="flex items-center gap-2 cursor-pointer text-[#718096]">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-[#90CAF9] text-[#0097A7] focus:ring-[#0097A7] accent-[#0097A7]"
            />
            <span>Erinnere dich an mich</span>
          </label>

          <Link
            href="/forgot-password"
            className="text-[#0097A7] hover:underline font-medium"
          >
            Passwort vergessen?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 rounded-xl bg-[#0097A7] hover:bg-[#00838F] text-white font-medium text-base shadow-sm mt-2"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Wird angemeldet...</span>
            </div>
          ) : (
            "anmelden"
          )}
        </Button>
      </form>
    </div>
  );
}
