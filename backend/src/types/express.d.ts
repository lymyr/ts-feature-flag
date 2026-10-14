import jwt, { type JwtPayload } from "jsonwebtoken";
import { Occupation } from "../../generated/prisma/enums.ts";
import type { prisma } from "../../lib/prisma.ts";
interface User {
  id: number;
  username: string;
  occupation: Occupation;
  powerLevel: number;
}

type flags = Awaited<ReturnType<typeof prisma.featureFlag.findMany>> 
  & {
    [index: number]: rules
  }
type rules = {
  rules?: Awaited<ReturnType<typeof prisma.rule.findMany>>
}


declare global {
  namespace Express {
    interface Request {
      user?: User;
      flag: Awaited<ReturnType<typeof prisma.featureFlag.findUnique>>;
      decodedToken: JwtPayload | User;
      flags: flags
    }
    interface Response {
      sendError(status: number, message: string): this;
    }
  }
}

export {};