import type { APIRoute } from "astro";
import { decodeBasicAuth } from "../../utils/auth";

export const GET: APIRoute = async ({ request }): Promise<any> => {
const password = decodeBasicAuth(request.headers.get('authorization')!);
const password_api = `${import.meta.env.PASSWORD_API}`;
if (password === password_api) {
  var client_id = `${import.meta.env.CLIENT_ID}`;
  var client_secret = `${import.meta.env.CLIENT_SECRET}`;
  try {
      var authOptions = {
        url: "https://accounts.spotify.com/api/token",
        form: {
          grant_type: "client_credentials",
        },
        headers: {
          Authorization:
            "Basic " + btoa(client_id + ":" + client_secret)
        },
      };
      const params = new URLSearchParams();
      params.append("grant_type", authOptions.form.grant_type);
      const response = await fetch(authOptions.url, {
        method: "POST",
        body: params,
        headers: authOptions.headers,
      }).catch((err) => console.error(err));
      const body = await response?.json();
      return new Response(
        JSON.stringify({
          access_token: body.access_token,
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
            "Content-Security-Policy": "frame-ancestors 'none'",
            // "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "Access-Control-Allow-Origin": '*'
          },
        },
      );
    } catch (error: unknown) {
    console.error(`Error in player api route: ${error as string}`);
  }
} else {
    return new Response(JSON.stringify('Unauthorized'), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
