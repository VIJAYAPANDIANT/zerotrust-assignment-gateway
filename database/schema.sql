-- ==============================================================================
-- ZeroTrust Assignment Submission Gateway
-- PostgreSQL Database Schema for Supabase
-- ==============================================================================

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Table: users
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Role constraint: restricts values to allowed academic roles
    CONSTRAINT chk_user_role CHECK (role IN ('student', 'faculty', 'admin'))
);

-- Comments for users table
COMMENT ON TABLE users IS 'User profiles and credentials across student, faculty, and administrator roles.';
COMMENT ON COLUMN users.id IS 'Unique identifier for the user account (UUID).';
COMMENT ON COLUMN users.role IS 'Zero-trust authorization role (student, faculty, or admin).';

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ------------------------------------------------------------------------------
-- 2. Table: assignments
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    deadline TIMESTAMPTZ NOT NULL,
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Key: created_by references users(id)
    CONSTRAINT fk_assignments_created_by FOREIGN KEY (created_by)
        REFERENCES users(id) ON DELETE CASCADE
);

-- Comments for assignments table
COMMENT ON TABLE assignments IS 'Academic assignments published by faculty or administrators.';
COMMENT ON COLUMN assignments.created_by IS 'Reference to the user who authored the assignment.';

-- Indexes for assignments
CREATE INDEX IF NOT EXISTS idx_assignments_created_by ON assignments(created_by);
CREATE INDEX IF NOT EXISTS idx_assignments_deadline ON assignments(deadline);

-- ------------------------------------------------------------------------------
-- 3. Table: submissions
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL,
    student_id UUID NOT NULL,
    file_url TEXT NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'submitted',
    marks NUMERIC(5, 2) DEFAULT NULL,
    feedback TEXT DEFAULT NULL,

    -- Foreign Keys
    CONSTRAINT fk_submissions_assignment FOREIGN KEY (assignment_id)
        REFERENCES assignments(id) ON DELETE CASCADE,
    CONSTRAINT fk_submissions_student FOREIGN KEY (student_id)
        REFERENCES users(id) ON DELETE CASCADE,

    -- Status constraint
    CONSTRAINT chk_submission_status CHECK (status IN ('submitted', 'graded', 'resubmitted', 'late')),

    -- Marks validation constraint
    CONSTRAINT chk_submission_marks CHECK (marks IS NULL OR marks >= 0),

    -- Ensure a student has only one active submission record per assignment
    CONSTRAINT uq_assignment_student UNIQUE (assignment_id, student_id)
);

-- Comments for submissions table
COMMENT ON TABLE submissions IS 'Student assignment submission records and grading evaluations.';
COMMENT ON COLUMN submissions.file_url IS 'Storage URL pointing to the submitted artifact in Supabase Storage.';

-- Indexes for submissions
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- ------------------------------------------------------------------------------
-- 4. Table: access_logs
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    endpoint VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL,
    result VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Key (Nullable for unauthenticated attempts or deleted users)
    CONSTRAINT fk_access_logs_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE SET NULL,

    -- Result constraint: supports ALLOW, BLOCK, and FAILURE for Zero Trust evaluation
    CONSTRAINT chk_access_log_result CHECK (result IN ('ALLOW', 'BLOCK', 'FAILURE', 'success', 'failure', 'denied', 'error'))
);

-- Comments for access_logs table
COMMENT ON TABLE access_logs IS 'Audit logging for continuous verification and Zero Trust access evaluation.';
COMMENT ON COLUMN access_logs.ip_address IS 'Client IP address capturing IPv4 or IPv6 format.';

-- Indexes for access_logs
CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON access_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_endpoint ON access_logs(endpoint);
