CREATE TABLE ciam.consents
(
    id uuid NOT NULL,
    category_id uuid NOT NULL,
    legal_basis ciam.enum_consents_legal_basis NOT NULL,
    is_active boolean DEFAULT false,
    preference character varying(255) COLLATE pg_catalog."default",
    title character varying(255) COLLATE pg_catalog."default" NOT NULL,
    slug character varying(255) COLLATE pg_catalog."default" NOT NULL,
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


CREATE TYPE ciam.enum_consents_legal_basis AS ENUM
    ('consent', 'contract');
