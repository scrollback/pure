ALTER TABLE contacts
    ADD valid text DEFAULT 'unsure',
    ADD lastmailtime bigint DEFAULT NULL,
    ADD lastmailverifytime bigint DEFAULT NULL;
