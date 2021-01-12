CREATE TYPE cdp.enum_partner_hco_type AS ENUM
    ('healthcare_org', 'patient_org');

CREATE TABLE cdp.partner_hcos
(
    id uuid NOT NULL,
    contact_first_name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    contact_last_name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    address_line_1 character varying(255) COLLATE pg_catalog."default",
    address_line_2 character varying(255) COLLATE pg_catalog."default",
    email character varying(100) COLLATE pg_catalog."default" NOT NULL,
    telephone character varying(25) COLLATE pg_catalog."default",
    type cdp.enum_partner_hco_type NOT NULL DEFAULT 'healthcare_org'::cdp.enum_partner_hco_type,
    registration_number character varying(50) COLLATE pg_catalog."default",
    iban character varying(255) COLLATE pg_catalog."default",
    bank_name character varying(255) COLLATE pg_catalog."default",
    bank_account_no character varying(255) COLLATE pg_catalog."default",
    currency character varying(5) COLLATE pg_catalog."default",
    document_urls character varying(255)[] COLLATE pg_catalog."default",
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT partner_hcos_pkey PRIMARY KEY (id)
)
