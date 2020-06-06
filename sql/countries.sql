-- Table: ciam.countries

-- DROP TABLE ciam.countries;

CREATE TABLE ciam.countries
(
    id uuid NOT NULL,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    country_iso2 character varying(255) COLLATE pg_catalog."default" NOT NULL,
    country_iso3 character varying(255) COLLATE pg_catalog."default" NOT NULL,
    codebase character varying(255) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT countries_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE ciam.countries
    OWNER to postgres;
