CREATE TABLE cdp.partner_requests
(
    id uuid NOT NULL,
    first_name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    last_name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    email character varying(100) COLLATE pg_catalog."default" NOT NULL,
    procurement_contact character varying(100) COLLATE pg_catalog."default" NOT NULL,
    company_codes character varying(255)[] COLLATE pg_catalog."default",
    status cdp.enum_partner_requests_status NOT NULL DEFAULT 'new'::cdp.enum_partner_requests_status,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT partner_requests_pkey PRIMARY KEY (id),
    CONSTRAINT partner_requests_email_key UNIQUE (email),
    CONSTRAINT partner_requests_procurement_contact_key UNIQUE (procurement_contact)
)
