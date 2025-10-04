/*
  # Politiques RLS pour les assistants

  1. Changements
    - Ajout des politiques pour le rôle d'assistant
    - Les assistants peuvent lire tous les produits
    - Les assistants peuvent lire et mettre à jour les commandes
    - Les assistants peuvent lire tous les articles de commande

  2. Sécurité
    - Politiques basées sur les adresses email des assistants
    - Accès en lecture seule pour les produits
    - Accès en lecture/écriture limité pour les commandes
*/

-- PRODUCTS: Les assistants peuvent lire tous les produits
CREATE POLICY "Assistants can view products"
  ON products
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND lower(u.email) = ANY (ARRAY['assistant@kshop.sn','assistant@example.com'])
    )
  );

-- ORDERS: Les assistants peuvent lire toutes les commandes
CREATE POLICY "Assistants can view orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND lower(u.email) = ANY (ARRAY['assistant@kshop.sn','assistant@example.com'])
    )
  );

-- ORDERS: Les assistants peuvent mettre à jour le statut des commandes
CREATE POLICY "Assistants can update order status"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND lower(u.email) = ANY (ARRAY['assistant@kshop.sn','assistant@example.com'])
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND lower(u.email) = ANY (ARRAY['assistant@kshop.sn','assistant@example.com'])
    )
  );

-- ORDER_ITEMS: Les assistants peuvent lire tous les articles de commande
CREATE POLICY "Assistants can view order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND lower(u.email) = ANY (ARRAY['assistant@kshop.sn','assistant@example.com'])
    )
  );