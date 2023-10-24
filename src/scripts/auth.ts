import { getCookie, setCookie } from "../utils/cookie";

let pw = getCookie("basic_auth_pw")!;
if (!pw) {
    pw = prompt("Enter the password");
}
let url = "api/auth";
let username = "user";
let headers = new Headers();
headers.set("Authorization", "Basic " + btoa(username + ":" + pw));
fetch(url, {
    method: "GET",
    headers,
})
    .then((response) => {
        if (response.ok) {
            setCookie("basic_auth_pw", pw, 30);
            return response.json();
        }
    })
    .catch((_) => console.log("test"));