CREATE TYPE ciam.enum_audits_event_type AS ENUM
    ('CREATE', 'DELETE', 'UPDATE', 'LOGIN', 'LOGOUT');

CREATE TYPE ciam.enum_audits_table_name AS ENUM
    ('users', 'hcp_profiles', 'consents', 'applications', 'hcp_archives', 'permission_sets', 'roles', 'consent_countries', 'consent_categories');

CREATE TABLE ciam.audits
(
    id uuid NOT NULL,
    event_time timestamp with time zone NOT NULL,
    event_type ciam.enum_audits_event_type NOT NULL,
    object_id character varying(255) COLLATE pg_catalog."default",
    table_name ciam.enum_audits_table_name,
    actor uuid NOT NULL,
    description character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT audits_pkey PRIMARY KEY (id)
)
