/*
  # Configuration initiale de la base de données e-commerce

  1. Nouvelles Tables
    - `products`
      - `id` (uuid, clé primaire)
      - `name` (text, nom du produit)
      - `description` (text, description du produit)
      - `price` (numeric, prix)
      - `image_url` (text, URL de l'image)
      - `stock` (integer, quantité en stock)
      - `category` (text, catégorie du produit)
      - `created_at` (timestamp avec fuseau horaire)

  2. Sécurité
    - Activation RLS sur la table `products`
    - Politique permettant à tous de lire les produits
    - Seuls les administrateurs peuvent modifier les produits
*/

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  image_url text,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture des produits à tout le monde
CREATE POLICY "Anyone can view products" ON products
  FOR SELECT
  TO public
  USING (true);

-- Politique pour permettre la modification des produits aux administrateurs uniquement
CREATE POLICY "Only admins can modify products" ON products
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT auth.uid() FROM auth.users
    WHERE auth.email() IN ('admin@example.com')
  ));