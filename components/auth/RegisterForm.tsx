"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Loader2, X, Eye, EyeOff } from "lucide-react";
import { registerSchema } from "@/lib/validations";
import { registerUser } from "@/actions/user.actions";
import { toast } from "sonner";

interface RegisterFormProps {
  onSwitchView?: () => void;
  onClose?: () => void;
  onSuccess?: () => void;
}

export function RegisterForm({ onSwitchView, onClose, onSuccess }: RegisterFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validation = registerSchema.safeParse({ name, username, email, password });
    if (!validation.success) {
      toast.error(validation.error.issues[0]?.message);
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerUser(name, email, password, username);

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.error("Account created but sign-in failed. Please sign in manually.");
      } else {
        toast.success("Welcome to InkSpace!");
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/welcome");
          router.refresh();
        }
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch {
      toast.error("Failed to sign in with Google");
      setIsGoogleLoading(false);
    }
  }

  return (
    <div className="relative bg-[#111] border border-white/8 rounded-sm p-8 w-full">
      {/* Close */}
      {onClose ? (
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded hover:bg-white/5 text-[#555] hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      ) : (
        <Link
          href="/"
          className="absolute top-5 right-5 p-1.5 rounded hover:bg-white/5 text-[#555] hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </Link>
      )}

      {/* Header */}
      <div className="mb-7">
        <div className="flex items-center gap-1 mb-5">
          <span className="text-[#E8C97A] font-bold text-base">Ink</span>
          <span className="text-white font-bold text-base">Space</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Create account</h2>
        <p className="text-sm text-[#555] mt-1">
          Already a member?{" "}
          {onSwitchView ? (
            <button
              onClick={onSwitchView}
              type="button"
              className="text-[#E8C97A] hover:underline cursor-pointer bg-transparent border-none p-0 font-medium"
            >
              Sign in
            </button>
          ) : (
            <Link href="/login" className="text-[#E8C97A] hover:underline font-medium">
              Sign in
            </Link>
          )}
        </p>
      </div>

      {/* Google */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading}
        className="w-full h-10 border border-white/8 bg-transparent hover:bg-white/4 text-[#ccc] hover:text-white font-medium text-sm rounded transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 mb-5"
      >
        {isGoogleLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-[#666]" />
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        )}
        Continue with Google
      </button>

      {/* Divider */}
      <div className="relative flex items-center justify-center mb-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/5" />
        </div>
        <span className="relative bg-[#111] px-3 text-[11px] text-[#444] uppercase tracking-wider">or</span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="reg-name" className="text-xs font-medium text-[#666] block">
              Name
            </label>
            <input
              id="reg-name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full h-10 bg-[#1a1a1a] border border-white/7 hover:border-white/12 focus:border-[#E8C97A]/40 focus:ring-1 focus:ring-[#E8C97A]/20 text-white rounded px-3 text-sm placeholder-[#444] outline-none transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="reg-username" className="text-xs font-medium text-[#666] block">
              Username
            </label>
            <input
              id="reg-username"
              type="text"
              placeholder="handle"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              required
              className="w-full h-10 bg-[#1a1a1a] border border-white/7 hover:border-white/12 focus:border-[#E8C97A]/40 focus:ring-1 focus:ring-[#E8C97A]/20 text-white rounded px-3 text-sm placeholder-[#444] outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="reg-email" className="text-xs font-medium text-[#666] block">
            Email
          </label>
          <input
            id="reg-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-10 bg-[#1a1a1a] border border-white/7 hover:border-white/12 focus:border-[#E8C97A]/40 focus:ring-1 focus:ring-[#E8C97A]/20 text-white rounded px-3 text-sm placeholder-[#444] outline-none transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="reg-password" className="text-xs font-medium text-[#666] block">
            Password
          </label>
          <div className="relative">
            <input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-10 bg-[#1a1a1a] border border-white/7 hover:border-white/12 focus:border-[#E8C97A]/40 focus:ring-1 focus:ring-[#E8C97A]/20 text-white rounded px-3 pr-10 text-sm placeholder-[#444] outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888] transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 bg-[#E8C97A] hover:bg-[#dabb65] text-[#0c0c0c] font-semibold text-sm rounded transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
        </button>
      </form>
    </div>
  );
}
