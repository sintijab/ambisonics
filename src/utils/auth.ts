export function decodeBasicAuth(authorization: string) {
    if (!authorization) {
        return null;
    }
    const decoded = new Buffer(authorization!.split(" ")[1], 'base64').toString();
    return decoded.split(':')[1];
}