CREATE TYPE ciam.enum_users_type AS ENUM
    ('System Admin', 'Site Admin');

ALTER TYPE ciam.enum_users_type
    OWNER TO postgres;

CREATE TABLE ciam.users
(
    id uuid NOT NULL,
    client_id uuid,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    password character varying(255) COLLATE pg_catalog."default",
    phone character varying(255) COLLATE pg_catalog."default",
    type ciam.enum_users_type DEFAULT 'Site Admin'::ciam.enum_users_type,
    countries character varying(255)[] COLLATE pg_catalog."default",
    permissions character varying(255)[] COLLATE pg_catalog."default",
    is_active boolean DEFAULT false,
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
