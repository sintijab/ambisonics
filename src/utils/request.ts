import { setCookie } from "./cookie";

interface IOptions {
  method: string;
}
export async function fetchSpotify(url: string, options?: IOptions) {
  try {
    return await fetch(`${url}`, options).then((res) => {
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
