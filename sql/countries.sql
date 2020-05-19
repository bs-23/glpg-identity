-- Table: ciam.countries

-- DROP TABLE ciam.countries;

CREATE TABLE ciam.countries
(
    id integer NOT NULL DEFAULT nextval('ciam.countries_id_seq'::regclass),
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT countries_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE ciam.countries
    OWNER to postgres;