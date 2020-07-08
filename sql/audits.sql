
CREATE TYPE ciam.enum_audits_event_type AS ENUM
    ('authentication', 'user', 'USER_LOGIN', 'USER_LOGOUT', 'CREATE_USER', 'DELETE_USER', 'UPDATE_USER');
    
CREATE TABLE ciam.audits
(
    id uuid NOT NULL,
    event_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    event_time timestamp with time zone NOT NULL,
    event_type ciam.enum_audits_event_type NOT NULL,
    message character varying(255) COLLATE pg_catalog."default" NOT NULL,
    object_id character varying(255) COLLATE pg_catalog."default",
    created_by uuid,
    CONSTRAINT audits_pkey PRIMARY KEY (id)
)



