import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { query } from '../../db/connection';

interface AuthenticatedWS extends WebSocket {
  userId?: string;
  isAlive?: boolean;
}

const wsInboundSchema = z.object({
  type: z.enum(['direct', 'group']),
  conversationId: z.string().uuid(),
  content: z
    .string()
    .min(1)
    .max(4000),
});

/** Max UTF-8 length after trim — enforced again after trim. */
const MAX_CONTENT = 4000;

// Map userId -> Set of WebSocket connections
const clients = new Map<string, Set<AuthenticatedWS>>();

/** Simple sliding-window rate limit: max messages per minute per user. */
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 45;
const rateTimestamps = new Map<string, number[]>();

function allowRate(userId: string): boolean {
  const now = Date.now();
  const arr = rateTimestamps.get(userId) ?? [];
  const recent = arr.filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) return false;
  recent.push(now);
  rateTimestamps.set(userId, recent);
  return true;
}

const BLOCKED_KEYWORDS = ['spam', 'abuse', 'hate']; // extend as needed

function isFlagged(content: string): boolean {
  const lower = content.toLowerCase();
  return BLOCKED_KEYWORDS.some((kw) => lower.includes(kw));
}

function broadcast(recipientId: string, payload: object) {
  const sockets = clients.get(recipientId);
  if (!sockets) return;
  const data = JSON.stringify(payload);
  for (const ws of sockets) {
    if (ws.readyState === WebSocket.OPEN) ws.send(data);
  }
}

function sendWsError(ws: WebSocket, message: string) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ error: message }));
  }
}

export function attachWebSocketServer(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws/chat' });

  wss.on('connection', (ws: AuthenticatedWS, req: IncomingMessage) => {
    const url = new URL(req.url ?? '', 'http://localhost');
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(4001, 'Unauthorized');
      return;
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET ?? 'secret') as { sub: string };
      ws.userId = payload.sub;
      ws.isAlive = true;
    } catch {
      ws.close(4001, 'Invalid token');
      return;
    }

    if (!clients.has(ws.userId!)) clients.set(ws.userId!, new Set());
    clients.get(ws.userId!)!.add(ws);

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', async (raw) => {
      try {
        let parsedJson: unknown;
        try {
          parsedJson = JSON.parse(raw.toString());
        } catch {
          sendWsError(ws, 'Invalid JSON');
          return;
        }

        const parsed = wsInboundSchema.safeParse(parsedJson);
        if (!parsed.success) {
          sendWsError(ws, 'Invalid message: check type, conversation id, and content (1–4000 characters).');
          return;
        }

        const content = parsed.data.content.trim();
        if (!content) {
          sendWsError(ws, 'Message cannot be empty.');
          return;
        }
        if (content.length > MAX_CONTENT) {
          sendWsError(ws, `Message too long (max ${MAX_CONTENT} characters).`);
          return;
        }

        const { type, conversationId } = parsed.data;
        const senderId = ws.userId!;

        if (!allowRate(senderId)) {
          sendWsError(ws, 'You are sending messages too quickly. Please wait a moment.');
          return;
        }

        if (type === 'direct') {
          if (conversationId === senderId) {
            sendWsError(ws, 'Cannot send a direct message to yourself.');
            return;
          }
          const userRows = await query<{ id: string }[]>(
            'SELECT id FROM users WHERE id = ? AND is_active = true',
            [conversationId]
          );
          if (userRows.length === 0) {
            sendWsError(ws, 'Recipient not found.');
            return;
          }
        } else {
          const member = await query<{ user_id: string }[]>(
            'SELECT user_id FROM group_members WHERE group_id = ? AND user_id = ?',
            [conversationId, senderId]
          );
          if (member.length === 0) {
            sendWsError(ws, 'You are not a member of this group.');
            return;
          }
        }

        const flagged = isFlagged(content);

        const msgId = randomUUID();
        await query(
          `INSERT INTO messages (id, sender_id, conversation_type, conversation_id, content, is_flagged)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [msgId, senderId, type, conversationId, content, flagged]
        );

        if (flagged) {
          sendWsError(ws, 'Message flagged for moderation and not delivered.');
          return;
        }

        const nameRows = await query<{ display_name: string }[]>(
          'SELECT display_name FROM users WHERE id = ?',
          [senderId]
        );
        const displayName = nameRows[0]?.display_name;

        const outgoing = {
          id: msgId,
          senderId,
          sender_id: senderId,
          display_name: displayName,
          type,
          conversationId,
          content,
          sentAt: new Date().toISOString(),
        };

        if (type === 'direct') {
          broadcast(conversationId, outgoing);
          broadcast(senderId, outgoing);
        } else {
          const members = await query<{ user_id: string }[]>(
            'SELECT user_id FROM group_members WHERE group_id = ?',
            [conversationId]
          );
          for (const m of members) broadcast(m.user_id, outgoing);
        }
      } catch (err) {
        console.error('[ws] message error:', err);
        sendWsError(ws, 'Failed to send message. Please try again.');
      }
    });

    ws.on('close', () => {
      if (ws.userId) {
        clients.get(ws.userId)?.delete(ws);
        if (clients.get(ws.userId)?.size === 0) clients.delete(ws.userId);
      }
    });
  });

  const heartbeat = setInterval(() => {
    wss.clients.forEach((socket) => {
      const aws = socket as AuthenticatedWS;
      if (!aws.isAlive) {
        aws.terminate();
        return;
      }
      aws.isAlive = false;
      aws.ping();
    });
  }, 30_000);

  wss.on('close', () => clearInterval(heartbeat));

  return wss;
}
