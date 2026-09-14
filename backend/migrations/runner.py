import logging
from sqlalchemy import text
from backend.database import engine

logger = logging.getLogger("pharmaguard.migrations")

# ---------------------------------------------------------------------------
# Versioned schema migrations. Each entry is (version_name, sql_string).
# Migrations are applied exactly once; applied versions are recorded in the
# `schema_migrations` tracker table. Never modify a migration that has
# already been applied — add a new one instead.
# ---------------------------------------------------------------------------

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
        )
        """,
    ),
    (
        "002_create_index_users_email",
        "CREATE INDEX IF NOT EXISTS ix_users_email ON users (email)",
    ),
    (
        "003_create_datasets",
        """
        CREATE TABLE IF NOT EXISTS datasets (
            id VARCHAR(36) PRIMARY KEY,
            user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            is_demo BOOLEAN NOT NULL DEFAULT FALSE,
            name VARCHAR(255) NOT NULL,
            filename VARCHAR(255) NOT NULL,
            file_type VARCHAR(50) NOT NULL DEFAULT 'csv',
            record_count INTEGER NOT NULL DEFAULT 0,
            file_size INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """,
    ),
    (
        "004_create_index_datasets_user_id",
        "CREATE INDEX IF NOT EXISTS ix_datasets_user_id ON datasets (user_id)",
    ),
    (
        "005_create_adverse_events",
        """
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
        )
        """,
    ),
    (
        "006_create_indexes_adverse_events",
        "CREATE INDEX IF NOT EXISTS ix_ae_user_id ON adverse_events (user_id)",
    ),
    (
        "007_create_index_ae_is_demo",
        "CREATE INDEX IF NOT EXISTS ix_ae_is_demo ON adverse_events (is_demo)",
    ),
    (
        "008_create_index_ae_case_id",
        "CREATE INDEX IF NOT EXISTS ix_ae_case_id ON adverse_events (case_id)",
    ),
    (
        "009_create_documents",
        """
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
        )
        """,
    ),
    (
        "010_create_index_doc_user_id",
        "CREATE INDEX IF NOT EXISTS ix_doc_user_id ON documents (user_id)",
    ),
    (
        "011_create_signals",
        """
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
        )
        """,
    ),
    (
        "012_create_index_sig_user_id",
        "CREATE INDEX IF NOT EXISTS ix_sig_user_id ON signals (user_id)",
    ),
    (
        "013_create_reports",
        """
        CREATE TABLE IF NOT EXISTS reports (
            id VARCHAR(36) PRIMARY KEY,
            user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            is_demo BOOLEAN NOT NULL DEFAULT FALSE,
            title VARCHAR(255) NOT NULL,
            report_type VARCHAR(100) NOT NULL DEFAULT 'Clinical Safety Evaluation',
            status VARCHAR(50) NOT NULL DEFAULT 'Draft',
            summary TEXT,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """,
    ),
    (
        "014_create_index_rep_user_id",
        "CREATE INDEX IF NOT EXISTS ix_rep_user_id ON reports (user_id)",
    ),
]


def run_migrations() -> None:
    """Apply versioned schema migrations without dropping or re-creating tables.

    Each migration runs in its own transaction. If a migration fails the
    exception propagates to the caller — in production this causes the service
    to exit cleanly rather than start with an incomplete schema.
    """
    with engine.begin() as conn:
        # Ensure the migration-tracking table exists before anything else.
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version VARCHAR(100) PRIMARY KEY,
                applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        """))

        # Fetch already-applied migration versions.
        result = conn.execute(text("SELECT version FROM schema_migrations"))
        applied_versions = {row[0] for row in result.fetchall()}

    for version, migration_sql in MIGRATIONS:
        if version in applied_versions:
            logger.debug("Migration %s already applied — skipping.", version)
            continue

        logger.info("Applying migration: %s", version)
        # Each migration gets its own atomic transaction.
        with engine.begin() as conn:
            stmt = migration_sql.strip()
            if stmt:
                try:
                    conn.execute(text(stmt))
                except Exception as exc:
                    # Log the full statement so the problem is immediately visible.
                    logger.error(
                        "Migration %s FAILED.\nSQL:\n%s\nError: %s",
                        version, stmt, exc,
                    )
                    raise  # Let the caller (main.py lifespan) handle it.

            conn.execute(
                text("INSERT INTO schema_migrations (version) VALUES (:v)"),
                {"v": version},
            )
        logger.info("Migration %s applied successfully.", version)
