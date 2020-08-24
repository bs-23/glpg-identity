CREATE TABLE ciam.users
(
    id uuid NOT NULL,
    application_id uuid,
    first_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    last_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    password character varying(255) COLLATE pg_catalog."default",
    phone character varying(255) COLLATE pg_catalog."default",
    type ciam.enum_users_type DEFAULT 'basic'::ciam.enum_users_type,
    countries character varying(255)[] COLLATE pg_catalog."default",
    permissions character varying(255)[] COLLATE pg_catalog."default",
    login_failed_attempt integer DEFAULT 0 NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email)
)

CREATE TYPE ciam.enum_users_type AS ENUM
    ('admin', 'basic');
