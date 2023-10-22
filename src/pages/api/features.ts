import type { APIRoute } from 'astro';
import res from './featuresMock.json';

export const GET: APIRoute = async ({ url }): Promise<any> => {
    try {
        const queries = new URLSearchParams(url.search);
        const access_token = queries.get('access_token');
        const trackId = queries.get('track_id');
        // const features = await fetch(`https://api.spotify.com/v1/audio-features/${trackId}`, {
        //     method: "GET",
        //     headers: { 'Authorization': 'Bearer ' + access_token },
        // }).catch(err => console.error(err));
        // const body = await features?.json();
        // if (body?.error?.status === 401) {
        //     throw new Error(body.error.message);
        // }
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
    } catch (error: unknown) {
        console.error(`Error in player api route: ${error as string}`);
        const updated_token = await fetch(`http://localhost:4321/api/refresh?refresh_token=${refresh_token}`).catch(err => console.error(err));
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