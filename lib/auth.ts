import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { API_BASE_URL } from "./api";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@gmail.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Bitte geben Sie E-Mail und Passwort ein.");
        }

        try {
          const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: credentials.email,
            password: credentials.password,
          });

          if (response.data && response.data.success && response.data.token) {
            const user = response.data.data;
            return {
              id: user._id || user.id,
              _id: user._id || user.id,
              name: user.name || "N Verschlüsselt",
              email: user.email,
              role: user.role || "admin",
              avatar: user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
              image: user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
              phoneNumber: user.phoneNumber || "+49 151 23456789",
              country: user.country || "Deutschland",
              cityState: user.cityState || "München",
              token: response.data.token,
              accessToken: response.data.token,
            };
          } else {
            throw new Error(response.data?.message || "Anmeldung fehlgeschlagen.");
          }
        } catch (error: any) {
          const errMsg = error.response?.data?.message || error.message || "E-Mail oder Passwort ist inkorrekt.";
          throw new Error(errMsg);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.accessToken = (user as any).token || (user as any).accessToken;
        token.role = (user as any).role || "admin";
        token._id = (user as any)._id || user.id;
        token.user = {
          _id: (user as any)._id || user.id,
          id: user.id,
          name: user.name,
          email: user.email,
          role: (user as any).role || "admin",
          avatar: (user as any).avatar,
          image: (user as any).avatar,
          phoneNumber: (user as any).phoneNumber,
          country: (user as any).country,
          cityState: (user as any).cityState,
        };
      }

      // Handle session update on client (trigger: "update")
      if (trigger === "update" && session) {
        if (session.user) {
          token.user = {
            ...((token.user as any) || {}),
            ...session.user,
          };
          if (session.user.avatar) {
            (token.user as any).avatar = session.user.avatar;
            (token.user as any).image = session.user.avatar;
          }
          if (session.user.name) {
            (token.user as any).name = session.user.name;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken as string;
        session.role = token.role as string;
        session._id = token._id as string;
        const userObj = (token.user as any) || {};
        const avatarImage = userObj.avatar || userObj.image || session.user?.image || "";

        session.user = {
          ...session.user,
          ...userObj,
          _id: token._id as string,
          role: token.role as string,
          image: avatarImage,
          avatar: avatarImage,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "e7a06OQzR1LZJDeTIYm3MDO/6IVwXktbF413Ghbt2X8=",
};
