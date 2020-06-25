-- Table: ciam.specialties

-- DROP TABLE ciam.specialties;

CREATE TABLE ciam.specialties
(
    "COD_ID_OneKey" character varying(20) COLLATE pg_catalog."default" NOT NULL,
    "LIS_Code" character varying(20) COLLATE pg_catalog."default",
    "LIS_Lbl" character varying(100) COLLATE pg_catalog."default",
    "Codbase" character varying(20) COLLATE pg_catalog."default",
    "COD_Locale" character varying(20) COLLATE pg_catalog."default",
    "COD_Description" character varying(200) COLLATE pg_catalog."default"
)

TABLESPACE pg_default;

ALTER TABLE ciam.specialties
    OWNER to ciam_dev_master;
