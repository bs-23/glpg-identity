-- Type: enum_users_type

-- DROP TYPE ciam.enum_users_type;

CREATE TYPE ciam.enum_users_type AS ENUM
    ('system_admin', 'site_admin');

ALTER TYPE ciam.enum_users_type
    OWNER TO postgres;

-- Table: ciam.users

-- DROP TABLE ciam.users;

CREATE TABLE ciam.users
(
    id uuid NOT NULL,
    client_id uuid,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    password character varying(255) COLLATE pg_catalog."default",
    phone character varying(255) COLLATE pg_catalog."default",
    type ciam.enum_users_type DEFAULT 'site_admin'::ciam.enum_users_type,
    countries character varying(255)[] COLLATE pg_catalog."default",
    permissions character varying(255)[] COLLATE pg_catalog."default",
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email)
)

TABLESPACE pg_default;

ALTER TABLE ciam.users
    OWNER to postgres;
