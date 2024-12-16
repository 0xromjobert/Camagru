const { decodeBase64, encodeBase64 } = require('../utils/base64Encoding');

describe('Base64 Encoding and Decoding', () => {
    // Simple encoding tests
    test('encodeBase64 encodes simple strings', () => {
        expect(encodeBase64('Hello')).toBe('SGVsbG8');
        expect(encodeBase64('Hel')).toBe('SGVs');
        expect(encodeBase64('H')).toBe('SA');
    });

    // Simple decoding tests
    test('decodeBase64 decodes simple strings', () => {
        expect(decodeBase64('SGVsbG8')).toBe('Hello');
        expect(decodeBase64('SGVs')).toBe('Hel');
        expect(decodeBase64('SA')).toBe('H');
    });

    // Round-trip tests (encode -> decode)
    test('encodeBase64 and decodeBase64 work together correctly', () => {
        const original = 'Base64 testing is fun!';
        const encoded = encodeBase64(original);
        const decoded = decodeBase64(encoded);
        expect(decoded).toBe(original);
    });

    // Empty string tests
    test('encodeBase64 and decodeBase64 handle empty strings', () => {
        expect(encodeBase64('')).toBe('');
        expect(decodeBase64('')).toBe('');
    });

    // Special characters
    test('encodeBase64 handles special characters', () => {
        expect(encodeBase64('!@#$%^&*()_+-=')).toBe('IUAjJCVeJiooKV8rLT0');
        expect(encodeBase64('~`<>?/|{}[]')).toBe('fmA8Pj8vfHt9W10');
    });

    test('decodeBase64 handles special characters', () => {
        expect(decodeBase64('IUAjJCVeJiooKV8rLT0')).toBe('!@#$%^&*()_+-=');
        expect(decodeBase64('fmA8Pj8vfHt9W10')).toBe('~`<>?/|{}[]');
    });

    // Non-ASCII characters (Unicode)
    test('encodeBase64 handles Unicode strings', () => {
        expect(encodeBase64('你好')).toBe('5L2g5aW9');
        expect(encodeBase64('こんにちは')).toBe('44GT44KT44Gr44Gh44Gv');
    });

    test('decodeBase64 handles Unicode strings', () => {
        expect(decodeBase64('5L2g5aW9')).toBe('你好');
        expect(decodeBase64('44GT44KT44Gr44Gh44Gv')).toBe('こんにちは');
    });

    // Long strings
    test('encodeBase64 handles long strings', () => {
        const longString = 'a'.repeat(1000); // 1000 'a's
        const encoded = encodeBase64(longString);
        const decoded = decodeBase64(encoded);
        expect(decoded).toBe(longString);
    });
    // Edge case: Already padded Base64
    test('decodeBase64 handles already padded input', () => {
        expect(decodeBase64('SGVsbG8=')).toBe('Hello'); // Valid Base64 with one padding
        expect(decodeBase64('SGVs==')).toBe('Hel'); // Valid Base64 with two paddings
    });

    // Edge case: Missing padding
    test('decodeBase64 correctly handles missing padding', () => {
        expect(decodeBase64('SGVsbG8')).toBe('Hello'); // Missing "="
        expect(decodeBase64('SGVs')).toBe('Hel'); // Missing "=="
    });
});
