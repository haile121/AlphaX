'use client';

import { useEffect, useState, useCallback } from 'react';
import { authApi, gamificationApi } from '@/lib/api';
import { useGamificationRefresh } from '@/lib/gamificationRefresh';
import { XPBar } from '@/components/shared/XPBar';
import { StreakIndicator } from '@/components/shared/StreakIndicator';
import { Spinner } from '@/components/ui/Spinner';
import type { User } from '@/types';
import { User as UserIcon, Mail, Shield, Coins, Trophy, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ xp: number; coins: number; streak: number; level: string | null } | null>(null);
  const [badges, setBadges] = useState<{ id: string; name_en: string; name_am: string; icon_url: string; earned_at: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (showSpinner: boolean) => {
    if (showSpinner) setLoading(true);
    try {
      const meRes = await authApi.me();
      const u = meRes.data.user;
      setUser(u);

      try {
        const profRes = await gamificationApi.profile();
        setProfile(profRes.data.profile);
      } catch {
        setProfile({
          xp: u.xp,
          coins: u.coins,
          streak: u.streak,
          level: u.level,
        });
      }

      try {
        const badgesRes = await gamificationApi.badges();
        setBadges(badgesRes.data.badges);
      } catch {
        setBadges([]);
      }
    } catch {
      if (showSpinner) {
        setUser(null);
        setProfile(null);
      }
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile(true);
  }, [loadProfile]);

  useGamificationRefresh(() => loadProfile(false));

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" /></div>;

  if (!user || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <UserIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Profile Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400">We couldn't load your profile information.</p>
      </div>
    );
  }

  const initial = user.display_name?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Your Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your account and view your learning progress.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - User Info */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-1"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4 ring-4 ring-white dark:ring-gray-800">
              {initial}
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.display_name}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{user.email}</p>
            
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider">
                <Shield size={12} />
                {user.role}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold uppercase tracking-wider">
                <Trophy size={12} />
                {user.level || 'Novice'}
              </span>
            </div>

            <div className="w-full pt-6 border-t border-gray-100 dark:border-gray-700 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-gray-500 dark:text-gray-400 gap-2"><Mail size={16} /> Email</span>
                <span className="text-gray-900 dark:text-white font-medium truncate max-w-[150px]">{user.email}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-gray-500 dark:text-gray-400 gap-2"><Award size={16} /> Language</span>
                <span className="text-gray-900 dark:text-white font-medium uppercase">{user.language_pref}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column - Stats & Badges */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          {/* Stats Row */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
              <div className="flex items-center gap-3 text-amber-500 mb-2">
                <Coins size={20} />
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">Coins</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.coins}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
              <div className="flex items-center gap-3 text-orange-500 mb-2">
                <StreakIndicator streak={profile.streak} />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.streak} Days</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 text-blue-500 mb-2">
                <Trophy size={20} />
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">Total XP</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.xp}</p>
            </div>
          </motion.div>

          {/* XP Progress */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Level Progress</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-500 dark:text-gray-400">Current Level</span>
                <span className="text-accent">{profile.xp} XP</span>
              </div>
              <XPBar xp={profile.xp} />
              <p className="text-xs text-gray-500 dark:text-gray-500 text-right mt-2">
                Keep learning to earn more XP!
              </p>
            </div>
          </motion.div>

          {/* Badges */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Your Badges</h3>
            {badges.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {badges.map((badge) => (
                  <div key={badge.id} className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 text-center">
                    <img src={badge.icon_url} alt={badge.name_en} className="w-12 h-12 mb-2 drop-shadow-md" />
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">{badge.name_en}</span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">{new Date(badge.earned_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award size={24} className="text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No badges yet.</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Complete lessons to earn badges!</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
