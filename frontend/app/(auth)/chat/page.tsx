'use client';

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { flushSync } from 'react-dom';
import api from '@/lib/api';
import { chatWS } from '@/lib/websocket';
import { getToken } from '@/lib/auth';
import { useDialog } from '@/components/ui/DialogProvider';
import { ChevronDown, ChevronLeft, Loader2, MessageCircle, Send, WifiOff } from 'lucide-react';
import { ChatMessageBubble } from '@/components/chat/ChatMessageBubble';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/cn';
import { formatRelativeTime } from '@/lib/formatRelativeTime';

/** Keep DOM/React work bounded for very active chats (server already limits history fetch). */
const MAX_MESSAGES_IN_MEMORY = 250;
const MAX_MESSAGE_LEN = 4000;

/** Pending row id prefix — replaced when the server echoes the real message id. */
const OPT_PREFIX = 'opt-';

function trimMessages(msgs: ChatMessage[]): ChatMessage[] {
  if (msgs.length <= MAX_MESSAGES_IN_MEMORY) return msgs;
  return msgs.slice(-MAX_MESSAGES_IN_MEMORY);
}

type Tab = 'dm' | 'groups';

interface Conversation {
  partner_id: string;
  display_name: string;
  last_message: string;
  sent_at: string;
}

interface Group {
  id: string;
  name: string;
  creator_id: string;
  member_count?: number;
  is_member?: number;
}

interface ChatMessage {
  id: string;
  sender_id?: string;
  senderId?: string;
  display_name?: string;
  content: string;
  sent_at?: string;
  sentAt?: string;
  type?: string;
  conversationId?: string;
  error?: string;
}

interface UserResult {
  id: string;
  display_name: string;
}

export default function ChatPage() {
  const [tab, setTab] = useState<Tab>('dm');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeName, setActiveName] = useState('');
  const [activeType, setActiveType] = useState<'direct' | 'group'>('direct');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [myId, setMyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [showBrowse, setShowBrowse] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [showJumpBottom, setShowJumpBottom] = useState(false);
  const [hasMoreOlder, setHasMoreOlder] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const myIdRef = useRef<string | null>(null);
  const scrollRestoreRef = useRef<{ prevHeight: number } | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const activeTypeRef = useRef<'direct' | 'group'>('direct');
  const messageIdsRef = useRef<Set<string>>(new Set());
  const scrollAfterLoadRef = useRef(true);
  const forceScrollAfterSendRef = useRef(false);
  const { show } = useDialog();
  const showRef = useRef(show);
  showRef.current = show;

  // Keep refs in sync so WS handler can read latest values without re-subscribing
  useEffect(() => { activeIdRef.current = activeId; }, [activeId]);
  useEffect(() => { activeTypeRef.current = activeType; }, [activeType]);

  useEffect(() => {
    api.get<{ user: { id: string } }>('/api/auth/me')
      .then((r) => setMyId(r.data.user.id))
      .catch(() => {});
  }, []);

  useEffect(() => {
    myIdRef.current = myId;
  }, [myId]);

  useEffect(() => {
    setWsConnected(chatWS.isReady());
    return chatWS.onConnectionChange(setWsConnected);
  }, []);

  // Connect WS once on mount; do not depend on dialog `show` (stable anyway) to avoid churn.
  useEffect(() => {
    api.get('/api/auth/ws-token').then(() => {
      const token = getToken();
      if (token) chatWS.connect(token);
    }).catch(() => {});

    const unsub = chatWS.onMessage((data) => {
      const msg = data as ChatMessage;
      if (msg.error) {
        showRef.current({ variant: 'warning', title: 'Message Blocked', message: msg.error });
        setMessages((prev) => {
          const next = prev.filter((m) => !m.id?.startsWith(OPT_PREFIX));
          messageIdsRef.current = new Set(next.map((x) => x.id).filter(Boolean));
          return next;
        });
        return;
      }
      const msgConvId = msg.conversationId ?? msg.sender_id ?? msg.senderId;
      const currentId = activeIdRef.current;
      const currentType = activeTypeRef.current;

      const belongs =
        (currentType === 'group' && msgConvId === currentId) ||
        (currentType === 'direct' && (msgConvId === currentId || msg.senderId === currentId || msg.sender_id === currentId));

      if (belongs) {
        setMessages((prev) => {
          const me = myIdRef.current;
          const sid = msg.senderId ?? msg.sender_id ?? '';
          const realId = msg.id;

          // Reconcile optimistic send with server echo (same content, your message)
          if (me && sid === me && msg.content && realId) {
            const idx = prev.findIndex(
              (m) => m.id?.startsWith(OPT_PREFIX) && m.content === msg.content
            );
            if (idx >= 0) {
              const oldId = prev[idx].id;
              if (oldId) messageIdsRef.current.delete(oldId);
              messageIdsRef.current.add(realId);
              const next = [...prev];
              next[idx] = {
                id: realId,
                sender_id: sid,
                display_name: msg.display_name,
                content: msg.content,
                sent_at: msg.sentAt ?? new Date().toISOString(),
              };
              const trimmed = trimMessages(next);
              if (trimmed.length < next.length) {
                messageIdsRef.current = new Set(trimmed.map((m) => m.id).filter(Boolean));
              }
              return trimmed;
            }
          }

          if (realId && messageIdsRef.current.has(realId)) {
            return prev;
          }
          const row: ChatMessage = {
            id: realId ?? `ws-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            sender_id: sid,
            display_name: msg.display_name,
            content: msg.content,
            sent_at: msg.sentAt ?? new Date().toISOString(),
          };
          if (row.id) messageIdsRef.current.add(row.id);
          const merged = [...prev, row];
          const next = trimMessages(merged);
          if (next.length < merged.length) {
            messageIdsRef.current = new Set(next.map((m) => m.id).filter(Boolean));
          }
          return next;
        });
      }

      // Bump DM conversation list preview (last message + order)
      if (msg.type !== 'group' && msg.content && !msg.error) {
        const me = myIdRef.current;
        const sid = msg.senderId ?? msg.sender_id;
        const cid = msg.conversationId;
        if (me && sid && cid) {
          const partnerId = sid === me ? cid : sid;
          const sentAt = msg.sentAt ?? new Date().toISOString();
          setConversations((prev) => {
            const found = prev.find((c) => c.partner_id === partnerId);
            const name = found?.display_name ?? msg.display_name ?? 'Unknown';
            const rest = prev.filter((c) => c.partner_id !== partnerId);
            const next = [
              ...rest,
              { partner_id: partnerId, display_name: name, last_message: msg.content, sent_at: sentAt },
            ];
            next.sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());
            return next;
          });
        }
      }
    });

    return () => {
      unsub();
      chatWS.disconnect();
    };
  }, []);

  const loadConversations = useCallback(() => {
    api.get<{ conversations: Conversation[] }>('/api/chat/conversations')
      .then((r) => setConversations(r.data.conversations))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loadGroups = useCallback(() => {
    api.get<{ groups: Group[] }>('/api/chat/groups')
      .then((r) => setGroups(r.data.groups))
      .catch(() => {});
  }, []);

  const loadAllGroups = useCallback(() => {
    api.get<{ groups: Group[] }>('/api/chat/groups/all')
      .then((r) => setAllGroups(r.data.groups))
      .catch(() => {});
  }, []);

  useEffect(() => { loadConversations(); loadGroups(); }, [loadConversations, loadGroups]);

  useEffect(() => {
    if (!activeId) return;
    messageIdsRef.current.clear();
    scrollAfterLoadRef.current = true;
    setMessages([]);
    setMessagesLoading(true);
    api
      .get<{ messages: ChatMessage[]; hasMore?: boolean }>(`/api/chat/messages/${activeId}`)
      .then((r) => {
        const seen = new Set<string>();
        const list = r.data.messages.filter((m) => {
          if (!m.id) return true;
          if (seen.has(m.id)) return false;
          seen.add(m.id);
          return true;
        });
        list.forEach((m) => {
          if (m.id) messageIdsRef.current.add(m.id);
        });
        setMessages(list);
        setHasMoreOlder(Boolean(r.data.hasMore));
      })
      .catch(() => {})
      .finally(() => setMessagesLoading(false));
  }, [activeId]);

  useLayoutEffect(() => {
    if (!scrollRestoreRef.current || !scrollContainerRef.current) return;
    const el = scrollContainerRef.current;
    const { prevHeight } = scrollRestoreRef.current;
    scrollRestoreRef.current = null;
    el.scrollTop += el.scrollHeight - prevHeight;
  }, [messages]);

  const loadOlderMessages = useCallback(() => {
    if (!activeId || messages.length === 0 || loadingOlder || !hasMoreOlder) return;
    const firstId = messages[0].id;
    if (!firstId) return;
    const container = scrollContainerRef.current;
    if (container) {
      scrollRestoreRef.current = { prevHeight: container.scrollHeight };
    }
    setLoadingOlder(true);
    api
      .get<{ messages: ChatMessage[]; hasMore?: boolean }>(
        `/api/chat/messages/${activeId}?before=${encodeURIComponent(firstId)}`
      )
      .then((r) => {
        const seen = new Set(messageIdsRef.current);
        const prepend = r.data.messages.filter((m) => m.id && !seen.has(m.id));
        prepend.forEach((m) => {
          if (m.id) messageIdsRef.current.add(m.id);
        });
        setMessages((prev) => {
          const merged = [...prepend, ...prev];
          const next = trimMessages(merged);
          if (next.length < merged.length) {
            messageIdsRef.current = new Set(next.map((m) => m.id).filter(Boolean));
          }
          return next;
        });
        setHasMoreOlder(Boolean(r.data.hasMore));
      })
      .catch(() => {})
      .finally(() => setLoadingOlder(false));
  }, [activeId, messages, loadingOlder, hasMoreOlder]);

  useEffect(() => {
    const ta = inputRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(Math.max(ta.scrollHeight, 48), 160)}px`;
  }, [input]);

  useLayoutEffect(() => {
    if (messages.length === 0) {
      setShowJumpBottom(false);
      return;
    }
    const container = scrollContainerRef.current;
    const bottom = bottomRef.current;
    if (!bottom) return;

    if (scrollAfterLoadRef.current) {
      scrollAfterLoadRef.current = false;
      bottom.scrollIntoView({
        behavior: messages.length > 24 ? 'auto' : 'smooth',
        block: 'end',
      });
      setShowJumpBottom(false);
      return;
    }

    if (forceScrollAfterSendRef.current) {
      forceScrollAfterSendRef.current = false;
      bottom.scrollIntoView({ behavior: 'smooth', block: 'end' });
      setShowJumpBottom(false);
      return;
    }

    if (container) {
      const gap = container.scrollHeight - container.scrollTop - container.clientHeight;
      const nearBottom = gap < 100;
      if (nearBottom) {
        bottom.scrollIntoView({ behavior: 'smooth', block: 'end' });
        setShowJumpBottom(false);
      } else {
        setShowJumpBottom(gap > 120);
      }
    }
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    setShowJumpBottom(false);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const t = setTimeout(() => {
      api.get<{ users: UserResult[] }>(`/api/chat/users/search?q=${encodeURIComponent(searchQuery)}`)
        .then((r) => setSearchResults(r.data.users))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  function openDM(userId: string, name: string) {
    setActiveId(userId); setActiveName(name); setActiveType('direct');
    setSearching(false); setSearchQuery(''); setSearchResults([]);
  }

  function openGroup(groupId: string, name: string) {
    setActiveId(groupId); setActiveName(name); setActiveType('group');
    setShowBrowse(false);
  }

  async function createGroup() {
    if (!newGroupName.trim()) return;
    const name = newGroupName.trim();
    try {
      const res = await api.post<{ group: Group }>('/api/chat/groups', { name });
      const newGroup = res.data.group;
      // Immediately add to "My Groups" state and open it
      setGroups((prev) => [newGroup, ...prev]);
      setNewGroupName('');
      setShowNewGroup(false);
      openGroup(newGroup.id, newGroup.name);
    } catch {
      show({ variant: 'error', title: 'Error', message: 'Failed to create group' });
    }
  }

  async function joinGroup(groupId: string, name: string) {
    try {
      await api.post(`/api/chat/groups/${groupId}/join`);
      loadGroups();
      loadAllGroups();
      openGroup(groupId, name);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      if (e.response?.data?.error === 'Already a member') {
        openGroup(groupId, name);
      } else {
        show({ variant: 'error', title: 'Error', message: 'Failed to join group' });
      }
    }
  }

  async function leaveGroup(groupId: string) {
    try {
      await api.post(`/api/chat/groups/${groupId}/leave`);
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      if (activeId === groupId) { setActiveId(null); setActiveName(''); }
    } catch {
      show({ variant: 'error', title: 'Error', message: 'Failed to leave group' });
    }
  }

  function handleSend() {
    const text = input.trim();
    if (!text || !activeId) return;
    if (text.length > MAX_MESSAGE_LEN) {
      show({
        variant: 'warning',
        title: 'Message too long',
        message: `Please keep messages under ${MAX_MESSAGE_LEN} characters.`,
      });
      return;
    }
    if (!chatWS.isReady()) {
      show({
        variant: 'warning',
        title: 'Not connected',
        message: 'Chat is reconnecting. Wait a second and try again.',
      });
      return;
    }

    const me = myIdRef.current;
    if (me) {
      const optimisticId = `${OPT_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      flushSync(() => {
        setMessages((prev) => {
          const row: ChatMessage = {
            id: optimisticId,
            sender_id: me,
            content: text,
            sent_at: new Date().toISOString(),
          };
          messageIdsRef.current.add(optimisticId);
          const merged = [...prev, row];
          const next = trimMessages(merged);
          if (next.length < merged.length) {
            messageIdsRef.current = new Set(next.map((m) => m.id).filter(Boolean));
          }
          return next;
        });
      });
    }

    forceScrollAfterSendRef.current = true;
    chatWS.send(activeType, activeId, text);
    setInput('');
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] max-w-5xl mx-auto flex-col bg-gray-50/50 dark:bg-gray-950/40 md:flex-row">
      {/* Sidebar */}
      <div
        className={cn(
          'w-full border-r border-gray-200 dark:border-gray-700 flex flex-col shrink-0 bg-white/80 dark:bg-gray-900/40 backdrop-blur-sm',
          'md:w-64 md:min-w-[16rem]',
          activeId ? 'hidden md:flex' : 'flex min-h-0 flex-1 md:max-h-none md:flex-none'
        )}
      >
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {(['dm', 'groups'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setTab(t); setSearching(false); setShowBrowse(false); setShowNewGroup(false); }}
              className={cn(
                'flex-1 py-3 text-sm font-medium transition-colors',
                tab === t
                  ? 'text-accent border-b-2 border-accent bg-accent/5'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              {t === 'dm' ? 'Direct' : 'Groups'}
            </button>
          ))}
        </div>

        {/* DM tab */}
        {tab === 'dm' && (
          <>
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              {!searching ? (
                <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => setSearching(true)}>+ New Message</Button>
              ) : (
                <div className="space-y-1">
                  <input autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-accent" />
                  <button onClick={() => { setSearching(false); setSearchQuery(''); }} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              {searching && searchResults.map((u) => (
                <button key={u.id} onClick={() => openDM(u.id, u.display_name)}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{u.display_name}</p>
                </button>
              ))}
              {loading ? <div className="flex justify-center p-4"><Spinner size="sm" /></div>
                : conversations.length === 0 && !searching
                  ? <p className="text-xs text-gray-400 p-4">No conversations yet.</p>
                  : conversations.map((c) => (
                    <button key={c.partner_id} onClick={() => openDM(c.partner_id, c.display_name)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${activeId === c.partner_id ? 'bg-accent/5 border-r-2 border-accent' : ''}`}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{c.display_name}</p>
                        {c.sent_at && (
                          <span className="text-[10px] shrink-0 text-gray-400 tabular-nums">
                            {formatRelativeTime(c.sent_at)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{c.last_message}</p>
                    </button>
                  ))}
            </div>
          </>
        )}

        {/* Groups tab */}
        {tab === 'groups' && (
          <>
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 space-y-2">
              <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => { setShowNewGroup(!showNewGroup); setShowBrowse(false); }}>+ Create Group</Button>
              <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => { setShowBrowse(!showBrowse); setShowNewGroup(false); if (!showBrowse) loadAllGroups(); }}>Browse Groups</Button>
              {showNewGroup && (
                <div className="space-y-1 pt-1">
                  <input autoFocus value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && createGroup()} placeholder="Group name..."
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-accent" />
                  <div className="flex gap-1">
                    <Button size="sm" className="flex-1 text-xs" onClick={createGroup}>Create</Button>
                    <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => { setShowNewGroup(false); setNewGroupName(''); }}>Cancel</Button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              {showBrowse ? (
                <>
                  <p className="text-xs text-gray-400 px-4 py-2 border-b border-gray-100 dark:border-gray-800">All Groups</p>
                  {allGroups.length === 0
                    ? <p className="text-xs text-gray-400 p-4">No groups yet.</p>
                    : allGroups.map((g) => (
                      <div key={g.id} className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{g.name}</p>
                          <p className="text-xs text-gray-400">{g.member_count ?? 0} members</p>
                        </div>
                        {g.is_member
                          ? <button onClick={() => openGroup(g.id, g.name)} className="text-xs text-accent shrink-0">Open</button>
                          : <button onClick={() => joinGroup(g.id, g.name)} className="text-xs bg-accent text-white px-2 py-1 rounded-lg shrink-0">Join</button>}
                      </div>
                    ))}
                </>
              ) : (
                <>
                  <p className="text-xs text-gray-400 px-4 py-2 border-b border-gray-100 dark:border-gray-800">My Groups</p>
                  {groups.length === 0
                    ? <p className="text-xs text-gray-400 p-4">No groups yet. Create or browse groups.</p>
                    : groups.map((g) => (
                      <div key={g.id} className={`flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 ${activeId === g.id ? 'bg-accent/5 border-r-2 border-accent' : ''}`}>
                        <button onClick={() => openGroup(g.id, g.name)} className="flex-1 text-left min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{g.name}</p>
                        </button>
                        <button onClick={() => leaveGroup(g.id)} className="text-xs text-red-400 hover:text-red-600 shrink-0 ml-2">Leave</button>
                      </div>
                    ))}
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Chat area */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 min-h-0 bg-gradient-to-b from-white/90 to-gray-50/90 dark:from-gray-900/80 dark:to-gray-950/90',
          !activeId && 'hidden md:flex'
        )}
      >
        {!activeId ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center text-gray-500 dark:text-gray-400">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
              <MessageCircle className="h-7 w-7" aria-hidden />
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-xs">
              {tab === 'dm' ? 'Select a conversation or start a new message' : 'Select or join a group to start chatting'}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 max-w-sm">
              Enter sends the message. Shift+Enter adds a new line.
            </p>
          </div>
        ) : (
          <>
            <div className="px-3 sm:px-4 py-3 border-b border-gray-200/90 dark:border-gray-700/90 flex items-center justify-between gap-3 bg-white/60 dark:bg-gray-900/50 backdrop-blur-sm">
              <div className="min-w-0 flex items-center gap-1">
                <button
                  type="button"
                  className="md:hidden p-1.5 -ml-1 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 shrink-0"
                  onClick={() => { setActiveId(null); setActiveName(''); }}
                  aria-label="Back to conversations"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white truncate">{activeName}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1.5">
                  {wsConnected ? (
                    <span className="inline-flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
                      Live
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      <WifiOff className="h-3 w-3 shrink-0" aria-hidden />
                      Reconnecting…
                    </span>
                  )}
                </p>
                </div>
              </div>
              {activeType === 'group' && (
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full shrink-0">
                  Group
                </span>
              )}
            </div>

            <div className="relative flex-1 flex flex-col min-h-0">
              {!wsConnected && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-full bg-amber-100/95 dark:bg-amber-950/90 text-amber-900 dark:text-amber-200 text-xs font-medium shadow-sm border border-amber-200/80 dark:border-amber-800/60">
                  Reconnecting — you cannot send until you are online.
                </div>
              )}

              <div
                ref={scrollContainerRef}
                onScroll={() => {
                  const el = scrollContainerRef.current;
                  if (!el) return;
                  const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
                  setShowJumpBottom(gap > 120 && messages.length > 0);
                }}
                className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 py-4 space-y-3 min-h-0 overscroll-contain [contain:content]"
              >
                {hasMoreOlder && !messagesLoading && messages.length > 0 && (
                  <div className="flex justify-center pb-2">
                    <button
                      type="button"
                      onClick={loadOlderMessages}
                      disabled={loadingOlder}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-600 bg-white/90 dark:bg-gray-800/90 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60"
                    >
                      {loadingOlder ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                      ) : null}
                      {loadingOlder ? 'Loading…' : 'Load older messages'}
                    </button>
                  </div>
                )}
                {messagesLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-500">
                    <Spinner size="lg" />
                    <span className="text-xs">Loading messages…</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 dark:text-gray-500 px-4">
                    <p className="text-sm">No messages yet.</p>
                    <p className="text-xs mt-1">Say hello to start the thread.</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const senderId = msg.sender_id ?? msg.senderId ?? '';
                    const isMe = senderId === myId;
                    return (
                      <ChatMessageBubble
                        key={msg.id ? `${msg.id}-${index}` : `msg-${index}`}
                        msg={msg}
                        isMe={isMe}
                        showGroupName={activeType === 'group'}
                        isPending={Boolean(msg.id?.startsWith(OPT_PREFIX))}
                      />
                    );
                  })
                )}
                <div ref={bottomRef} className="h-px shrink-0" aria-hidden />
              </div>

              {showJumpBottom && !messagesLoading && (
                <button
                  type="button"
                  onClick={scrollToBottom}
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-600 bg-white/95 dark:bg-gray-800/95 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                  Latest messages
                </button>
              )}
            </div>

            <div className="p-3 sm:p-4 border-t border-gray-200/80 dark:border-gray-800 bg-gradient-to-t from-gray-50/95 to-white/90 dark:from-gray-950/90 dark:to-gray-900/85 backdrop-blur-md">
              <div className="flex gap-2.5 items-end max-w-3xl mx-auto">
                <div
                  className={cn(
                    'group/input flex min-h-0 min-w-0 flex-1 flex-col rounded-[1.35rem] border bg-white/95 shadow-inner transition-[border-color,box-shadow] dark:bg-gray-900/70',
                    'border-gray-200/95 dark:border-gray-700/90',
                    'focus-within:border-accent/55 focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] dark:focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]',
                    !wsConnected &&
                      'border-amber-200/90 dark:border-amber-900/60 focus-within:border-amber-400/50 dark:focus-within:border-amber-700/50'
                  )}
                >
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v.length <= MAX_MESSAGE_LEN) setInput(v);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    rows={1}
                    enterKeyHint="send"
                    autoComplete="off"
                    spellCheck
                    placeholder={wsConnected ? 'Write a message…' : 'Reconnecting — you can still type a draft'}
                    maxLength={MAX_MESSAGE_LEN}
                    className={cn(
                      'w-full min-h-[48px] max-h-40 resize-none bg-transparent px-4 py-3 text-[15px] leading-[1.45]',
                      'text-gray-900 dark:text-gray-100',
                      'placeholder:text-gray-400 dark:placeholder:text-gray-400',
                      'caret-accent dark:caret-blue-400',
                      'selection:bg-accent/20 selection:text-gray-900 dark:selection:bg-accent/25 dark:selection:text-white',
                      'focus:outline-none'
                    )}
                    aria-label="Message"
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="h-12 w-12 shrink-0 rounded-2xl p-0 shadow-sm transition-transform active:scale-95"
                  onClick={handleSend}
                  disabled={!input.trim() || !wsConnected}
                  aria-label="Send message"
                >
                  <Send className="h-[18px] w-[18px]" />
                </Button>
              </div>
              <div className="flex items-center justify-between gap-2 max-w-3xl mx-auto mt-2 px-1">
                <p className="text-[10px] text-gray-400 dark:text-gray-500 hidden sm:block">
                  Enter to send · Shift+Enter for new line
                </p>
                <p
                  className={cn(
                    'text-[10px] tabular-nums ml-auto sm:ml-0',
                    input.length > MAX_MESSAGE_LEN - 200 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500'
                  )}
                >
                  {input.length}/{MAX_MESSAGE_LEN}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
