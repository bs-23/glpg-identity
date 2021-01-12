CREATE TABLE cdp.partner_hcps
(
    id uuid NOT NULL,
    first_name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    last_name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    address_line_1 character varying(255) COLLATE pg_catalog."default" NOT NULL,
    address_line_2 character varying(255) COLLATE pg_catalog."default" NOT NULL,
    email character varying(100) COLLATE pg_catalog."default" NOT NULL,
    telephone character varying(25) COLLATE pg_catalog."default" NOT NULL,
    type cdp.enum_partner_hcp_type NOT NULL DEFAULT 'individual'::cdp.enum_partner_hcp_type,
    uuid character varying(20) COLLATE pg_catalog."default" NOT NULL,
    is_italian_hcp boolean DEFAULT false,
    should_report_hco boolean DEFAULT false,
    beneficiary_category cdp.enum_beneficiary_category NOT NULL DEFAULT 'beneficiary_category_1'::cdp.enum_beneficiary_category,
    iban character varying(255) COLLATE pg_catalog."default" NOT NULL,
    bank_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    bank_account_no character varying(255) COLLATE pg_catalog."default" NOT NULL,
    currency character varying(5) COLLATE pg_catalog."default" NOT NULL,
    document_urls character varying(255)[] COLLATE pg_catalog."default",

    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT partner_hcps_pkey PRIMARY KEY (id)
)
