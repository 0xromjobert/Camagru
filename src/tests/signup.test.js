const request = require('supertest');
const app = require('../app');  //our Express app - NOT a test one
const { query } = require('../config/database');


describe('POST /auth/signup - Input Validation', () => {
    beforeEach(async () => {
        // Cleanup users with "test" in the username
        await query('DELETE FROM users WHERE username LIKE $1', ['%test%']);
    });
    
    afterAll(async () => {
        // Cleanup users with "test" in the username after tests
        await query('DELETE FROM users WHERE username LIKE $1', ['%test%']);
    });

    test('should create a new user with valid input', async () => {
        const response = await request(app)
            .post('/auth/signup')
            .send({
                username: 'validusertest',
                email: 'validuser@example.com',
                password: 'ValidPassword123!',
            });

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('message', 'User created successfully, check your email for verification');
        expect(response.body).toHaveProperty('token');
    });

    test('should return an error if email format is invalid', async () => {
        const response = await request(app)
            .post('/auth/signup')
            .send({
                username: 'testuser',
                email: 'invalid-email-format',
                password: 'ValidPassword123!',
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'Invalid email format', path: 'email' })
            ])
        );
    });

    test('should return an error if password does not meet complexity requirements', async () => {
        const response = await request(app)
            .post('/auth/signup')
            .send({
                username: 'complexuser',
                email: 'complexuser@example.com',
                password: 'simple', // Weak password
            });

        expect(response.statusCode).toBe(400);
    });

    test('should return an error if username contains invalid characters', async () => {
        const response = await request(app)
            .post('/auth/signup')
            .send({
                username: 'invalid user!', // Invalid characters
                email: 'testuser@example.com',
                password: 'ValidPassword123!',
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'Username can only contain letters, numbers, and underscores', path: 'username' })
            ])
        );
    });

    test('should return an error if username is too short', async () => {
        const response = await request(app)
            .post('/auth/signup')
            .send({
                username: 'ab', // Too short
                email: 'shortuser@example.com',
                password: 'ValidPassword123!',
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'Username must be at least 3 characters long', path: 'username' })
            ])
        );
    });

    test('should return an error if required fields are missing', async () => {
        const response = await request(app)
            .post('/auth/signup')
            .send({
                username: '',
                email: '',
                password: '',
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'Username is required', path: 'username' }),
                expect.objectContaining({ msg: 'Email is required', path: 'email' }),
                expect.objectContaining({ msg: 'Password is required', path: 'password' }),
            ])
        );
    });

    test('should return an error if input fields contain only spaces', async () => {
        const response = await request(app)
            .post('/auth/signup')
            .send({
                username: '   ',
                email: '   ',
                password: '   ',
            });

        expect(response.statusCode).toBe(400);
    });
});

describe('POST /auth/signup', () => {
    beforeEach(async () => {
        // Cleanup users with "test" in the username
        await query('DELETE FROM users WHERE username LIKE $1', ['%test%']);
    });

    afterAll(async () => {
        // Cleanup users with "test" in the username after tests
        await query('DELETE FROM users WHERE username LIKE $1', ['%test%']);
    });

    test('should create a new user and return a token', async () => {
        const response = await request(app)
            .post('/auth/signup')
            .send({
                username: 'testuser',
                email: 'testuser@example.com',
                password: 'ValidPassword123!',
            });

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('message', 'User created successfully, check your email for verification');
        expect(response.body).toHaveProperty('token');
    });

    test('should return an error if the email is already in use', async () => {
        // Insert a user with the same email
        await query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3)', [
            'existingusertest',
            'testuser@example.com',
            'hashedpassword',
        ]);

        const response = await request(app)
            .post('/auth/signup')
            .send({
                username: 'newusertest',
                email: 'testuser@example.com',
                password: 'ValidPassword123!',
            });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'A user already exists with your credentials');
    });

    test('should return an error if the username is already in use', async () => {
        await query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3)', [
            'existingusertest',
            'testinguser@example.com',
            'hashedpassword',
        ]);

        const response = await request(app)
            .post('/auth/signup')
            .send({
                username: 'existingusertest',
                email: 'uniqueuser@example.com',
                password: 'ValidPassword123!',
            });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('message', 'A user already exists with your credentials');
    });

    test('should return an error if required fields are missing', async () => {
        const response = await request(app)
            .post('/auth/signup')
            .send({
                username: '',
                email: '',
                password: '',
            });

        expect(response.statusCode).toBe(400);
    });

    test('should hash the password before storing it in the database', async () => {
        const response = await request(app)
            .post('/auth/signup')
            .send({
                username: 'hashedusertest',
                email: 'hasheduser@example.com',
                password: 'ValidPassword123!',
            });

        expect(response.statusCode).toBe(201);

        // Verify the password in the database is hashed
        const user = await query('SELECT * FROM users WHERE username = $1', ['hashedusertest']);
        expect(user.rows.length).toBe(1);
        expect(user.rows[0].password).not.toBe('ValidPassword123!'); // Should not store raw password
    });
});
