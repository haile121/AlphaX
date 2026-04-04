'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { certificatesApi } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';

interface VerifyResult {
  certificate: { issued_at: string };
  display_name: string;
  level_label: string;
}

function formatIssuedDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export default function VerifyCertificatePage() {
  const { code } = useParams<{ code: string }>();
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    certificatesApi.verify(code)
      .then((r) => setResult(r.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center shadow-sm">
        {notFound ? (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Certificate Not Found</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              The verification code <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded">{code}</span> does not match any certificate.
            </p>
          </>
        ) : result ? (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Valid Certificate</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">This certificate is authentic.</p>

            <div className="space-y-3 text-left">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500">Student</span>
                <span className="font-medium text-gray-900 dark:text-white">{result.display_name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500">Level</span>
                <Badge variant="success">{result.level_label}</Badge>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500">Issued</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {formatIssuedDate(result.certificate.issued_at)}
                </span>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
