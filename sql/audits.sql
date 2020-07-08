CREATE TABLE ciam.audits
(
    id uuid NOT NULL,
    action character varying(255) COLLATE pg_catalog."default" NOT NULL,
    category ciam.enum_audits_category NOT NULL,
    message character varying(255) COLLATE pg_catalog."default" NOT NULL,
    "userId" character varying(255) COLLATE pg_catalog."default",
    created_by uuid,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT audits_pkey PRIMARY KEY (id)
)

CREATE TYPE ciam.enum_audits_category AS ENUM
    ('authentication', 'user');


