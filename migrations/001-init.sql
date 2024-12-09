-- Create the users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,                -- Auto-incrementing primary key
    username VARCHAR(50) NOT NULL UNIQUE, -- Unique username, max 50 characters
    email VARCHAR(100) NOT NULL UNIQUE,   -- Unique email, max 100 characters
    password VARCHAR(255) NOT NULL,       -- Hashed password
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
    text TEXT NOT NULL,                   -- Comment text
    image_id INT REFERENCES images(id) ON DELETE CASCADE, -- Foreign key to images table
    user_id INT REFERENCES users(id) ON DELETE CASCADE,   -- Foreign key to users table
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Auto-set creation time
);

-- Create the likes table
CREATE TABLE likes (
    id SERIAL PRIMARY KEY,                -- Auto-incrementing primary key
    image_id INT REFERENCES images(id) ON DELETE CASCADE, -- Foreign key to images table
    user_id INT REFERENCES users(id) ON DELETE CASCADE,   -- Foreign key to users table
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Auto-set creation time
);

-- Add indexes for performance optimization
CREATE INDEX idx_users_username ON users(username); -- Index on username for fast lookup
CREATE INDEX idx_users_email ON users(email);       -- Index on email for fast lookup
CREATE INDEX idx_images_user_id ON images(user_id); -- Index on user_id in images
CREATE INDEX idx_comments_image_id ON comments(image_id); -- Index on image_id in comments
CREATE INDEX idx_likes_image_id ON likes(image_id); -- Index on image_id in likes
CREATE INDEX idx_likes_user_id ON likes(user_id);   -- Index on user_id in likes

