import { getAuthToken } from "./auth";
import { getCookie, setCookie } from "./cookie";

interface IOptions {
  method: string;
  headers: Headers;
}
export async function fetchSpotify(url: string, options?: IOptions) {
  try {
    const password = getCookie("basic_auth_pw");
    let headers = new Headers();
    let username = "user";
    headers.set("Authorization", "Basic " + btoa(username + ":" + password));
    const updatedOptions = {
      ...options,
      headers
    }
    return await fetch(`${url}`, updatedOptions).then((res) => {
      if (res.ok) {
        return res.json();
      }
      return res.json().then((err) => {
        console.log(err);
        if (err.access_token) {
          setCookie("access_token", err.access_token, 30);
          return null;
        }
      });
    });
  } catch (e) {
    console.log(e);
  }
}
