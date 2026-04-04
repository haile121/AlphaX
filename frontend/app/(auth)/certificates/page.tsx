'use client';

import { useEffect, useState } from 'react';
import { backendPublicUrl, certificatesApi } from '@/lib/api';
import { useDialog } from '@/components/ui/DialogProvider';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

interface Cert {
  id: string;
  level_id: string;
  verification_code: string;
  pdf_url: string;
  issued_at: string;
}

interface TrackCert {
  id: string;
  track: string;
  verification_code: string;
  pdf_url: string;
  issued_at: string;
}

function formatIssuedDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export default function CertificatesPage() {
  const [certs, setCerts] = useState<Cert[]>([]);
  const [trackCerts, setTrackCerts] = useState<TrackCert[]>([]);
  const [loading, setLoading] = useState(true);
  const { show } = useDialog();

  useEffect(() => {
    certificatesApi
      .list()
      .then((r) => {
        setCerts(r.data.certificates);
        setTrackCerts(r.data.trackCertificates ?? []);
      })
      .catch(() => show({ variant: 'error', title: 'Error', message: 'Failed to load certificates.' }))
      .finally(() => setLoading(false));
  }, [show]);

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Certificates</h1>

      {certs.length === 0 && trackCerts.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <p className="text-4xl mb-3">🎓</p>
          <p>Complete a level or earn a reading-track certificate to see it here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {certs.map((cert) => (
            <div
              key={cert.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Level certificate</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Issued {formatIssuedDate(cert.issued_at)}
                </p>
                <p className="text-xs text-gray-400 font-mono mt-1">{cert.verification_code}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(backendPublicUrl(cert.pdf_url), '_blank')}
                >
                  ↓ Download
                </Button>
              </div>
            </div>
          ))}
          {trackCerts.map((cert) => (
            <div
              key={cert.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Reading module · {cert.track === 'cpp' ? 'C++' : 'Web fundamentals'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Issued {formatIssuedDate(cert.issued_at)}
                </p>
                <p className="text-xs text-gray-400 font-mono mt-1">{cert.verification_code}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(backendPublicUrl(cert.pdf_url), '_blank')}
                >
                  ↓ Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
