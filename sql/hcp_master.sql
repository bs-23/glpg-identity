-- Table: ciam.hcp_master

-- DROP TABLE ciam.hcp_master;

CREATE TABLE ciam.hcp_master
(
    "Individual_Id_OneKey" character varying(20) COLLATE pg_catalog."default" NOT NULL,
    "Codbase" character varying(3) COLLATE pg_catalog."default" NOT NULL,
    "UUID_1" character varying(20) COLLATE pg_catalog."default",
    "UUID_2" character varying(20) COLLATE pg_catalog."default",
    "FirstName" character varying(50) COLLATE pg_catalog."default",
    "LastName" character varying(50) COLLATE pg_catalog."default",
    "Phone" character varying(30) COLLATE pg_catalog."default",
    "Gender_Code" character varying(20) COLLATE pg_catalog."default",
    "Gender_Desc" character varying(255) COLLATE pg_catalog."default",
    "EMAIL_1" character varying(50) COLLATE pg_catalog."default",
    "Adr_Long_Lbl" character varying(255) COLLATE pg_catalog."default",
    "Fax" character varying(20) COLLATE pg_catalog."default",
    "LgPostCode" character varying(20) COLLATE pg_catalog."default",
    "Specialty1_Code" character varying(20) COLLATE pg_catalog."default",
    "Specialty2_Code" character varying(20) COLLATE pg_catalog."default",
    "Specialty3_Code" character varying(20) COLLATE pg_catalog."default",
    "Country_ISO2" character varying(20) COLLATE pg_catalog."default"
)

TABLESPACE pg_default;

ALTER TABLE ciam.hcp_master
    OWNER to ciam_dev_master;
