import type { APIRoute } from 'astro';
import querystring from 'querystring';


var redirect_uri = 'http://localhost:4321/api/callback';
var client_id = `${import.meta.env.CLIENT_ID}`;
var client_secret = `${import.meta.env.CLIENT_SECRET}`;

export const GET: APIRoute = async ({ cookies, redirect, url, params }): Promise<any> => {
    try {
        const queries = new URLSearchParams(url.search);
        const code = queries.get('code');
        const state = queries.get('state');
        var stateKey = 'spotify_auth_state';

        var storedState = cookies ? cookies?.get(stateKey)?.value : null;

        if (state === null || state !== storedState) {
            return redirect('/#' +
                querystring.stringify({
                    error: 'state_mismatch'
                }))
        } else {
            cookies.delete(stateKey);
            var authOptions = {
                url: 'https://accounts.spotify.com/api/token',
                form: {
                    code: code,
                    redirect_uri: redirect_uri,
                    grant_type: 'authorization_code'
                },
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64')
                },
            };
            const params = new URLSearchParams();
            params.append("grant_type", authOptions.form.grant_type);
            params.append("code", authOptions.form.code as string);
            params.append("redirect_uri", authOptions.form.redirect_uri);
            const response = await fetch(authOptions.url, {
                method: "POST",
                body: params,
                headers: authOptions.headers,

            }).catch(err => console.error(err));
            const body = await response?.json();
            return redirect('/?' +
                querystring.stringify({
                    access_token: body.access_token,
                    refresh_token: body.refresh_token
                }));
        }
    } catch (error: unknown) {
        console.error(`Error in player api route: ${error as string}`);
    }
};