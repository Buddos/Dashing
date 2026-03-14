import type { HandlerEvent, HandlerContext, HandlerResponse } from "@netlify/functions";
import { sql } from "./db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize, parse } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production-to-something-long";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": process.env.FRONTEND_URL || "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

function makeResponse(
  statusCode: number,
  body: unknown,
  extraHeaders: Record<string, string> = {}
): HandlerResponse {
  return {
    statusCode,
    headers: { ...CORS_HEADERS, ...extraHeaders },
    body: JSON.stringify(body),
  };
}

export const handler = async (
  event: HandlerEvent,
  _context: HandlerContext
): Promise<HandlerResponse> => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS_HEADERS, body: "" };
  }

  // Strip the function path prefix to get the route
  const route = (event.path ?? "")
    .replace("/.netlify/functions/auth", "")
    .replace(/\/$/, "") || "/";

  try {
    // ── REGISTER ────────────────────────────────────────────────────────────
    if (event.httpMethod === "POST" && route === "/register") {
      const { email, password, full_name, shop_description } = JSON.parse(event.body ?? "{}");
      if (!email || !password) {
        return makeResponse(400, { error: "Email and password required" });
      }

      const existing = await sql`SELECT id FROM public.profiles WHERE email = ${email}`;
      if (existing.length > 0) {
        return makeResponse(400, { error: "User already exists" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const rows = await sql`
        INSERT INTO public.profiles (email, password_hash, full_name, description)
        VALUES (${email}, ${passwordHash}, ${full_name ?? ""}, ${shop_description ?? ""})
        RETURNING id, email, full_name, avatar_url, created_at
      `;
      const user = rows[0];
      const token = jwt.sign({ id: user.id, email: user.email, role: "authenticated" }, JWT_SECRET, { expiresIn: "7d" });

      return makeResponse(200, { user, token }, {
        "Set-Cookie": serialize("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        }),
      });
    }

    // ── LOGIN ────────────────────────────────────────────────────────────────
    if (event.httpMethod === "POST" && route === "/login") {
      const { email, password } = JSON.parse(event.body ?? "{}");
      if (!email || !password) {
        return makeResponse(400, { error: "Email and password required" });
      }

      const rows = await sql`
        SELECT id, email, password_hash, full_name, avatar_url
        FROM public.profiles
        WHERE email = ${email}
      `;
      if (rows.length === 0) return makeResponse(400, { error: "Invalid credentials" });

      const user = rows[0] as Record<string, unknown>;
      const valid = await bcrypt.compare(password as string, user.password_hash as string);
      if (!valid) return makeResponse(400, { error: "Invalid credentials" });

      // Check if admin
      const roleRows = await sql`SELECT role FROM public.user_roles WHERE user_id = ${user.id}`;
      const role = roleRows.length > 0 && roleRows[0].role === "admin" ? "admin" : "authenticated";

      const token = jwt.sign({ id: user.id, email: user.email, role }, JWT_SECRET, { expiresIn: "7d" });
      delete user.password_hash;

      return makeResponse(200, { user, token }, {
        "Set-Cookie": serialize("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        }),
      });
    }

    // ── LOGOUT ───────────────────────────────────────────────────────────────
    if (event.httpMethod === "POST" && route === "/logout") {
      return makeResponse(200, { success: true }, {
        "Set-Cookie": serialize("token", "", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: -1,
          path: "/",
        }),
      });
    }

    // ── ME ───────────────────────────────────────────────────────────────────
    if (event.httpMethod === "GET" && route === "/me") {
      const authHeader = event.headers["authorization"] ?? "";
      const cookieHeader = event.headers["cookie"] ?? "";

      let token: string | null = null;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.slice(7);
      } else if (cookieHeader) {
        token = parse(cookieHeader).token ?? null;
      }

      if (!token) return makeResponse(401, { error: "Unauthorized" });

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
        const rows = await sql`
          SELECT id, email, full_name, avatar_url FROM public.profiles WHERE id = ${decoded.id}
        `;
        if (rows.length === 0) return makeResponse(401, { error: "User not found" });
        return makeResponse(200, { user: rows[0], role: decoded.role });
      } catch {
        return makeResponse(401, { error: "Invalid or expired token" });
      }
    }

    // ── FORGOT PASSWORD ─────────────────────────────────────────────────────
    if (event.httpMethod === "POST" && route === "/forgot-password") {
      const { email } = JSON.parse(event.body ?? "{}");
      if (!email) return makeResponse(400, { error: "Email required" });
      // In a real app, you'd send an email here. For now, we just return success.
      return makeResponse(200, { success: true, message: "If an account exists, a reset link has been sent." });
    }

    return makeResponse(404, { error: "Not Found" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Auth function error:", err);
    return makeResponse(500, { error: message });
  }
};
