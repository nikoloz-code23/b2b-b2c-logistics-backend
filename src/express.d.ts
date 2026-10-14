export interface JwtPayload {
  type: string;
  id: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number; // This allows req.user.id to be accessed safely
        email?: string;
      };
    }
  }
}
