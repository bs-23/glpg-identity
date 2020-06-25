-- Table: ciam.countries

-- DROP TABLE ciam.countries;

CREATE TABLE ciam.countries
(
    CountryID integer NOT NULL,
    CountryName character varying(14) COLLATE pg_catalog."default" NOT NULL,
    Country_IS02 character varying(2) COLLATE pg_catalog."default" NOT NULL,
    Country_IS03 character varying(3) COLLATE pg_catalog."default" NOT NULL,
    CodBase character varying(3) COLLATE pg_catalog."default"
)

TABLESPACE pg_default;

ALTER TABLE ciam.countries
    OWNER to postgres;

INSERT INTO ciam.countries (CountryID, Country_IS02, Country_IS03, CodBase, CountryName) VALUES (1, 'BE', 'BEL', 'WBE', 'Belgium');
INSERT INTO ciam.countries (CountryID, Country_IS02, Country_IS03, CodBase, CountryName) VALUES (2, 'DE', 'DEU', 'WDE', 'Germany');
INSERT INTO ciam.countries (CountryID, Country_IS02, Country_IS03, CodBase, CountryName) VALUES (3, 'ES', 'ESP', 'WES', 'Spain');
INSERT INTO ciam.countries (CountryID, Country_IS02, Country_IS03, CodBase, CountryName) VALUES (4, 'FR', 'FRA', 'WFR', 'France');
INSERT INTO ciam.countries (CountryID, Country_IS02, Country_IS03, CodBase, CountryName) VALUES (5, 'GB', 'GBR', 'WUK', 'United Kingdom');
INSERT INTO ciam.countries (CountryID, Country_IS02, Country_IS03, CodBase, CountryName) VALUES (6, 'IE', 'IRL', 'WUK', 'Ireland');
INSERT INTO ciam.countries (CountryID, Country_IS02, Country_IS03, CodBase, CountryName) VALUES (7, 'IT', 'ITA', 'WIT', 'Italy');
INSERT INTO ciam.countries (CountryID, Country_IS02, Country_IS03, CodBase, CountryName) VALUES (8, 'LU', 'LUX', 'WBE', 'Luxembourg');
INSERT INTO ciam.countries (CountryID, Country_IS02, Country_IS03, CodBase, CountryName) VALUES (9, 'MC', 'MCO', 'WFR', 'Monaco');
INSERT INTO ciam.countries (CountryID, Country_IS02, Country_IS03, CodBase, CountryName) VALUES (10, 'NL', 'NLD', 'WNL', 'Netherlands');
INSERT INTO ciam.countries (CountryID, Country_IS02, Country_IS03, CodBase, CountryName) VALUES (11, 'AD', 'AND', NULL, 'Andorra');
