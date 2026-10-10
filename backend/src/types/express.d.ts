import jwt, { type JwtPayload } from "jsonwebtoken";
import { Occupation } from "../../generated/prisma/enums.ts";
interface User {
  id: number;
  username: string;
  occupation: Occupation;
  powerLevel: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
      flagId?: number;
      decodedToken: JwtPayload
    }
    interface Response {
      sendError(status: number, message: string): this;
    }
  }
}

export {};