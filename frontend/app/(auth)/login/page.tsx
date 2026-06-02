'use client';

import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a1a]">

      {/* Animated gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="animate-float-orb absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, #4f46e5 40%, transparent 70%)' }}
        />
        <div
          className="animate-float-alt absolute top-1/2 -right-40 w-[400px] h-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, #2563eb 40%, transparent 70%)' }}
        />
        <div
          className="animate-float-orb absolute -bottom-24 left-1/3 w-[350px] h-[350px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, #8b5cf6 0%, #7c3aed 40%, transparent 70%)', animationDelay: '3s' }}
        />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Main card */}
      <div className="relative z-10 w-full max-w-md px-4 py-8 animate-slide-up">

        {/* Logo + heading */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 animate-pulse-ring"
            style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}>
            <span className="text-3xl">📝</span>
          </div>
          <h1 className="text-4xl font-extrabold gradient-text mb-2">Welcome back</h1>
          <p className="text-slate-400 text-sm">Sign in to continue to TodoApp</p>
        </div>

        {/* Glass card */}
        <div className="glass-card rounded-2xl p-8">
          <LoginForm />
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs mt-6">
          © {new Date().getFullYear()} TodoApp · All rights reserved
        </p>
      </div>
    </div>
  );
}
