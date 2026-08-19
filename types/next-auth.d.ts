import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    role?: string;
    _id?: string;
    user: {
      _id?: string;
      id?: string;
      role?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      phoneNumber?: string;
      country?: string;
      cityState?: string;
      avatar?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    _id?: string;
    role?: string;
    token?: string;
    accessToken?: string;
    phoneNumber?: string;
    country?: string;
    cityState?: string;
    avatar?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    role?: string;
    _id?: string;
    user?: any;
  }
}
