import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      plan?: string;
      emailVerified?: boolean;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    plan?: string;
    emailVerified?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id?: string;
    plan?: string;
    emailVerified?: boolean;
  }
}
