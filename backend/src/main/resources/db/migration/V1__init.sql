CREATE TABLE IF NOT EXISTS risk (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    category VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    risk_score INTEGER NOT NULL,
    owner VARCHAR(255) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);