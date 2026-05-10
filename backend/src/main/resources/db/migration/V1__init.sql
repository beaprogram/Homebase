CREATE TABLE IF NOT EXISTS users (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(100)  NOT NULL,
    email      VARCHAR(255)  UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ   DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS listings (
    id           BIGSERIAL PRIMARY KEY,
    title        VARCHAR(500)    NOT NULL,
    description  TEXT,
    address      VARCHAR(500),
    neighbourhood VARCHAR(200),
    price        NUMERIC(12, 2),
    bedrooms     INTEGER,
    bathrooms    NUMERIC(3, 1),
    sqft         INTEGER,
    type         VARCHAR(10)     NOT NULL CHECK (type IN ('RENTAL', 'SALE')),
    latitude     NUMERIC(10, 7),
    longitude    NUMERIC(10, 7),
    source       VARCHAR(100),
    external_id  VARCHAR(200),
    image_url    VARCHAR(1000),
    embedding    TEXT,
    created_at   TIMESTAMPTZ     DEFAULT NOW(),
    updated_at   TIMESTAMPTZ     DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saved_listings (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    listing_id BIGINT NOT NULL REFERENCES listings (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_listings_neighbourhood ON listings (neighbourhood);
CREATE INDEX IF NOT EXISTS idx_listings_type ON listings (type);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings (price);
CREATE INDEX IF NOT EXISTS idx_listings_bedrooms ON listings (bedrooms);
CREATE INDEX IF NOT EXISTS idx_saved_listings_user ON saved_listings (user_id);
