-- Table: ciam.password_history

-- DROP TABLE ciam.password_history;

CREATE TABLE ciam.user_password_history
(
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    application_id uuid NOT NULL,
    passwords character varying(255)[] COLLATE pg_catalog."default" NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT password_history_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE ciam.user_password_history
    OWNER to postgres;