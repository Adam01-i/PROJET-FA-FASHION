/*
  # RLS policies for admin and users

  Changes
  - Adjust products policies: public read, admins full modify
  - Add admin-wide policies for orders and order_items (view/update/delete)
  - Keep user-scoped policies for their own orders and order_items
*/

-- PRODUCTS: drop old admin policy if exists and recreate
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'Only admins can modify products'
  ) THEN
    EXECUTE 'DROP POLICY "Only admins can modify products" ON products';
  END IF;
END $$;

-- Allow admins to insert/update/delete products
CREATE POLICY "Admins can modify products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND lower(u.email) = ANY (ARRAY['admin@kshop.sn','admin@example.com'])
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND lower(u.email) = ANY (ARRAY['admin@kshop.sn','admin@example.com'])
    )
  );

-- ORDERS: admins can view/update/delete any order
CREATE POLICY "Admins can view orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND lower(u.email) = ANY (ARRAY['admin@kshop.sn','admin@example.com'])
    )
  );

CREATE POLICY "Admins can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND lower(u.email) = ANY (ARRAY['admin@kshop.sn','admin@example.com'])
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND lower(u.email) = ANY (ARRAY['admin@kshop.sn','admin@example.com'])
    )
  );

CREATE POLICY "Admins can delete orders"
  ON orders
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND lower(u.email) = ANY (ARRAY['admin@kshop.sn','admin@example.com'])
    )
  );

-- ORDER_ITEMS: admins can view/modify any
CREATE POLICY "Admins can view order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND lower(u.email) = ANY (ARRAY['admin@kshop.sn','admin@example.com'])
    )
  );

CREATE POLICY "Admins can modify order items"
  ON order_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND lower(u.email) = ANY (ARRAY['admin@kshop.sn','admin@example.com'])
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND lower(u.email) = ANY (ARRAY['admin@kshop.sn','admin@example.com'])
    )
  );