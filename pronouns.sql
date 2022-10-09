-- Create database
CREATE DATABASE IF NOT EXISTS PronounBot;
USE PronounBot;

-- Set up the tables
CREATE TABLE IF NOT EXISTS SetCategories (
    ID              INTEGER     NOT NULL AUTO_INCREMENT,
    SetID           INTEGER     NOT NULL,
    CategoryName    VARCHAR(15) NOT NULL,
    PRIMARY KEY(ID)
);
CREATE TABLE IF NOT EXISTS UserSets (
    ID      INTEGER     NOT NULL AUTO_INCREMENT,
    UserID  INTEGER     NOT NULL UNIQUE,
    SetID   INTEGER     NOT NULL,
    PRIMARY KEY(ID)
);
CREATE TABLE IF NOT EXISTS Sets (
    ID          INTEGER     NOT NULL AUTO_INCREMENT,
    Subjective  VARCHAR(20) NOT NULL,
    Objective   VARCHAR(20) NOT NULL,
    Possessive  VARCHAR(20) NOT NULL,
    Possessive2 VARCHAR(20) NOT NULL,
    Reflexive   VARCHAR(20) NOT NULL,
    Plural      BOOLEAN     NOT NULL,
    PRIMARY KEY(ID)
);
CREATE TABLE IF NOT EXISTS Sentences (
    ID          INTEGER         NOT NULL AUTO_INCREMENT,
    Sentence    VARCHAR(500)    NOT NULL,
    Type        TINYINT         NOT NULL,
    PRIMARY KEY(ID)
);
CREATE TABLE IF NOT EXISTS Servers (
    ID          INTEGER     NOT NULL AUTO_INCREMENT,
    DiscordID   BINARY(32)  NOT NULL UNIQUE,        -- Store identifiers in a hash so even if someone manages an SQL injection they won't be able identify the owner
    Announce    BIGINT,
    PRIMARY KEY(ID)
);
CREATE TABLE IF NOT EXISTS Users (
    ID          INTEGER     NOT NULL AUTO_INCREMENT,
    DiscordID   BINARY(32)  NOT NULL UNIQUE,
    PRIMARY KEY(ID)
);

-- Create user
CREATE USER 'pronounbot'@'localhost' IDENTIFIED WITH mysql_native_password BY 'pronounbottest'; -- Note that this user shouldn't be accessible outside of localhost as this would be insecure
GRANT ALL PRIVILEGES ON PronounBot.* TO 'pronounbot'@'localhost';