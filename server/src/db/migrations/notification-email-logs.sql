BEGIN;

CREATE TABLE IF NOT EXISTS notification_email_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email_type TEXT NOT NULL,
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    resend_email_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, email_type, period_start, period_end)
);

CREATE INDEX IF NOT EXISTS idx_notification_email_logs_user_type_created
    ON notification_email_logs(user_id, email_type, created_at DESC);

COMMIT;
