'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useDialog } from '@/components/ui/DialogProvider';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

interface FlaggedMessage {
  id: string;
  sender_id: string;
  display_name: string;
  content: string;
  conversation_type: string;
  sent_at: string;
}

function formatSentAt(value: string): string {
  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  });
}

export default function AdminModerationPage() {
  const [messages, setMessages] = useState<FlaggedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { show } = useDialog();

  useEffect(() => {
    api.get<{ messages: FlaggedMessage[] }>('/api/admin/flagged-messages')
      .then((r) => setMessages(r.data.messages))
      .finally(() => setLoading(false));
  }, []);

  function handleDelete(msg: FlaggedMessage) {
    show({
      variant: 'confirm',
      title: 'Delete Message',
      message: `Permanently delete this message from ${msg.display_name}?`,
      primaryAction: {
        label: 'Delete',
        onClick: async () => {
          await api.delete(`/api/admin/messages/${msg.id}`);
          setMessages((prev) => prev.filter((m) => m.id !== msg.id));
        },
      },
    });
  }

  if (loading) return <div className="flex justify-center p-16"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Flagged Messages ({messages.length})
      </h1>

      {messages.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No flagged messages.</p>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-900 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{msg.display_name}</p>
                  <p className="text-xs text-gray-400 mb-2">{formatSentAt(msg.sent_at)} · {msg.conversation_type}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-red-50 dark:bg-red-950 rounded-lg px-3 py-2">
                    {msg.content}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleDelete(msg)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
