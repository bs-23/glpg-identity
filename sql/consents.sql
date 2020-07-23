CREATE TABLE ciam.consents
(
    id uuid NOT NULL,
    category_id uuid NOT NULL,
    title character varying(255) COLLATE pg_catalog."default" NOT NULL,
    rich_text character varying(255) COLLATE pg_catalog."default" NOT NULL,
    slug character varying(255) COLLATE pg_catalog."default" NOT NULL,
    type ciam.enum_consents_type NOT NULL,
    opt_type ciam.enum_consents_opt_type NOT NULL,
    country_iso2 character varying(255) COLLATE pg_catalog."default" NOT NULL,
    language_code character varying(255) COLLATE pg_catalog."default",
    purpose character varying(255) COLLATE pg_catalog."default",
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT consents_pkey PRIMARY KEY (id),
    CONSTRAINT consents_slug_key UNIQUE (slug),
    CONSTRAINT consents_title_key UNIQUE (title),
    CONSTRAINT consents_category_id_fkey FOREIGN KEY (category_id)
        REFERENCES ciam.consent_categories (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

CREATE TYPE ciam.enum_consents_category AS ENUM
    ('dm', 'mc');

CREATE TYPE ciam.enum_consents_opt_type AS ENUM
    ('single', 'double');

CREATE TYPE ciam.enum_consents_type AS ENUM
    ('online', 'offline');
