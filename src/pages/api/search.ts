import type { APIRoute } from "astro";
import res from "./searchMock.json";
import { decodeBasicAuth } from "../../utils/auth";


export const GET: APIRoute = async ({ url, request }): Promise<any> => {
  const queries = new URLSearchParams(url.search);
  const refresh_token = queries.get("refresh_token");
  const password = decodeBasicAuth(request.headers.get('authorization')!);

  const headers = new Headers();
  const username = "user";
  headers.set("Authorization", "Basic " + btoa(username + ":" + password));

  try {
    const password_api = `${import.meta.env.PASSWORD_API}`;
    const queries = new URLSearchParams(url.search);
    const access_token = queries.get("access_token");
    let query = queries.get("q")!;
    query = encodeURI(query);
    if (password === password_api) {
    // const features = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track`, {
    //     method: "GET",
    //     headers: { 'Authorization': 'Bearer ' + access_token },
    // });
    // const body = await (features as Response)?.json();
    const body = res;
    // if (body?.error?.status === 401) {
    //     throw new Error(body.error.message);
    // }
    return new Response(JSON.stringify(body), {
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
      `http://localhost:4321/api/refresh?refresh_token=${refresh_token}`,
      { headers }
    ).catch((err) => console.error(err));
    const body = await updated_token?.json();
    return new Response(JSON.stringify(body), {
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
};
