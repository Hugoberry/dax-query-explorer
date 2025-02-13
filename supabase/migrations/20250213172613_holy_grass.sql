/*
  # Create query plans table

  1. New Tables
    - `query_plans`
      - `id` (uuid, primary key)
      - `query_plan` (jsonb)
      - `created_at` (timestamp)
      - `expires_at` (timestamp)
      - `short_code` (text, unique)

  2. Security
    - Enable RLS on `query_plans` table
    - Add policy for public read access to non-expired plans
*/

CREATE TABLE IF NOT EXISTS query_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_plan jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  short_code text UNIQUE NOT NULL
);

-- Enable RLS
ALTER TABLE query_plans ENABLE ROW LEVEL SECURITY;

-- Allow public read access to non-expired plans
CREATE POLICY "Public can read non-expired plans"
  ON query_plans
  FOR SELECT
  TO public
  USING (expires_at > now());