import type { HandlerEvent, HandlerContext, HandlerResponse } from "@netlify/functions";
import { sql } from "./db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production-to-something-long";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": process.env.FRONTEND_URL || "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE, OPTIONS",
};

type AuthUser = { id: string; email: string; role: string };

function makeResponse(statusCode: number, body: unknown, extraHeaders: Record<string, string> = {}): HandlerResponse {
  return {
    statusCode,
    headers: { ...CORS_HEADERS, ...extraHeaders },
    body: JSON.stringify(body),
  };
}

function getUser(event: HandlerEvent): AuthUser | null {
  const authHeader = event.headers["authorization"] ?? "";
  if (!authHeader.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(authHeader.slice(7), JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

function requireAdmin(event: HandlerEvent): AuthUser | null {
  const user = getUser(event);
  return user?.role === "admin" ? user : null;
}

export const handler = async (
  event: HandlerEvent,
  _context: HandlerContext
): Promise<HandlerResponse> => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: CORS_HEADERS, body: "" };

  const route = (event.path ?? "").replace("/.netlify/functions/api", "").replace(/\/$/, "") || "/";
  const qs = event.queryStringParameters ?? {};

  try {
    // ── PRODUCTS ─────────────────────────────────────────────────────────────
    if (route === "/products" && event.httpMethod === "GET") {
      if (qs.search) {
        const data = await sql`SELECT * FROM public.products WHERE name ILIKE ${"%" + qs.search + "%"} ORDER BY created_at DESC`;
        return makeResponse(200, data);
      }
      if (qs.category) {
        const data = await sql`SELECT * FROM public.products WHERE category_id = ${qs.category} ORDER BY created_at DESC`;
        return makeResponse(200, data);
      }
      const data = await sql`SELECT * FROM public.products ORDER BY created_at DESC`;
      return makeResponse(200, data);
    }

    if (route.match(/^\/products\/\d+$/) && event.httpMethod === "GET") {
      const id = route.split("/")[2];
      const rows = await sql`SELECT * FROM public.products WHERE id = ${id}`;
      if (rows.length === 0) return makeResponse(404, { error: "Product not found" });
      return makeResponse(200, rows[0]);
    }

    if (route.match(/^\/products\/[^/]+$/) && event.httpMethod === "GET") {
      const slug = route.split("/")[2];
      const rows = await sql`SELECT * FROM public.products WHERE slug = ${slug}`;
      if (rows.length === 0) return makeResponse(404, { error: "Product not found" });
      return makeResponse(200, rows[0]);
    }

    if (route === "/products" && event.httpMethod === "POST") {
      if (!requireAdmin(event)) return makeResponse(403, { error: "Forbidden" });
      const body = JSON.parse(event.body ?? "{}");
      const { name, slug, description, price, sale_price, stock_quantity, category_id, image_url, badge } = body;
      const rows = await sql`
        INSERT INTO public.products (name, slug, description, price, sale_price, stock_quantity, category_id, image_url, badge)
        VALUES (${name}, ${slug}, ${description ?? ""}, ${price}, ${sale_price ?? null}, ${stock_quantity ?? 0}, ${category_id ?? null}, ${image_url ?? null}, ${badge ?? null})
        RETURNING *
      `;
      return makeResponse(201, rows[0]);
    }

    if (route.match(/^\/products\/\d+$/) && event.httpMethod === "PUT") {
      if (!requireAdmin(event)) return makeResponse(403, { error: "Forbidden" });
      const id = route.split("/")[2];
      const body = JSON.parse(event.body ?? "{}");
      const { name, slug, description, price, sale_price, stock_quantity, category_id, image_url, badge } = body;
      const rows = await sql`
        UPDATE public.products SET
          name = ${name}, slug = ${slug}, description = ${description ?? ""},
          price = ${price}, sale_price = ${sale_price ?? null}, stock_quantity = ${stock_quantity ?? 0},
          category_id = ${category_id ?? null}, image_url = ${image_url ?? null}, badge = ${badge ?? null}
        WHERE id = ${id} RETURNING *
      `;
      return makeResponse(200, rows[0]);
    }

    if (route.match(/^\/products\/\d+$/) && event.httpMethod === "DELETE") {
      if (!requireAdmin(event)) return makeResponse(403, { error: "Forbidden" });
      const id = route.split("/")[2];
      await sql`DELETE FROM public.products WHERE id = ${id}`;
      return makeResponse(200, { success: true });
    }

    // ── CATEGORIES ────────────────────────────────────────────────────────────
    if (route === "/categories" && event.httpMethod === "GET") {
      const data = await sql`SELECT * FROM public.categories ORDER BY name ASC`;
      return makeResponse(200, data);
    }

    // ── REVIEWS ───────────────────────────────────────────────────────────────
    if (route.match(/^\/reviews\/\d+$/) && event.httpMethod === "GET") {
      const productId = route.split("/")[2];
      const data = await sql`
        SELECT r.*, p.full_name as author_name FROM public.reviews r
        LEFT JOIN public.profiles p ON p.id = r.user_id
        WHERE r.product_id = ${productId} AND r.status = 'approved'
        ORDER BY r.created_at DESC
      `;
      return makeResponse(200, data);
    }

    if (route === "/reviews" && event.httpMethod === "POST") {
      const user = getUser(event);
      if (!user) return makeResponse(401, { error: "Unauthorized" });
      const { product_id, rating, title, body: reviewBody } = JSON.parse(event.body ?? "{}");
      const rows = await sql`
        INSERT INTO public.reviews (product_id, user_id, rating, title, body)
        VALUES (${product_id}, ${user.id}, ${rating}, ${title ?? null}, ${reviewBody ?? null})
        RETURNING *
      `;
      return makeResponse(201, rows[0]);
    }

    // ── ORDERS ────────────────────────────────────────────────────────────────
    if (route === "/orders" && event.httpMethod === "GET") {
      const user = getUser(event);
      if (!user) return makeResponse(401, { error: "Unauthorized" });
      let data;
      if (user.role === "admin") {
        data = await sql`SELECT * FROM public.orders ORDER BY created_at DESC`;
      } else {
        data = await sql`SELECT * FROM public.orders WHERE user_id = ${user.id} ORDER BY created_at DESC`;
      }
      return makeResponse(200, data);
    }

    if (route === "/orders" && event.httpMethod === "POST") {
      const user = getUser(event);
      if (!user) return makeResponse(401, { error: "Unauthorized" });
      const { subtotal, shipping, tax, total, shipping_name, shipping_address, shipping_city, shipping_state, shipping_zip, shipping_country, items } = JSON.parse(event.body ?? "{}");
      const rows = await sql`
        INSERT INTO public.orders (user_id, subtotal, shipping, tax, total, shipping_name, shipping_address, shipping_city, shipping_state, shipping_zip, shipping_country)
        VALUES (${user.id}, ${subtotal}, ${shipping}, ${tax}, ${total}, ${shipping_name}, ${shipping_address}, ${shipping_city}, ${shipping_state}, ${shipping_zip}, ${shipping_country ?? "KE"})
        RETURNING *
      `;
      const order = rows[0];
      if (Array.isArray(items)) {
        for (const item of items) {
          await sql`
            INSERT INTO public.order_items (order_id, product_id, product_name, price, quantity)
            VALUES (${order.id}, ${item.product_id}, ${item.product_name}, ${item.price}, ${item.quantity})
          `;
        }
      }
      return makeResponse(201, order);
    }

    if (route.match(/^\/orders\/[^/]+$/) && event.httpMethod === "PUT") {
      if (!requireAdmin(event)) return makeResponse(403, { error: "Forbidden" });
      const id = route.split("/")[2];
      const { status } = JSON.parse(event.body ?? "{}");
      const rows = await sql`
        UPDATE public.orders SET status = ${status}, updated_at = now() WHERE id = ${id} RETURNING *
      `;
      return makeResponse(200, rows[0]);
    }

    if (route.match(/^\/orders\/[^/]+\/items$/) && event.httpMethod === "GET") {
      const orderId = route.split("/")[2];
      const data = await sql`SELECT * FROM public.order_items WHERE order_id = ${orderId}`;
      return makeResponse(200, data);
    }

    // ── CART ──────────────────────────────────────────────────────────────────
    if (route === "/cart" && event.httpMethod === "GET") {
      const user = getUser(event);
      if (!user) return makeResponse(401, { error: "Unauthorized" });
      const data = await sql`
        SELECT c.*, p.name, p.price, p.sale_price, p.image_url FROM public.cart_items c
        JOIN public.products p ON p.id = c.product_id
        WHERE c.user_id = ${user.id}
      `;
      return makeResponse(200, data);
    }

    if (route === "/cart" && event.httpMethod === "POST") {
      const user = getUser(event);
      if (!user) return makeResponse(401, { error: "Unauthorized" });
      const { product_id, quantity } = JSON.parse(event.body ?? "{}");
      const rows = await sql`
        INSERT INTO public.cart_items (user_id, product_id, quantity)
        VALUES (${user.id}, ${product_id}, ${quantity ?? 1})
        ON CONFLICT (user_id, product_id) DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
        RETURNING *
      `;
      return makeResponse(200, rows[0]);
    }

    if (route.match(/^\/cart\/\d+$/) && event.httpMethod === "PUT") {
      const user = getUser(event);
      if (!user) return makeResponse(401, { error: "Unauthorized" });
      const productId = route.split("/")[2];
      const { quantity } = JSON.parse(event.body ?? "{}");
      const rows = await sql`
        UPDATE public.cart_items SET quantity = ${quantity} WHERE user_id = ${user.id} AND product_id = ${productId} RETURNING *
      `;
      return makeResponse(200, rows[0]);
    }

    if (route.match(/^\/cart\/\d+$/) && event.httpMethod === "DELETE") {
      const user = getUser(event);
      if (!user) return makeResponse(401, { error: "Unauthorized" });
      const productId = route.split("/")[2];
      await sql`DELETE FROM public.cart_items WHERE user_id = ${user.id} AND product_id = ${productId}`;
      return makeResponse(200, { success: true });
    }

    // ── WISHLIST ──────────────────────────────────────────────────────────────
    if (route === "/wishlist" && event.httpMethod === "GET") {
      const user = getUser(event);
      if (!user) return makeResponse(401, { error: "Unauthorized" });
      const data = await sql`
        SELECT w.*, p.name, p.price, p.sale_price, p.image_url FROM public.wishlist w
        JOIN public.products p ON p.id = w.product_id
        WHERE w.user_id = ${user.id}
      `;
      return makeResponse(200, data);
    }

    if (route === "/wishlist" && event.httpMethod === "POST") {
      const user = getUser(event);
      if (!user) return makeResponse(401, { error: "Unauthorized" });
      const { product_id } = JSON.parse(event.body ?? "{}");
      const rows = await sql`
        INSERT INTO public.wishlist (user_id, product_id) VALUES (${user.id}, ${product_id})
        ON CONFLICT (user_id, product_id) DO NOTHING RETURNING *
      `;
      return makeResponse(200, rows[0] ?? {});
    }

    if (route.match(/^\/wishlist\/\d+$/) && event.httpMethod === "DELETE") {
      const user = getUser(event);
      if (!user) return makeResponse(401, { error: "Unauthorized" });
      const productId = route.split("/")[2];
      await sql`DELETE FROM public.wishlist WHERE user_id = ${user.id} AND product_id = ${productId}`;
      return makeResponse(200, { success: true });
    }

    // ── USERS (admin) ─────────────────────────────────────────────────────────
    if (route === "/users" && event.httpMethod === "GET") {
      if (!requireAdmin(event)) return makeResponse(403, { error: "Forbidden" });
      const profiles = await sql`SELECT id, email, full_name, phone, city, country, created_at FROM public.profiles ORDER BY created_at DESC`;
      const roles = await sql`SELECT user_id, role FROM public.user_roles WHERE role = 'admin'`;
      const adminIds = new Set(roles.map((r: Record<string, string>) => r.user_id));
      const data = profiles.map((p: Record<string, unknown>) => ({ ...p, isAdmin: adminIds.has(p.id as string) }));
      return makeResponse(200, data);
    }

    // ── REVIEWS (admin moderation) ──────────────────────────────────────────
    if (route === "/admin/reviews" && event.httpMethod === "GET") {
      if (!requireAdmin(event)) return makeResponse(403, { error: "Forbidden" });
      const data = await sql`SELECT r.*, p.name as product_name, pr.full_name as author_name FROM public.reviews r LEFT JOIN public.products p ON p.id = r.product_id LEFT JOIN public.profiles pr ON pr.id = r.user_id ORDER BY r.created_at DESC`;
      return makeResponse(200, data);
    }

    if (route.match(/^\/admin\/reviews\/[^/]+$/) && event.httpMethod === "PUT") {
      if (!requireAdmin(event)) return makeResponse(403, { error: "Forbidden" });
      const id = route.split("/")[3];
      const { status } = JSON.parse(event.body ?? "{}");
      const rows = await sql`UPDATE public.reviews SET status = ${status} WHERE id = ${id} RETURNING *`;
      return makeResponse(200, rows[0]);
    }

    // ── CONTACT MESSAGES ─────────────────────────────────────────────────────
    if (route === "/contact" && event.httpMethod === "POST") {
      const { name, email, subject, message } = JSON.parse(event.body ?? "{}");
      const rows = await sql`
        INSERT INTO public.contact_messages (name, email, subject, message)
        VALUES (${name}, ${email}, ${subject ?? ""}, ${message})
        RETURNING *
      `;
      return makeResponse(201, rows[0]);
    }

    if (route === "/admin/messages" && event.httpMethod === "GET") {
      if (!requireAdmin(event)) return makeResponse(403, { error: "Forbidden" });
      const data = await sql`SELECT * FROM public.contact_messages ORDER BY created_at DESC`;
      return makeResponse(200, data);
    }

    if (route.match(/^\/admin\/messages\/[^/]+$/) && event.httpMethod === "PUT") {
      if (!requireAdmin(event)) return makeResponse(403, { error: "Forbidden" });
      const id = route.split("/")[3];
      const { status, admin_reply } = JSON.parse(event.body ?? "{}");
      const rows = await sql`UPDATE public.contact_messages SET status = ${status}, admin_reply = ${admin_reply ?? null}, updated_at = now() WHERE id = ${id} RETURNING *`;
      return makeResponse(200, rows[0]);
    }

    // ── CONTACT INFO ──────────────────────────────────────────────────────────
    if (route === "/contact-info" && event.httpMethod === "GET") {
      const data = await sql`SELECT * FROM public.contact_info`;
      return makeResponse(200, data);
    }

    if (route.match(/^\/contact-info\/[^/]+$/) && event.httpMethod === "PUT") {
      if (!requireAdmin(event)) return makeResponse(403, { error: "Forbidden" });
      const key = route.split("/")[2];
      const { value } = JSON.parse(event.body ?? "{}");
      const rows = await sql`UPDATE public.contact_info SET value = ${value}, updated_at = now() WHERE key = ${key} RETURNING *`;
      return makeResponse(200, rows[0]);
    }

    // ── TEAM MEMBERS ──────────────────────────────────────────────────────────
    if (route === "/team" && event.httpMethod === "GET") {
      const data = await sql`SELECT * FROM public.team_members ORDER BY sort_order ASC`;
      return makeResponse(200, data);
    }

    if (route === "/team" && event.httpMethod === "POST") {
      if (!requireAdmin(event)) return makeResponse(403, { error: "Forbidden" });
      const { name, role, bio, image_url, email, sort_order, is_founder } = JSON.parse(event.body ?? "{}");
      const rows = await sql`
        INSERT INTO public.team_members (name, role, bio, image_url, email, sort_order, is_founder)
        VALUES (${name}, ${role ?? ""}, ${bio ?? null}, ${image_url ?? null}, ${email ?? null}, ${sort_order ?? 0}, ${is_founder ?? false})
        RETURNING *
      `;
      return makeResponse(201, rows[0]);
    }

    if (route.match(/^\/team\/[^/]+$/) && event.httpMethod === "PUT") {
      if (!requireAdmin(event)) return makeResponse(403, { error: "Forbidden" });
      const id = route.split("/")[2];
      const { name, role, bio, image_url, email, sort_order, is_founder } = JSON.parse(event.body ?? "{}");
      const rows = await sql`
        UPDATE public.team_members SET name=${name}, role=${role ?? ""}, bio=${bio ?? null}, image_url=${image_url ?? null}, email=${email ?? null}, sort_order=${sort_order ?? 0}, is_founder=${is_founder ?? false}
        WHERE id = ${id} RETURNING *
      `;
      return makeResponse(200, rows[0]);
    }

    if (route.match(/^\/team\/[^/]+$/) && event.httpMethod === "DELETE") {
      if (!requireAdmin(event)) return makeResponse(403, { error: "Forbidden" });
      const id = route.split("/")[2];
      await sql`DELETE FROM public.team_members WHERE id = ${id}`;
      return makeResponse(200, { success: true });
    }

    // ── PROFILE ───────────────────────────────────────────────────────────────
    if (route === "/profile" && event.httpMethod === "GET") {
      const user = getUser(event);
      if (!user) return makeResponse(401, { error: "Unauthorized" });
      const rows = await sql`SELECT id, email, full_name, avatar_url, phone, address_line1, address_line2, city, state, zip_code, country FROM public.profiles WHERE id = ${user.id}`;
      return makeResponse(200, rows[0] ?? {});
    }

    if (route === "/profile" && event.httpMethod === "PUT") {
      const user = getUser(event);
      if (!user) return makeResponse(401, { error: "Unauthorized" });
      const { full_name, avatar_url, phone, address_line1, address_line2, city, state, zip_code, country } = JSON.parse(event.body ?? "{}");
      const rows = await sql`
        UPDATE public.profiles SET
          full_name=${full_name ?? null}, avatar_url=${avatar_url ?? null}, phone=${phone ?? null},
          address_line1=${address_line1 ?? null}, address_line2=${address_line2 ?? null},
          city=${city ?? null}, state=${state ?? null}, zip_code=${zip_code ?? null},
          country=${country ?? "KE"}, updated_at=now()
        WHERE id = ${user.id} RETURNING id, email, full_name, avatar_url, phone, city, country
      `;
      return makeResponse(200, rows[0]);
    }

    return makeResponse(404, { error: "Endpoint not found" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error("API function error:", err);
    return makeResponse(500, { error: message });
  }
};
