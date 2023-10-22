import type { APIRoute } from 'astro';
import res from './recommendationsMock.json';

export const GET: APIRoute = async ({ url }): Promise<any> => {
    const queries = new URLSearchParams(url.search);
    const access_token = queries.get('access_token');
    const refresh_token = queries.get('refresh_token');
    try {
        const seed_genres = queries.get('seed_genres');
        const seed_trakcs = queries.get('seed_trakcs');
        const seed_artists = queries.get('seed_artists');
        // const features = await fetch(`https://api.spotify.com/v1/recommendations?seed_genres=${seed_genres}&seed_trakcs=${seed_trakcs}&seed_artists=${seed_artists}`, {
        //     method: "GET",
        //     headers: { 'Authorization': 'Bearer ' + access_token },
        // }).catch(err => console.error(err));
        // const body = await features?.json();
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