-- create user table --
CREATE TABLE IF NOT EXISTS User(
    id VARCHAR(36) NOT NULL,
    username VARCHAR(60),
    name VARCHAR(30),
    email VARCHAR(100) NOT NULL,
    provider ENUM('EMAIL', 'GOOGLE', 'GITHUB', 'GUEST') NOT NULL,
    password VARCHAR(50),
    rating INT NOT NULL DEFAULT 1200,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lastLogin TIMESTAMP,

    CONSTRAINT User_pkey PRIMARY KEY (id)
);

-- create game table --
CREATE TABLE IF NOT EXISTS Game (
    id VARCHAR(36) NOT NULL,
    whitePlayerId VARCHAR(36) NOT NULL,
    blackPlayerId VARCHAR(36) NOT NULL,
    status ENUM('COMPLETED', 'IN_PROGRESS', 'ABANDONED', 'TIME_UP', 'PLAYER_EXIT', 'GAME_ENDED') NOT NULL,
    result ENUM('WHITE_WINS', 'BLACK_WINS', 'DRAW'),
    timeControl ENUM('CLASSICAL', 'RAPID', 'BLITZ', 'BULLET') NOT NULL,
    startingFen VARCHAR(255) NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    currentFen VARCHAR(255),
    startAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    endAt TIMESTAMP,

    CONSTRAINT Game_pkey PRIMARY KEY (id)
);

-- create moves table --
CREATE TABLE IF NOT EXISTS Move (
    id VARCHAR(36) NOT NULL,
    gameId VARCHAR(36) NOT NULL,
    moveNumber INT NOT NULL,
    `from` VARCHAR(50) NOT NULL,
    `to` VARCHAR(50) NOT NULL,
    comments VARCHAR(50),
    `before` VARCHAR(255) NOT NULL,
    `after` VARCHAR(255) NOT NULL,
    timeTaken INT DEFAULT 0,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    san VARCHAR(50),

    CONSTRAINT Move_pkey PRIMARY KEY (id)
);

-- CreateIndex in user table --
CREATE UNIQUE INDEX User_username_key ON User(username);
CREATE UNIQUE INDEX User_email_key ON User(email);
CREATE INDEX User_rating_idx ON User(rating);

-- CreateIndex in game table --
CREATE INDEX Game_status_result_idx ON Game(status, result);

-- CreateIndex in move table --
CREATE INDEX Move_gameId_idx ON Move(gameId);

-- AddForeignKey
ALTER TABLE Game ADD CONSTRAINT Game_whitePlayerId_fkey FOREIGN KEY (whitePlayerId) REFERENCES User(id) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE Game ADD CONSTRAINT Game_blackPlayerId_fkey FOREIGN KEY (blackPlayerId) REFERENCES User(id) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE Move ADD CONSTRAINT Move_gameId_fkey FOREIGN KEY (gameId) REFERENCES Game(id) ON DELETE RESTRICT ON UPDATE CASCADE;
