import res from "./discoverMock.json";
import { decodeBasicAuth } from "../../utils/auth";
import { config } from "https://deno.land/x/dotenv/mod.ts";

export const POST = async ({ request }: { request: Request }): Promise<any> => {
  try {
    const password = decodeBasicAuth(request.headers.get('authorization')!);
    const password_api = config().PASSWORD_API;
    if (password === password_api) {
    const data = await request.formData();
    const url = "https://shazam-api6.p.rapidapi.com/shazam/recognize/";
    const options = {
      method: "POST",
      headers: {
        "X-RapidAPI-Key": config().RAPID_API_KEY,
        "X-RapidAPI-Host": "shazam-api6.p.rapidapi.com",
      },
      body: data,
    };
    // const response = await fetch(url, options as any);
    // @ts-ignore
    // const res = await response.json();
      return new Response(JSON.stringify(res), {
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
  } catch (error) {
    console.error(error);
  }
};
