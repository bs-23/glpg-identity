CREATE TABLE ciam.consents
(
    id integer NOT NULL DEFAULT nextval('ciam.consents_id_seq'::regclass),
    title character varying(255) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT consents_pkey PRIMARY KEY (id),
    CONSTRAINT consents_title_key UNIQUE (title)
)

