CREATE TABLE ciam.consents
(
    id uuid NOT NULL,
    title character varying(255) COLLATE pg_catalog."default" NOT NULL,
    type ciam.enum_consents_type NOT NULL,
    opt_type ciam.enum_consents_opt_type NOT NULL,
    category ciam.enum_consents_category NOT NULL,
    country_code character varying(255) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT consents_pkey PRIMARY KEY (id)
)

CREATE TYPE ciam.enum_consents_category AS ENUM
    ('DM', 'MC', 'GDPR');

CREATE TYPE ciam.enum_consents_opt_type AS ENUM
    ('single', 'double');

CREATE TYPE ciam.enum_consents_type AS ENUM
    ('online', 'offline');
