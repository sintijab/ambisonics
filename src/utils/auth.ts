export function decodeBasicAuth(authorization: string) {
    if (!authorization) {
        return null;
    }
    const decoded = atob(authorization.split(" ")[1]);
    return decoded.split(':')[1];
}