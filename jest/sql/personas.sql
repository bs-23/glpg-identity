CREATE TABLE ciam.personas
(
    id uuid NOT NULL,
    title character varying COLLATE pg_catalog."default" NOT NULL,
    description character varying COLLATE pg_catalog."default",
    tags character varying[] COLLATE pg_catalog."default",
    specialties character varying[] COLLATE pg_catalog."default",
    created_by uuid,
    updated_by uuid,
    created_date time with time zone NOT NULL,
    updated_date time with time zone NOT NULL,
    CONSTRAINT personas_pkey PRIMARY KEY (id)
)
