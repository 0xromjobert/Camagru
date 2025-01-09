const crypto = require("crypto");
const dotenv = require("dotenv").config();
const {encodeBase64, decodeBase64} = require("../utils/base64Encoding");
const { verify } = require("../controllers/emailHelper");
const secret = process.env.SECRET_KEY;

//to take off after testing
console.log("Loaded SECRET_KEY:", process.env.SECRET_KEY, "vs ", secret);

/*
main function to auth with a twist on absent logged in so it can be used as state as well
*/
function authToken(req, res, next) {
    try {
        const token = req.cookies.authToken;

        if (!token) {
            // No token: Treat as not logged in
            req.user = null;
            return next();
        }

        const payload = verifyJWT(token); // Verifies and decodes the token
        if (!payload) {
            // Invalid or expired token: clear cookie and inform the client
            res.clearCookie('authToken');
            return res.status(403).json({
                error: 403,
                message: "Invalid or expired credentials. Please login again."
            });
        }

        // Token is valid, attach user info to req
        req.user = payload;
        next();

    } catch (error) {
        console.error("Error validating token:", error);
        // Treat as not logged in for unexpected errors
        req.user = null;
        next();
    }
}

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

function verifyJWT(token) {
    try{
        parts = token.split(".");
        if (parts.length !== 3) 
            throw new Error("Invalid token format");
        const [header, payload, signature] = parts;
        const expectedSignature = crypto.createHmac("sha256", secret)
            .update(header + "." + payload)
            .digest("base64")
            .replace(/=/g, "")
            .replace(/\+/g, "-")
            .replace(/\//g, "_");
        if (signature !== expectedSignature) 
            throw new Error("Invalid or tampered token");
        const decodedPayload = JSON.parse(decodeBase64(payload));
        if (!decodedPayload.exp || decodedPayload.exp < Math.floor(Date.now() / 1000)) 
            throw new Error("Token expired");
        return decodedPayload;
    }
    catch (error) {
        //console.error("Error verifying token:", error);
        return null;
    }
}
     
module.exports = {generateJWT, authToken, verifyJWT};