-- Table: ciam.hcps

-- DROP TABLE ciam.hcps;

CREATE TABLE ciam.hcps
(
    id uuid NOT NULL,
    application_id uuid NOT NULL,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    password character varying(255) COLLATE pg_catalog."default",
    phone character varying(255) COLLATE pg_catalog."default",
    is_active boolean DEFAULT false,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT hcps_pkey PRIMARY KEY (id),
    CONSTRAINT hcps_email_key UNIQUE (email)
)

TABLESPACE pg_default;

ALTER TABLE ciam.hcps
    OWNER to postgres;
