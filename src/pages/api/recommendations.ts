import type { APIRoute } from "astro";
// import res from "./recommendationsMock.json";
import { decodeBasicAuth } from "../../utils/auth";

export const GET: APIRoute = async ({ url, request }): Promise<any> => {
  const password = decodeBasicAuth(request.headers.get('authorization')!);
  const password_api = `${import.meta.env.PASSWORD_API}`;

  const queries = new URLSearchParams(url.search);
  const access_token = queries.get("access_token");
  const refresh_token = queries.get("refresh_token");

  const headers = new Headers();
  const username = "user";
  headers.set("Authorization", "Basic " + btoa(username + ":" + password));
  try {
    const seed_genres = queries.get("seed_genres");
    const seed_trakcs = queries.get("seed_trakcs");
    const seed_artists = queries.get("seed_artists");
    if (password === password_api) {
      const features = await fetch(`https://api.spotify.com/v1/recommendations?seed_genres=${seed_genres}&seed_trakcs=${seed_trakcs}&seed_artists=${seed_artists}`, {
          method: "GET",
          headers: { 'Authorization': 'Bearer ' + access_token },
      }).catch(err => console.error(err));
      const body = await features?.json();
      if (body?.error?.status === 401) {
          throw new Error(body.error.message);
      }
      return new Response(JSON.stringify(body), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
          "Content-Security-Policy": "frame-ancestors 'none'",
          "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
          "Access-Control-Allow-Origin": '*'
        },
      });
    } else {
      return new Response(JSON.stringify('Unauthorized'), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  } catch (error: unknown) {
    console.error(`Error in player api route: ${error as string}`);
    const updated_token = await fetch(
      `${import.meta.env.CANONICAL_URL}/api/refresh?refresh_token=${refresh_token}`,
      { headers }
    ).catch((err) => console.error(err));
    const body = await updated_token?.json();
    return new Response(JSON.stringify(body), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "Content-Security-Policy": "frame-ancestors 'none'",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Access-Control-Allow-Origin": '*'
      },
    });
  }
};
