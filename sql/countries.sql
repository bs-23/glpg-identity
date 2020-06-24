-- Table: ciam.countries

-- DROP TABLE ciam.countries;

CREATE TABLE ciam.countries
(
    CountryID integer NOT NULL,
    CountryName character varying(255) COLLATE pg_catalog."default" NOT NULL,
    Country_IS02 character varying(255) COLLATE pg_catalog."default" NOT NULL,
    Country_IS03 character varying(255) COLLATE pg_catalog."default" NOT NULL,
    CodBase character varying(255) COLLATE pg_catalog."default",
    Created_At timestamp with time zone NOT NULL,
    Updated_At timestamp with time zone NOT NULL,
    CONSTRAINT countries_pkey PRIMARY KEY (CountryID)
)

TABLESPACE pg_default;

ALTER TABLE ciam.countries
    OWNER to postgres;
