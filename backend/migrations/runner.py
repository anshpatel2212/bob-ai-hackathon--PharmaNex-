import logging
from sqlalchemy import text, inspect
from backend.database import engine, Base

logger = logging.getLogger("pharmaguard.migrations")

MIGRATIONS = [
    (
        "001_create_users_and_ownership",
        """
        -- Users Table
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(36) PRIMARY KEY,
            full_name VARCHAR(150) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            organization VARCHAR(200),
            role VARCHAR(100) NOT NULL DEFAULT 'Pharmacovigilance',
            password_hash VARCHAR(255) NOT NULL,
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS ix_users_email ON users (email);

        -- Adverse Events Table
        CREATE TABLE IF NOT EXISTS adverse_events (
            id VARCHAR(36) PRIMARY KEY,
            user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            is_demo BOOLEAN NOT NULL DEFAULT FALSE,
            case_id VARCHAR(100) NOT NULL,
            patient_id VARCHAR(100),
            product_name VARCHAR(200) NOT NULL,
            adverse_event VARCHAR(255) NOT NULL,
            event_date VARCHAR(50),
            report_date VARCHAR(50),
            seriousness VARCHAR(50) NOT NULL DEFAULT 'Non-serious',
            outcome VARCHAR(100),
            patient_age INTEGER,
            patient_sex VARCHAR(20),
            country VARCHAR(100),
            indication VARCHAR(200),
            dose VARCHAR(100),
            reporter_type VARCHAR(100),
            meddra_term VARCHAR(200),
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS ix_ae_user_id ON adverse_events (user_id);
        CREATE INDEX IF NOT EXISTS ix_ae_is_demo ON adverse_events (is_demo);
        CREATE INDEX IF NOT EXISTS ix_ae_case_id ON adverse_events (case_id);

        -- CTD Documents Table
        CREATE TABLE IF NOT EXISTS documents (
            id VARCHAR(36) PRIMARY KEY,
            user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            is_demo BOOLEAN NOT NULL DEFAULT FALSE,
            title VARCHAR(255) NOT NULL,
            filename VARCHAR(255) NOT NULL,
            file_size INTEGER NOT NULL DEFAULT 0,
            module VARCHAR(50) NOT NULL DEFAULT 'Module 1',
            section_code VARCHAR(50),
            status VARCHAR(50) NOT NULL DEFAULT 'Uploaded',
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS ix_doc_user_id ON documents (user_id);

        -- Signals Table
        CREATE TABLE IF NOT EXISTS signals (
            id VARCHAR(36) PRIMARY KEY,
            user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            is_demo BOOLEAN NOT NULL DEFAULT FALSE,
            drug_name VARCHAR(200) NOT NULL,
            adverse_event VARCHAR(255) NOT NULL,
            case_count INTEGER NOT NULL DEFAULT 1,
            ror FLOAT,
            prr FLOAT,
            p_value FLOAT,
            signal_status VARCHAR(50) NOT NULL DEFAULT 'Under Evaluation',
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS ix_sig_user_id ON signals (user_id);

        -- Reports Table
        CREATE TABLE IF NOT EXISTS reports (
            id VARCHAR(36) PRIMARY KEY,
            user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            is_demo BOOLEAN NOT NULL DEFAULT FALSE,
            title VARCHAR(255) NOT NULL,
            report_type VARCHAR(100) NOT NULL DEFAULT 'Clinical Safety Evaluation',
            status VARCHAR(50) NOT NULL DEFAULT 'Draft',
            summary TEXT,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS ix_rep_user_id ON reports (user_id);
        """
    )
]


def run_migrations():
    """Apply versioned schema migrations without dropping or re-creating tables."""
    inspector = inspect(engine)
    with engine.begin() as conn:
        # Ensure schema_migrations tracker table exists
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version VARCHAR(100) PRIMARY KEY,
                applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """))

        # Fetch already applied migration versions
        result = conn.execute(text("SELECT version FROM schema_migrations;"))
        applied_versions = {row[0] for row in result.fetchall()}

        for version, migration_sql in MIGRATIONS:
            if version not in applied_versions:
                logger.info(f"Applying database migration: {version}")
                # Execute migration statements
                for statement in migration_sql.strip().split(";"):
                    stmt = statement.strip()
                    if stmt:
                        conn.execute(text(stmt))
                # Record migration version as applied
                conn.execute(
                    text("INSERT INTO schema_migrations (version) VALUES (:version);"),
                    {"version": version}
                )
                logger.info(f"Successfully applied migration: {version}")
            else:
                logger.debug(f"Migration {version} already applied. Skipping.")

    # Also bind any ORM definitions if needed
    Base.metadata.create_all(bind=engine)
