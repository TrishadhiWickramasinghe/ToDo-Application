'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { validateEmail, validatePassword, validateName, validatePasswordMatch } from '@/utils/validation';
import toast from 'react-hot-toast';

/* ── tiny icons ──────────────────────────────────────────── */
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
            focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50
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
export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string; email?: string; password?: string; confirmPassword?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const passwordMatchError = validatePasswordMatch(password, confirmPassword);
    if (nameError)          newErrors.name            = nameError;
    if (emailError)         newErrors.email           = emailError;
    if (passwordError)      newErrors.password        = passwordError;
    if (passwordMatchError) newErrors.confirmPassword = passwordMatchError;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await register(name, email, password, confirmPassword);
      toast.success('Account created! Welcome aboard 🚀');
      router.push('/dashboard');
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? 'Registration failed. Please try again.';
      // Show field-level errors if available
      const apiErrors = error?.response?.data?.errors;
      if (apiErrors) {
        setErrors({
          name:            apiErrors.name?.[0],
          email:           apiErrors.email?.[0],
          password:        apiErrors.password?.[0],
          confirmPassword: apiErrors.password_confirmation?.[0],
        });
      }
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  /* icon helpers */
  const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      className="w-4 h-4">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx={12} cy={7} r={4} />
    </svg>
  );
  const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      className="w-4 h-4">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
  const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      className="w-4 h-4">
      <rect x={3} y={11} width={18} height={11} rx={2} ry={2} />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Name */}
      <DarkInput
        label="Full name"
        id="register-name"
        type="text"
        placeholder="John Doe"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        disabled={isLoading}
        icon={<UserIcon />}
      />

      {/* Email */}
      <DarkInput
        label="Email address"
        id="register-email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        disabled={isLoading}
        icon={<MailIcon />}
      />

      {/* Password */}
      <DarkInput
        label="Password"
        id="register-password"
        type={showPassword ? 'text' : 'password'}
        placeholder="Min. 8 characters"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        disabled={isLoading}
        icon={<LockIcon />}
        rightSlot={
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="text-slate-500 hover:text-slate-300 transition-colors">
            {showPassword ? <EyeOff /> : <EyeOpen />}
          </button>
        }
      />

      {/* Confirm password */}
      <DarkInput
        label="Confirm password"
        id="register-confirm-password"
        type={showConfirmPassword ? 'text' : 'password'}
        placeholder="Re-enter your password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={errors.confirmPassword}
        disabled={isLoading}
        icon={<LockIcon />}
        rightSlot={
          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="text-slate-500 hover:text-slate-300 transition-colors">
            {showConfirmPassword ? <EyeOff /> : <EyeOpen />}
          </button>
        }
      />

      {/* Submit */}
      <button
        id="register-submit"
        type="submit"
        disabled={isLoading}
        className="relative w-full py-3 px-6 rounded-xl font-semibold text-white text-sm
          btn-shimmer overflow-hidden
          hover:opacity-90 active:scale-[.98]
          focus:outline-none focus:ring-2 focus:ring-violet-500/50
          disabled:opacity-60 disabled:cursor-not-allowed
          transition-all duration-200 mt-2 shadow-lg shadow-violet-500/30"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Creating account…
          </span>
        ) : (
          'Create account →'
        )}
      </button>

      {/* Divider */}
      <div className="relative my-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-transparent px-3 text-slate-500">Already have an account?</span>
        </div>
      </div>

      {/* Link to login */}
      <Link
        href="/login"
        className="block w-full text-center py-2.5 px-6 rounded-xl text-sm font-medium
          border border-white/10 text-slate-300
          hover:bg-white/5 hover:border-violet-500/40
          transition-all duration-200"
      >
        Sign in instead
      </Link>
    </form>
  );
}
