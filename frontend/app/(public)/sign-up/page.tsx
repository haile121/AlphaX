'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useDialog } from '@/components/ui/DialogProvider';
import { authApi } from '@/lib/api';

interface FormErrors {
  email?: string;
  displayName?: string;
  password?: string;
  confirmPassword?: string;
}

function validate(email: string, displayName: string, password: string, confirmPassword: string): FormErrors {
  const errors: FormErrors = {};
  if (!email) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address';
  if (!displayName) errors.displayName = 'Display name is required';
  if (!password) errors.password = 'Password is required';
  if (!confirmPassword) errors.confirmPassword = 'Please confirm your password';
  else if (password && confirmPassword !== password) errors.confirmPassword = 'Passwords do not match';
  return errors;
}

export default function SignUpPage() {
  const router = useRouter();
  const { show } = useDialog();

  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const emailTrimmed = email.trim();
    const displayTrimmed = displayName.trim();
    const errs = validate(emailTrimmed, displayTrimmed, password, confirmPassword);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      await authApi.register(emailTrimmed, displayTrimmed, password);
      router.push('/assessment/track');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Something went wrong. Please try again.';
      show({ variant: 'error', title: 'Registration failed', message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar variant="public" />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 pt-16">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm p-8">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">Create your account</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Start learning programming in Amharic today</p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
            />
            <Input
              label="Display Name"
              type="text"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              error={errors.displayName}
              autoComplete="name"
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="relative">
              <Input
                label="Confirm Password"
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Button type="submit" variant="primary" size="lg" loading={loading} className="mt-2 w-full">
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/sign-in" className="text-accent dark:text-accent-dark font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
