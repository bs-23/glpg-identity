CREATE TABLE ciam.clients
(
    id uuid NOT NULL,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    password character varying(255) COLLATE pg_catalog."default",
    is_active boolean DEFAULT false,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT clients_pkey PRIMARY KEY (id),
    CONSTRAINT clients_email_key UNIQUE (email)
)

TABLESPACE pg_default;

ALTER TABLE ciam.clients
    OWNER to postgres;
