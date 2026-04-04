'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Terminal,
  Bot,
  Trophy,
  TrendingUp,
  MessageSquare,
  Award,
  Users,
  ShieldAlert,
  Shield,
  Video,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { motion } from 'framer-motion';

interface SidebarProps {
  variant: 'auth' | 'admin';
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean | ((prev: boolean) => boolean)) => void;
  /** When set, show a link to the admin panel (user must have admin role). */
  showAdminLink?: boolean;
}

/** Primary navigation (ends at Chat). */
const primaryNavItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Lessons', href: '/lessons', icon: BookOpen },
  { label: 'AI Tutor', href: '/ai-tutor', icon: Bot },
  { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { label: 'Progress', href: '/progress', icon: TrendingUp },
  { label: 'Chat', href: '/chat', icon: MessageSquare },
];

/** Shown below Chat — compiler, certificates, placement & tracks. */
const studentToolsItems = [
  { label: 'Compiler', href: '/compiler', icon: Terminal },
  { label: 'Certificates', href: '/certificates', icon: Award },
  { label: 'More tools', href: '/tools', icon: Sparkles },
];

const adminPanelLink = { label: 'Admin', href: '/admin/dashboard', icon: Shield };

const adminNavItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Lessons', href: '/admin/lessons', icon: BookOpen },
  { label: 'Track resources', href: '/admin/track-resources', icon: Video },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Moderation', href: '/admin/moderation', icon: ShieldAlert },
];

export function Sidebar({ variant, isCollapsed, setIsCollapsed, showAdminLink }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const renderNavLink = (label: string, href: string, Icon: typeof LayoutDashboard) => {
    const active = pathname === href || pathname.startsWith(href + '/');
    return (
      <Link
        key={href}
        href={href}
        onClick={() => setMobileOpen(false)}
        className="group relative flex items-center w-full"
        title={isCollapsed ? label : undefined}
      >
        {active && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-accent/10 dark:bg-accent-dark/20 rounded-xl"
            initial={false}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}

        <div
          className={cn(
            'relative flex items-center justify-center rounded-xl w-full py-2.5 transition-all',
            isCollapsed ? 'px-0' : 'px-3 justify-start gap-4',
            active
              ? 'text-accent dark:text-accent-dark font-semibold'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
          )}
        >
          <Icon size={20} className={cn('shrink-0', active ? 'drop-shadow-sm' : '')} />

          {!isCollapsed && <span className="text-[15px] truncate">{label}</span>}
        </div>

        {isCollapsed && (
          <div className="absolute left-14 px-2 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
            {label}
          </div>
        )}
      </Link>
    );
  };

  const NavContent = () => {
    if (variant === 'admin') {
      return (
        <nav className="flex flex-col gap-1 p-3 mt-4 flex-1">
          {adminNavItems.map(({ label, href, icon: Icon }) => renderNavLink(label, href, Icon))}
        </nav>
      );
    }

    return (
      <nav className="flex flex-col gap-1 p-3 mt-4 flex-1">
        {primaryNavItems.map(({ label, href, icon: Icon }) => (
          <div key={href}>{renderNavLink(label, href, Icon)}</div>
        ))}

        <div
          className={cn(
            'mt-2 mb-0.5 border-t border-gray-100 dark:border-white/5 pt-3',
            isCollapsed && 'mt-1 pt-2'
          )}
        >
          {!isCollapsed && (
            <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Student tools
            </p>
          )}
          {isCollapsed && (
            <div className="mx-auto mb-1 h-px w-8 rounded-full bg-gray-200 dark:bg-gray-700" aria-hidden />
          )}
        </div>

        {studentToolsItems.map(({ label, href, icon: Icon }) => (
          <div key={href}>{renderNavLink(label, href, Icon)}</div>
        ))}

        {showAdminLink ? (
          <div className="mt-2 border-t border-gray-100 dark:border-white/5 pt-2">
            {renderNavLink(adminPanelLink.label, adminPanelLink.href, adminPanelLink.icon)}
          </div>
        ) : null}
      </nav>
    );
  };

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-800 lg:hidden shadow-sm"
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X size={20} className="text-gray-700 dark:text-gray-200" /> : <Menu size={20} className="text-gray-700 dark:text-gray-200" />}
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        suppressHydrationWarning
        className={cn(
          'fixed left-0 top-16 bottom-0 z-40 bg-white/80 dark:bg-[#0a0a0f]/80 backdrop-blur-xl',
          'border-r border-gray-100 dark:border-white/5 flex flex-col',
          'transition-transform duration-300 ease-in-out lg:translate-x-0',
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full',
          !mobileOpen && (isCollapsed ? 'lg:w-20' : 'lg:w-64')
        )}
      >
        <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
          <NavContent />
        </div>

        <div className="hidden lg:flex p-4 border-t border-gray-100 dark:border-white/5 pb-6">
          <button
            onClick={() => setIsCollapsed((v) => !v)}
            className="flex items-center justify-center w-full p-2.5 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <div className="flex items-center justify-between w-full px-1">
                <span className="text-sm font-medium">Collapse</span>
                <ChevronLeft size={20} />
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
