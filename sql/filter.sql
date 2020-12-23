CREATE TABLE cdp.filter_settings
(
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    table_name character varying(255) NOT NULL,
    option json NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT filter_settings_pkey PRIMARY KEY (id)
)
