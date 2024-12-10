const crypto = require("crypto");
const dotenv = require("dotenv").config();

const {encodeBase64, decodeBase64} = require("../utils/base64Encoding");
const secret = process.env.SECRET_KEY;
console.log("Loaded SECRET_KEY:", process.env.SECRET_KEY, "vs ", secret);

function generateJWT(payload) {
    const header = JSON.stringify({alg: "HS256", typ: "JWT"});
    const tokenHeader = encodeBase64(header);
    const tokenPayload = encodeBase64(JSON.stringify(payload));
    const signature = crypto.createHmac("sha256", secret)
        .update(tokenHeader + "." + tokenPayload)
        .digest("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
    const token = `${tokenHeader}.${tokenPayload}.${signature}`;
    return token;
}

module.exports = {generateJWT};