CREATE TABLE ciam.consent_titles
(
    id integer NOT NULL DEFAULT nextval('ciam.consent_titles_id_seq'::regclass),
    title character varying(255) COLLATE pg_catalog."default" NOT NULL,
    slug character varying(255) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT consent_titles_pkey PRIMARY KEY (id),
    CONSTRAINT consent_titles_slug_key UNIQUE (slug),
    CONSTRAINT consent_titles_title_key UNIQUE (title)
)
