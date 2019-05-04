-- drop schema `photosite`;
-- create schema `photosite`;
-- use `photosite`;

CREATE TABLE users (
    id                      INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    login_provider          VARCHAR(200) NOT NULL,
    login_provider_id       VARCHAR(200) NOT NULL
);

CREATE TABLE categories (
    id                      INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    category_name           VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE images (
    id                      INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    unique_id               VARCHAR(255) NOT NULL,
    category_id             INT NOT NULL,
    image_url               VARCHAR(255) NOT NULL,
    image_title             VARCHAR(255) NOT NULL,
    image_date              DATE NOT NULL,
    image_location          VARCHAR(255) NOT NULL,
    image_note              VARCHAR(1000) NOT NULL
);

INSERT INTO categories (category_name)
VALUES ('Mycology'), ('Wildlife'), ('Street');

--
-- Indexes
--

CREATE UNIQUE INDEX IX_USERS_PROVIDER ON users (
    login_provider,
    login_provider_id
);

--
-- Foreign Keys
--

ALTER TABLE images 
ADD FOREIGN KEY (category_id) REFERENCES categories(id);