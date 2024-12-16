const express = require('express');
const request = require('supertest');
const { authToken, generateJWT } = require('../middleware/tokenJWT'); // Import the middleware and JWT generator

// Set up an Express application for testing
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// Define a protected route that uses the authToken middleware
app.get('/protected', authToken, (req, res) => {
    res.status(200).json({ message: 'Access granted', user: req.user });
});

// Define a public route that doesn't require authentication
app.get('/public', (req, res) => {
    res.status(200).json({ message: 'Public access' });
});

describe('authToken Middleware', () => {
    let validToken; // Store a valid JWT for use in the tests

    beforeAll(() => {
        // Generate a valid JWT before running the tests
        validToken = generateJWT({
            username: 'testuser',
            user_id: 12345,
            exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
        });
    });

    // Test case 1: Verify that a valid token grants access to the protected route
    test('should grant access with a valid token', async () => {
        const response = await request(app)
            .get('/protected') // Make a GET request to the protected route
            .set('Authorization', `Bearer ${validToken}`); // Add the valid token in the Authorization header

        // Verify the response
        expect(response.statusCode).toBe(200); // Check that the status code is 200 (OK)
        expect(response.body).toHaveProperty('message', 'Access granted'); // Check for the success message
        expect(response.body).toHaveProperty('user'); // Ensure the user data is returned
        expect(response.body.user).toEqual(
            expect.objectContaining({
                username: 'testuser',
                user_id: 12345,
            })
        );
    });

    // Test case 2: Verify that access is denied when the Authorization header is missing
    test('should deny access if Authorization header is missing', async () => {
        const response = await request(app).get('/protected'); // No Authorization header is included

        // Verify the response
        expect(response.statusCode).toBe(401); // Check that the status code is 401 (Unauthorized)
        expect(response.body).toHaveProperty('message', 'Missing Authorization header'); // Check the error message
    });

    // Test case 3: Verify that access is denied when the token is invalid
    test('should deny access if token is invalid', async () => {
        const response = await request(app)
            .get('/protected') // Make a GET request to the protected route
            .set('Authorization', 'Bearer invalidtoken'); // Add an invalid token in the Authorization header

        // Verify the response
        expect(response.statusCode).toBe(401); // Check that the status code is 401 (Unauthorized)
        expect(response.body).toHaveProperty('message', 'Invalid token'); // Check the error message
    });

    // Test case 4: Verify that access is denied when the token has expired
    test('should deny access if token is expired', async () => {
        const expiredToken = generateJWT({
            username: 'testuser',
            user_id: 12345,
            exp: Math.floor(Date.now() / 1000) - 3600, // Token expired 1 hour ago
        });

        const response = await request(app)
            .get('/protected') // Make a GET request to the protected route
            .set('Authorization', `Bearer ${expiredToken}`); // Add the expired token in the Authorization header

        // Verify the response
        expect(response.statusCode).toBe(401); // Check that the status code is 401 (Unauthorized)
        expect(response.body).toHaveProperty('message', 'Invalid token'); // Check the error message
    });

    // Test case 5: Verify that the public route is accessible without authentication
    test('should grant access to public route without token', async () => {
        const response = await request(app).get('/public'); // Make a GET request to the public route

        // Verify the response
        expect(response.statusCode).toBe(200); // Check that the status code is 200 (OK)
        expect(response.body).toHaveProperty('message', 'Public access'); // Check the success message
    });
});
