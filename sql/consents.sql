-- Type: enum_consents_type

-- DROP TYPE ciam.enum_consents_type;

CREATE TYPE ciam.enum_consents_type AS ENUM
    ('online', 'offline');

ALTER TYPE ciam.enum_consents_type
    OWNER TO postgres;

-- Type: enum_consents_opt_in_type

-- DROP TYPE ciam.enum_consents_opt_in_type;

CREATE TYPE ciam.enum_consents_opt_in_type AS ENUM
    ('single', 'double');

ALTER TYPE ciam.enum_consents_opt_in_type
    OWNER TO postgres;

-- Type: enum_consents_category

-- DROP TYPE ciam.enum_consents_category;

CREATE TYPE ciam.enum_consents_category AS ENUM
    ('DM', 'MC', 'GDPR');

ALTER TYPE ciam.enum_consents_category
    OWNER TO postgres;

-- Table: ciam.consents

-- DROP TABLE ciam.consents;

CREATE TABLE ciam.consents
(
    id uuid NOT NULL,
    title character varying(255) COLLATE pg_catalog."default" NOT NULL,
    type ciam.enum_consents_type NOT NULL,
    opt_in_type ciam.enum_consents_opt_in_type NOT NULL,
    category ciam.enum_consents_category NOT NULL,
    country_code character varying(255) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT consents_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE ciam.consents
    OWNER to postgres;