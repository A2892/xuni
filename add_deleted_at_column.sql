-- Add deleted_at column to student_documents table for recycle bin support
ALTER TABLE student_documents ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add status column if it doesn't exist (optional, but good for state management)
ALTER TABLE student_documents ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Update existing records to have null deleted_at
UPDATE student_documents SET deleted_at = NULL WHERE deleted_at IS NOT NULL;
