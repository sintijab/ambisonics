import { getCookie, setCookie } from "./cookie";

export function decodeBasicAuth(authorization: string) {
    if (!authorization) {
        return null;
    }
    const decoded = atob(authorization.split(" ")[1]);
    return decoded.split(':')[1];
}

export async function getAuthToken() {
    const password = getCookie("basic_auth_pw");
    let headers = new Headers();
    let username = "user";
    headers.set("Authorization", "Basic " + btoa(username + ":" + password));
    const res = await fetch('api/token', { headers }).then((res) => res.json());
    setCookie("access_token", res.access_token, 30);
    return await res.access_token;
}