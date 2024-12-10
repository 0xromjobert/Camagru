const { generateJWT } = require('../middleware/tokenJWT'); // Adjust the path
const { decodeBase64 } = require('../utils/base64Encoding'); // Adjust the path
const dotenv = require("dotenv").config();

describe('generateJWT function', () => {
    //const secret = 'mySecretKey'; // Replace this with your real secret
    const payload = { userId: 123, role: 'admin' };

    it('should generate a valid JWT structure (header.payload.signature)', () => {
        const token = generateJWT(payload);
        expect(token.split('.').length).toBe(3); // JWT should have 3 parts
    });

    it('should encode the header in Base64 correctly', () => {
        const token = generateJWT(payload);
        const [encodedHeader] = token.split('.');
        const decodedHeader = JSON.parse(decodeBase64(encodedHeader));
        expect(decodedHeader).toEqual({ alg: 'HS256', typ: 'JWT' });
    });

    it('should encode the payload in Base64 correctly', () => {
        const token = generateJWT(payload);
        const [, encodedPayload] = token.split('.');
        const decodedPayload = JSON.parse(decodeBase64(encodedPayload));
        expect(decodedPayload).toEqual(payload);
    });

    it('should generate a consistent signature for the same input', () => {
        const token1 = generateJWT(payload);
        const token2 = generateJWT(payload);
        expect(token1).toBe(token2); // Same payload, same secret => same signature
    });

    it('should generate a different signature for different payloads', () => {
        const token1 = generateJWT(payload);
        const token2 = generateJWT({ userId: 456, role: 'user' });
        expect(token1).not.toBe(token2);
    });

    it('should validate a token’s signature manually', () => {
        const secret = process.env.SECRET_KEY; 
        const token = generateJWT(payload);
        const [header, payloadPart, signature] = token.split('.');

        const crypto = require('crypto');
        const manualSignature = crypto.createHmac('sha256', secret)
            .update(`${header}.${payloadPart}`)
            .digest('base64')
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');

        expect(signature).toBe(manualSignature);
    });

    it('should reject a token’s signature manually', () => {
        const secret = "my-secret-key"; 
        const token = generateJWT(payload);
        const [header, payloadPart, signature] = token.split('.');

        const crypto = require('crypto');
        const manualSignature = crypto.createHmac('sha256', secret)
            .update(`${header}.${payloadPart}`)
            .digest('base64')
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');

        expect(signature).not.toBe(manualSignature);
    });
});
