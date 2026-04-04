'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, ChevronDown, Shield } from 'lucide-react';
import Cookies from 'js-cookie';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { authApi } from '@/lib/api';
import { clearCourseReadingLocalCache } from '@/lib/lessonProgressClient';
import { SiteLogo } from '@/components/branding/SiteLogo';
import { cn } from '@/lib/cn';

interface NavbarProps {
  variant: 'public' | 'auth' | 'admin';
  unreadCount?: number;
  userName?: string;
  userInitial?: string;
}

export function Navbar({ variant, unreadCount = 0, userName = 'User', userInitial }: NavbarProps) {
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const initial = userInitial ?? userName.charAt(0).toUpperCase();

  // Check login state from the non-httpOnly flag cookie, and verify
  useEffect(() => {
    const checkAuth = async () => {
      if (!Cookies.get('logged_in')) {
        setIsLoggedIn(false);
        return;
      }
      try {
        const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(`${baseURL}/api/auth/me`, { credentials: 'include' });
        if (res.ok) {
          setIsLoggedIn(true);
        } else {
          Cookies.remove('logged_in');
          setIsLoggedIn(false);
        }
      } catch (err) {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    Cookies.remove('logged_in');
    clearCourseReadingLocalCache();
    setIsLoggedIn(false);
    router.push('/');
  };

  return (
    <header
      suppressHydrationWarning
      className={cn(
        'fixed top-0 left-0 right-0 z-40 h-16 flex items-center px-4 sm:px-6',
        'bg-white/90 dark:bg-[#080810]/90 backdrop-blur-md border-b border-gray-200 dark:border-white/8'
      )}
    >
      <div className="flex items-center justify-between w-full max-w-screen-xl mx-auto">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <SiteLogo />
          {variant === 'public' && (
            <nav className="flex items-center gap-0.5 sm:gap-1 ml-1.5 sm:ml-4 min-w-0" aria-label="Marketing">
              <Link
                href="/about"
                className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-1.5 sm:px-2 py-1 rounded-lg hover:bg-gray-100/80 dark:hover:bg-white/5 truncate"
              >
                About
              </Link>
              <Link
                href="/pricing"
                className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-1.5 sm:px-2 py-1 rounded-lg hover:bg-gray-100/80 dark:hover:bg-white/5 truncate"
              >
                Pricing
              </Link>
              <Link
                href="/faq"
                className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-1.5 sm:px-2 py-1 rounded-lg hover:bg-gray-100/80 dark:hover:bg-white/5 truncate"
              >
                FAQ
              </Link>
              <Link
                href="/contact"
                className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-1.5 sm:px-2 py-1 rounded-lg hover:bg-gray-100/80 dark:hover:bg-white/5 truncate"
              >
                Contact
              </Link>
            </nav>
          )}
          {variant === 'admin' && (
            <span className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-0.5">
              <Shield size={12} />
              Admin Panel
            </span>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {variant === 'public' && (
            <>
              <ThemeToggle />
              {isLoggedIn ? (
                // User is logged in — show Dashboard button
                <Link href="/dashboard">
                  <Button variant="primary" size="sm">Go to Dashboard</Button>
                </Link>
              ) : (
                // Not logged in — show Sign In / Sign Up
                <>
                  <Link href="/sign-in">
                    <Button variant="ghost" size="sm">Sign In</Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button variant="primary" size="sm">Sign Up</Button>
                  </Link>
                </>
              )}
            </>
          )}

          {(variant === 'auth' || variant === 'admin') && (
            <>
              {variant === 'auth' && (
                <button
                  className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-red-500 text-white rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              )}

              <ThemeToggle />

              {/* Link back to landing page */}
              <Link
                href="/"
                className="hidden sm:inline-flex items-center text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors px-2 py-1"
              >
                ← Home
              </Link>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center">
                    {initial}
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:inline">
                    {userName}
                  </span>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 z-[60]">
                    <button
                      type="button"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => {
                        setUserMenuOpen(false);
                        router.push('/profile');
                      }}
                    >
                      Profile
                    </button>
                    <hr className="my-1 border-gray-100 dark:border-gray-800" />
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
