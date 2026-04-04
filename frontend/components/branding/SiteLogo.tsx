'use client';

import Image from 'next/image';
import Link from 'next/link';
import { SITE_LOGO_PATH } from '@/lib/siteAssets';
import { cn } from '@/lib/cn';

/** Logo asset is 1:1 — image alone is fully rounded (no extra ring/frame). */
const LOGO_PX = 64;

type SiteLogoProps = {
  href?: string;
  className?: string;
  imgClassName?: string;
  /** Show “AlphaX Programming” next to the mark (hide if the image is already a full wordmark). */
  showWordmark?: boolean;
};

export function SiteLogo({
  href = '/',
  className,
  imgClassName,
  showWordmark = true,
}: SiteLogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex items-center gap-2.5 font-semibold text-gray-900 dark:text-gray-100 shrink-0 outline-none',
        'focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#080810]',
        className
      )}
    >
      <Image
        src={SITE_LOGO_PATH}
        alt="AlphaX Programming"
        width={LOGO_PX}
        height={LOGO_PX}
        className={cn(
          'size-9 shrink-0 rounded-full object-cover sm:size-10',
          imgClassName
        )}
        priority
      />
      {showWordmark && (
        <span className="text-sm hidden sm:inline tracking-tight transition-colors group-hover:text-accent dark:group-hover:text-blue-400">
          AlphaX Programming
        </span>
      )}
    </Link>
  );
}
