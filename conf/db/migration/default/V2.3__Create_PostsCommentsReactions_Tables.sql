CREATE TABLE posts (
                               id                      uuid            PRIMARY KEY,
                               data_source_id          INTEGER         NOT NULL REFERENCES data_sources(id),
                               donation_id             uuid            NOT NULL REFERENCES donations(id),
                               datetime                TIMESTAMP       NOT NULL,
                               word_count              INTEGER         NOT NULL,
                               media_count             INTEGER         NOT NULL
);

CREATE TABLE group_posts (
                       id                      uuid            PRIMARY KEY,
                       data_source_id          INTEGER         NOT NULL REFERENCES data_sources(id),
                       donation_id             uuid            NOT NULL REFERENCES donations(id),
                       datetime                TIMESTAMP       NOT NULL,
                       word_count              INTEGER         NOT NULL,
                       media_count             INTEGER         NOT NULL
);

CREATE TABLE comments (
                            id                      uuid            PRIMARY KEY,
                            data_source_id          INTEGER         NOT NULL REFERENCES data_sources(id),
                            donation_id             uuid            NOT NULL REFERENCES donations(id),
                            datetime                TIMESTAMP       NOT NULL,
                            word_count              INTEGER         NOT NULL,
                            media_count             INTEGER         NOT NULL
);

CREATE TABLE group_comments (
                          id                      uuid            PRIMARY KEY,
                          data_source_id          INTEGER         NOT NULL REFERENCES data_sources(id),
                          donation_id             uuid            NOT NULL REFERENCES donations(id),
                          datetime                TIMESTAMP       NOT NULL,
                          word_count              INTEGER         NOT NULL,
                          media_count             INTEGER         NOT NULL
);

CREATE TABLE reactions (
                          id                      uuid            PRIMARY KEY,
                          data_source_id          INTEGER         NOT NULL REFERENCES data_sources(id),
                          donation_id             uuid            NOT NULL REFERENCES donations(id),
                          datetime                TIMESTAMP       NOT NULL,
                          reaction_type           VARCHAR(255)    NOT NULL
);