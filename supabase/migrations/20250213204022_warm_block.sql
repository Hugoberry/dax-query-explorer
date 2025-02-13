/*
  # Update query_plan column type

  1. Changes
    - Modify query_plan column from jsonb to text to store raw query plan content

  2. Notes
    - Using ALTER TABLE to modify the column type
    - Using USING clause to safely convert existing jsonb data to text
*/

ALTER TABLE query_plans 
ALTER COLUMN query_plan TYPE text 
USING query_plan::text;