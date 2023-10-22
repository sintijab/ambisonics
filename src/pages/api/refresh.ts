import type { APIRoute } from "astro";

var client_id = `${import.meta.env.CLIENT_ID}`;
var client_secret = `${import.meta.env.CLIENT_SECRET}`;

export const GET: APIRoute = async ({ url }): Promise<any> => {
  try {
    const queries = new URLSearchParams(url.search);
    const refresh_token = queries.get("refresh_token");
    var authOptions = {
      url: "https://accounts.spotify.com/api/token",
      headers: {
        Authorization:
          "Basic " +
          new Buffer(client_id + ":" + client_secret).toString("base64"),
      },
      form: {
        grant_type: "refresh_token",
        refresh_token: refresh_token,
      },
      json: true,
    };
    const params = new URLSearchParams();
    params.append("grant_type", authOptions.form.grant_type);
    params.append("refresh_token", authOptions.form.refresh_token as string);

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
          // "Cache-Control": "no-store",
          // "Content-Security-Policy": "frame-ancestors 'none'",
          // // "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
          // "X-Content-Type-Options": "nosniff",
          // "X-Frame-Options": "DENY",
          // "Access-Control-Allow-Origin": '*'
        },
      },
    );
  } catch (error: unknown) {
    console.error(`Error in player api route: ${error as string}`);
  }
};
