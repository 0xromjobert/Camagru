const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../app'); // Your Express app
const { query } = require('../config/database');
const { generateJWT } = require('../middleware/tokenJWT');

jest.mock('bcrypt'); // Mock bcrypt for testing
jest.mock('../config/database'); // Mock the database queries

const mockUser = {
    id: 1,
    username: 'testuser',
    password: 'hashedpassword', // Simulated hashed password
};

describe('POST /auth/login', () => {
    beforeEach(async () => {
        // Mock database query for cleaning up users
        query.mockImplementation((sql, params) => {
            if (sql.startsWith('DELETE FROM users WHERE username LIKE')) {
                return Promise.resolve(); // Simulate cleanup
            }
            if (sql.startsWith('SELECT * FROM users WHERE username =')) {
                if (params[0] === mockUser.username) {
                    return Promise.resolve({ rows: [mockUser] }); // Simulate user found
                }
                return Promise.resolve({ rows: [] }); // Simulate user not found
            }
        });

        // Mock bcrypt password comparison
        bcrypt.compare.mockImplementation((plaintext, hash) => {
            if (plaintext === 'validpassword' && hash === 'hashedpassword') {
                return Promise.resolve(true); // Valid password
            }
            return Promise.resolve(false); // Invalid password
        });
    });

    afterEach(async () => {
        // Reset mocks
        jest.clearAllMocks();
    });

    test('should log in with valid credentials and return a token', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({
                username: 'testuser',
                password: 'validpassword',
            });

        expect(response.statusCode).toBe(200); // Login should succeed
        expect(response.body).toHaveProperty('message', 'Login successful');
        expect(response.body).toHaveProperty('token');

        // Verify the token contains correct payload
        const payload = JSON.parse(Buffer.from(response.body.token.split('.')[1], 'base64').toString());
        expect(payload.username).toBe(mockUser.username);
        expect(payload.user_id).toBe(mockUser.id);
    });

    test('should return an error if username is invalid', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({
                username: 'invaliduser',
                password: 'validpassword',
            });

        expect(response.statusCode).toBe(400); // Expect login to fail
        expect(response.body).toHaveProperty('message', 'Invalid Username');
    });

    test('should return an error if password is invalid', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({
                username: 'testuser',
                password: 'wrongpassword',
            });

        expect(response.statusCode).toBe(400); // Expect login to fail
        expect(response.body).toHaveProperty('message', 'Invalid Password');
    });

    test('should return an error if fields are missing', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({ username: '', password: '' });

        expect(response.statusCode).toBe(400); // Expect login to fail
        expect(response.body).toHaveProperty('message', 'All fields are required');
    });

    test('should return an error if database query fails', async () => {
        query.mockImplementationOnce(() => {
            throw new Error('Database error');
        });

        const response = await request(app)
            .post('/auth/login')
            .send({
                username: 'testuser',
                password: 'validpassword',
            });

        expect(response.statusCode).toBe(400); // Expect login to fail
        expect(response.body).toHaveProperty('message', 'Database error');
    });
});
