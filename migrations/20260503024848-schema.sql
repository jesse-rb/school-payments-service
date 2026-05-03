-- ####
-- #### Create tables
-- ####

CREATE TABLE IF NOT EXISTS users(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    email VARCHAR,
    primary_guardian_id UUID,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_users
        FOREIGN KEY(primary_guardian_id) 
        REFERENCES users(id)
        ON DELETE CASCADE -- If primary guardian gets deleted, delete their depedant's data as well
);


CREATE TABLE IF NOT EXISTS schools(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS trips(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    school_id UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_schools
        FOREIGN KEY(school_id)
        REFERENCES schools(id)
);


CREATE TABLE IF NOT EXISTS payments(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount DECIMAL(10,2),
    receipt_sent BOOLEAN,
    user_id UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_users
        FOREIGN KEY(user_id) 
        REFERENCES users(id)
);


CREATE TABLE IF NOT EXISTS payment_items(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR NOT NULL,
    payment_id UUID NOT NULL,
    for_user_id UUID NOT NULL,
    for_item_id UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_payments
        FOREIGN KEY(payment_id)
        REFERENCES payments(id),

    CONSTRAINT fk_users
        FOREIGN KEY(for_user_id)
        REFERENCES users(id)
);

CREATE INDEX ON payment_items(type, for_item_id); -- No direct fk constraint referencing trips, as we could scale to other payment item types
