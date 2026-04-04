'use client';

import { memo } from 'react';
import { cn } from '@/lib/cn';

export interface ChatBubbleMessage {
  id: string;
  sender_id?: string;
  senderId?: string;
  display_name?: string;
  content: string;
  sent_at?: string;
  sentAt?: string;
}

type Props = {
  msg: ChatBubbleMessage;
  isMe: boolean;
  showGroupName: boolean;
  /** True while the message is shown optimistically before the server ack. */
  isPending?: boolean;
};

function formatShortTime(iso?: string): string | null {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  } catch {
    return null;
  }
}

function ChatMessageBubbleInner({ msg, isMe, showGroupName, isPending }: Props) {
  const when = formatShortTime(msg.sent_at ?? msg.sentAt);

  return (
    <div
      className={cn(
        'flex max-w-[85%] flex-col gap-0.5 sm:max-w-[70%]',
        isMe ? 'ml-auto items-end' : 'mr-auto items-start',
        isPending && 'opacity-90'
      )}
    >
      {showGroupName && (
        <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 px-1">
          {isMe ? 'You' : (msg.display_name ?? 'Unknown')}
        </span>
      )}
      <div
        className={`rounded-2xl px-3.5 py-2 text-sm break-words shadow-sm ${
          isMe
            ? 'bg-accent text-white rounded-br-md'
            : 'bg-white dark:bg-gray-800/90 border border-gray-200/90 dark:border-gray-600/80 text-gray-800 dark:text-gray-100 rounded-bl-md'
        }`}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
      </div>
      {when && (
        <span
          suppressHydrationWarning
          className={`text-[10px] tabular-nums px-1 ${isMe ? 'text-gray-400 text-right' : 'text-gray-400'}`}
          title={new Date(msg.sent_at ?? msg.sentAt ?? '').toLocaleString()}
        >
          {when}
        </span>
      )}
    </div>
  );
}

export const ChatMessageBubble = memo(ChatMessageBubbleInner);
