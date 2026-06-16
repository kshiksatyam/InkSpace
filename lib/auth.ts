import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/types";

/**
 * NextAuth.js v5 configuration for InkSpace.
 * Supports two authentication strategies:
 *   1. Credentials (email + bcrypt-hashed password)
 *   2. Google OAuth
 *
 * Uses JWT strategy since Credentials provider doesn't support database sessions.
 * Custom callbacks inject user ID and username into the JWT and session objects.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt", // JWT required for Credentials provider compatibility
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      /**
       * When a user signs in with Google for the first time, we need to
       * generate a unique username from their email prefix. If it's taken,
       * we append random digits.
       */
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          username: profile.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, ""),
        };
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      /**
       * Validates user credentials against the database.
       * Returns the user object if valid, or null to reject the sign-in.
       */
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        // User not found or is an OAuth-only account (no password)
        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    /**
     * JWT callback — runs every time a JWT is created or updated.
     * On initial sign-in, we fetch the user from DB to get their username and id.
     */
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // Initial sign-in: add custom fields to the JWT
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email! },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.username = dbUser.username;
        }
      }

      // Handle session updates (e.g., when user changes their username/name)
      if (trigger === "update" && session) {
        token.name = session.name;
        token.username = session.username;
        token.picture = session.image;
      }

      return token;
    },
    /**
     * Session callback — shapes the session object exposed to the client.
     * Injects id and username from the JWT into session.user.
     */
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as SessionUser).id = token.id as string;
        (session.user as SessionUser).username = token.username as string;
      }
      return session;
    },
  },
  events: {
    /**
     * After a new Google OAuth user is created, ensure they have a unique username.
     * If their email-derived username is already taken, append random digits.
     */
    async createUser({ user }) {
      if (user.id) {
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        if (dbUser && !dbUser.username) {
          let baseUsername = (user.email?.split("@")[0] || "user")
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, "");
          let username = baseUsername;
          let counter = 1;

          // Keep trying until we find a unique username
          while (await prisma.user.findUnique({ where: { username } })) {
            username = `${baseUsername}${counter}`;
            counter++;
          }

          await prisma.user.update({
            where: { id: user.id },
            data: { username },
          });
        }
      }
    },
  },
});

// Augment the NextAuth types to include our custom fields
declare module "next-auth" {
  interface Session {
    user: SessionUser;
  }
}

declare module "next-auth" {
  interface User {
    username?: string;
  }
}
