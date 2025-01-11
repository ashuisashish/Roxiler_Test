/*
  # Create transactions table

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key)
      - `product_id` (integer, for original product ID)
      - `title` (text)
      - `price` (numeric)
      - `description` (text)
      - `category` (text)
      - `sold` (boolean)
      - `date_of_sale` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `transactions` table
    - Add policy for authenticated users to read all transactions
    - Add policy for authenticated users to create transactions
*/

CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id integer NOT NULL,
  title text NOT NULL,
  price numeric(10,2) NOT NULL,
  description text,
  category text NOT NULL,
  sold boolean DEFAULT false,
  date_of_sale timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to all authenticated users"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow insert access to all authenticated users"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);