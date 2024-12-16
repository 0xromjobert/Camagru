const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../app'); // Your Express app
const { query } = require('../config/database');
const { generateJWT } = require('../middleware/tokenJWT');

//jest.mock('bcrypt'); // Mock bcrypt for testing
//jest.mock('../config/database'); // Mock the database queries

const mockUser = {
    email: "ilovePizza@bitcoin.com",
    username: 'testuser',
    password: 'Validpassword123!', // Simulated hashed password
};

describe('POST /auth/login', () => {
    beforeEach(async () => {
        // Cleanup users with "test" in the username
        await query('DELETE FROM users WHERE username LIKE $1', ['%test%']);
        await request(app).post('/auth/signup').send({
                username: mockUser.username,
                email: mockUser.email,
                password: mockUser.password,
            });
    });
    
    afterEach(async () => {
        // Cleanup users with "test" in the username after tests
        await query('DELETE FROM users WHERE username LIKE $1', ['%test%']);
    });


    test('should log in with valid credentials and return a token', async () => {
        const q = await  query('SELECT * FROM users WHERE username = $1', [mockUser.username]);
        const response = await request(app)
            .post('/auth/login')
            .send({
                username: mockUser.username,
                password: mockUser.password,
            });
        expect(response.statusCode).toBe(200); // Login should succeed
        expect(response.body).toHaveProperty('message', 'Login successful');
        expect(response.body).toHaveProperty('token');

        // Verify the token contains correct payload
        const payload = JSON.parse(Buffer.from(response.body.token.split('.')[1], 'base64').toString());
        expect(payload.username).toBe(mockUser.username);
    });

    test('should return an error if username is invalid', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({
                username: 'invaliduser',
                password: 'validPassword123!',
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
    });

    test('should return an error if fields are missing', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({ username: '', password: '' });

        expect(response.statusCode).toBe(400); // Expect login to fail
    });

    test('should return an error if database query fails', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({
                username: 'testuser',
                password: 'validpassword',
            });
        expect(response.statusCode).toBe(400); // Expect login to fail
    });
});
