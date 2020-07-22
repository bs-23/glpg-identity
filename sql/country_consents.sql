CREATE TABLE ciam.country_consents
(
    id uuid NOT NULL,
    consent_id integer NOT NULL,
    slug character varying(255) COLLATE pg_catalog."default" NOT NULL,
    type ciam.enum_country_consents_type NOT NULL,
    opt_type ciam.enum_country_consents_opt_type NOT NULL,
    category ciam.enum_country_consents_category NOT NULL,
    category_title character varying(255) COLLATE pg_catalog."default" NOT NULL,
    country_iso2 character varying(255) COLLATE pg_catalog."default" NOT NULL,
    language_code character varying(255) COLLATE pg_catalog."default",
    purpose character varying(255) COLLATE pg_catalog."default",
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT country_consents_pkey PRIMARY KEY (id),
    CONSTRAINT country_consents_slug_key UNIQUE (slug),
    CONSTRAINT country_consents_consent_id_fkey FOREIGN KEY (consent_id)
        REFERENCES ciam.consents (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

CREATE TYPE ciam.enum_consents_category AS ENUM
    ('dm', 'mc');

CREATE TYPE ciam.enum_consents_opt_type AS ENUM
    ('single', 'double');

CREATE TYPE ciam.enum_consents_type AS ENUM
    ('online', 'offline');
