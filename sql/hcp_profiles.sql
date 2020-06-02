-- Table: ciam.hcp_profiles

-- DROP TABLE ciam.hcp_profiles;

CREATE TABLE ciam.hcp_profiles
(
    id uuid NOT NULL,
    application_id uuid NOT NULL,
    name character varying COLLATE pg_catalog."default" NOT NULL,
    email character varying COLLATE pg_catalog."default" NOT NULL,
    password character varying COLLATE pg_catalog."default" NOT NULL,
    phone character varying COLLATE pg_catalog."default",
    is_active boolean,
    created_by uuid,
    updated_by uuid,
    CONSTRAINT hcp_profiles_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE ciam.hcp_profiles
    OWNER to postgres;