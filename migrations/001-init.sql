-- Create the users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,                -- Auto-incrementing primary key
    username VARCHAR(50) NOT NULL UNIQUE, -- Unique username, max 50 characters
    email VARCHAR(100) NOT NULL UNIQUE,   -- Unique email, max 100 characters
    password VARCHAR(255) NOT NULL,       -- Hashed password
    is_confirmed BOOLEAN DEFAULT FALSE,       -- Email confirmation status
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Auto-set creation time
);

-- Create the images table
CREATE TABLE images (
    id SERIAL PRIMARY KEY,                -- Auto-incrementing primary key
    title VARCHAR(255) NOT NULL,          -- Title of the image
    url TEXT NOT NULL,                    -- URL of the image
    user_id INT REFERENCES users(id) ON DELETE CASCADE, -- Foreign key to users table
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Auto-set creation time
);

-- Create the comments table
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,                -- Auto-incrementing primary key
    comment TEXT NOT NULL,                   -- Comment text
    image_id INT REFERENCES images(id) ON DELETE CASCADE NOT NULL, -- Foreign key to images table
    user_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,   -- Foreign key to users table
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Auto-set creation time
);

-- Create the likes table
CREATE TABLE likes (
    id SERIAL PRIMARY KEY,                -- Auto-incrementing primary key
    image_id INT REFERENCES images(id) ON DELETE CASCADE NOT NULL, -- Foreign key to images table
    user_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,   -- Foreign key to users table
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Auto-set creation time
);

-- Add indexes for performance optimization
CREATE INDEX idx_users_username ON users(username); -- Index on username for fast lookup
CREATE INDEX idx_users_email ON users(email);       -- Index on email for fast lookup
CREATE INDEX idx_images_user_id ON images(user_id); -- Index on user_id in images
CREATE INDEX idx_comments_image_id ON comments(image_id); -- Index on image_id in comments
CREATE INDEX idx_likes_image_id ON likes(image_id); -- Index on image_id in likes
CREATE INDEX idx_likes_user_id ON likes(user_id);   -- Index on user_id in likes

-- Insert a user
INSERT INTO users (username, email, password, is_confirmed)
VALUES ('bob', 'testuser@example.com', '$2b$10$BGaTdUy.ojs9LROoXMW/BOnT5Z9n28h7y/4joLBdfnoV8OU/T36oe', TRUE);

-- Insert images and associate them with the user
INSERT INTO images (title, url, user_id, created_at)
VALUES 
    ('Image 1', '/gallery/1.jpg', 1, '2025-01-14T10:00:00.000Z'),
    ('Image 2', '/gallery/2.jpg', 1, '2025-01-14T11:00:00.000Z'),
    ('Image 3', '/gallery/3.jpg', 1, '2025-01-14T12:00:00.000Z');

-- Different operations with distinct timestamps
INSERT INTO images (title, url, user_id, created_at)
VALUES 
    ('Spacex 1', '/gallery/sp1.jpg', 1, '2025-01-15T08:00:00.000Z'),
    ('Spacex 2', '/gallery/sp2.jpg', 1, '2025-01-15T09:00:00.000Z'),
    ('Spacex 3', '/gallery/sp3.jpg', 1, '2025-01-15T10:00:00.000Z'),
    ('Spacex 4', '/gallery/sp4.jpg', 1, '2025-01-15T11:00:00.000Z'),
    ('Spacex 5', '/gallery/sp5.jpg', 1, '2025-01-15T12:00:00.000Z'),
    ('Spacex 6', '/gallery/sp6.jpg', 1, '2025-01-15T13:00:00.000Z'),
    ('Spacex 7', '/gallery/sp7.jpg', 1, '2025-01-15T14:00:00.000Z'),
    ('Spacex 8', '/gallery/sp8.jpg', 1, '2025-01-15T15:00:00.000Z');

INSERT INTO likes (image_id, user_id)
VALUES
    (8,1),
    (6,1);

INSERT INTO comments (comment, image_id, user_id)
VALUES
    ('incredible image - where was this?',9,1),
    ('I loooove it - reminds me o my childhood', 6,1),
    ('This is Spacex?',6,1),
    ('would love to assist?',6,1);
