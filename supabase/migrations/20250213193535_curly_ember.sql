/*
  # Add insert policy for query plans

  1. Security Changes
    - Add policy for public insert access to query_plans table
    - Includes validation checks for expiration date
*/

-- Allow public insert access
CREATE POLICY "Public can insert plans"
  ON query_plans
  FOR INSERT
  TO public
  WITH CHECK (
    -- Ensure expires_at is in the future
    expires_at > now() AND
    -- Ensure expires_at is not too far in the future (max 30 days)
    expires_at <= (now() + interval '30 days')
  );