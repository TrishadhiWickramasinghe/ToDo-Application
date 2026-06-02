'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { validateEmail, validatePassword } from '@/utils/validation';
import toast from 'react-hot-toast';

/* ── tiny eye icons ──────────────────────────────────────── */
function EyeOpen() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      className="w-4 h-4">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx={12} cy={12} r={3} />
    </svg>
  );
}
function EyeOff() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      className="w-4 h-4">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1={1} y1={1} x2={23} y2={23} />
    </svg>
  );
}

/* ── reusable dark input ─────────────────────────────────── */
interface DarkInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon: React.ReactNode;
  rightSlot?: React.ReactNode;
}
function DarkInput({ label, error, icon, rightSlot, className, ...props }: DarkInputProps) {
  return (
    <div className="w-full space-y-1.5">
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
          {icon}
        </span>
        <input
          className={`w-full pl-10 pr-${rightSlot ? '10' : '4'} py-3 rounded-xl text-sm text-white
            bg-white/5 border border-white/10
            placeholder-slate-600
            focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50
            transition-all duration-200
            ${error ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/40' : ''}
            ${className ?? ''}`}
          {...props}
        />
        {rightSlot && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightSlot}</span>
        )}
      </div>
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-400 animate-slide-in">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

/* ── main component ──────────────────────────────────────── */
export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back! 🎉');
      router.push('/dashboard');
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Email */}
      <DarkInput
        label="Email address"
        id="login-email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        disabled={isLoading}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            className="w-4 h-4">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        }
      />

      {/* Password */}
      <DarkInput
        label="Password"
        id="login-password"
        type={showPassword ? 'text' : 'password'}
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        disabled={isLoading}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            className="w-4 h-4">
            <rect x={3} y={11} width={18} height={11} rx={2} ry={2} />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        }
        rightSlot={
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="text-slate-500 hover:text-slate-300 transition-colors">
            {showPassword ? <EyeOff /> : <EyeOpen />}
          </button>
        }
      />

      {/* Submit */}
      <button
        id="login-submit"
        type="submit"
        disabled={isLoading}
        className="relative w-full py-3 px-6 rounded-xl font-semibold text-white text-sm
          btn-shimmer overflow-hidden
          hover:opacity-90 active:scale-[.98]
          focus:outline-none focus:ring-2 focus:ring-indigo-500/50
          disabled:opacity-60 disabled:cursor-not-allowed
          transition-all duration-200 mt-2 shadow-lg shadow-indigo-500/30"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Signing in…
          </span>
        ) : (
          'Sign in →'
        )}
      </button>

      {/* Divider */}
      <div className="relative my-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-transparent px-3 text-slate-500">Don&apos;t have an account?</span>
        </div>
      </div>

      {/* Link to register */}
      <Link
        href="/register"
        className="block w-full text-center py-2.5 px-6 rounded-xl text-sm font-medium
          border border-white/10 text-slate-300
          hover:bg-white/5 hover:border-indigo-500/40
          transition-all duration-200"
      >
        Create a free account
      </Link>
    </form>
  );
}
