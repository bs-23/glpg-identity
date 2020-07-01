-- Table: ciam.hcp_consents

-- DROP TABLE ciam.hcp_consents;

CREATE TABLE ciam.hcp_consents
(
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    consent_id uuid NOT NULL,
    response boolean NOT NULL,
    CONSTRAINT hcp_consents_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE ciam.hcp_consents
    OWNER to postgres;