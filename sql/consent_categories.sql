CREATE TABLE ciam.consent_categories
(
    id integer NOT NULL DEFAULT nextval('ciam.consent_categories_id_seq'::regclass),
    title character varying(255) COLLATE pg_catalog."default" NOT NULL,
    type ciam.enum_consent_categories_type NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT consent_categories_pkey PRIMARY KEY (id)
)