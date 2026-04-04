import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        email: string;
        role: 'student' | 'admin';
        assessment_completed: boolean;
      };
    }
  }
}
