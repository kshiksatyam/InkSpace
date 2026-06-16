import { handlers } from "@/lib/auth";

/**
 * NextAuth.js API route handler.
 * Handles all authentication requests: sign-in, sign-out, callback, session, etc.
 * Delegates to the handlers exported from the auth configuration.
 */
export const { GET, POST } = handlers;
