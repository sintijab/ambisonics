import type { APIRoute } from "astro";
import { decodeBasicAuth } from "../../utils/auth";

export const GET: APIRoute = async ({ request }): Promise<any> => {
  try {
    const password = decodeBasicAuth(request.headers.get('authorization')!);
    const password_api = `${import.meta.env.PASSWORD_API}`;
    if (password === password_api) {
        return new Response(JSON.stringify('Success'), {
            headers: {
              "Content-Type": "application/json",
              // "Cache-Control": "no-store",
              // "Content-Security-Policy": "frame-ancestors 'none'",
              // // "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
              // "X-Content-Type-Options": "nosniff",
              // "X-Frame-Options": "DENY",
              // "Access-Control-Allow-Origin": '*'
            },
          });
    } else {
        return new Response(JSON.stringify(`Unauthorized`), {
            status: 401,
            headers: {
              "Content-Type": "application/json",
              // "Cache-Control": "no-store",
              // "Content-Security-Policy": "frame-ancestors 'none'",
              // // "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
              // "X-Content-Type-Options": "nosniff",
              // "X-Frame-Options": "DENY",
              // "Access-Control-Allow-Origin": '*'
            },
          });
    }
  } catch (error: unknown) {
    console.error(`Error in player api route: ${error as string}`);
  }
};
