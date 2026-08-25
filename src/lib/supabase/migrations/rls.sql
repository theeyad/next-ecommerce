------------------------------------------------------
---- Helper Function (Prevents RLS Infinite Recursion)
------------------------------------------------------
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

------------------------------------------------------
---- Products and Categories
------------------------------------------------------
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
 
-- Anyone can read active products
CREATE POLICY "Anyone can read active products"
ON products FOR SELECT
USING (is_active = true);
 
-- Admins can do everything with products
CREATE POLICY "Admins can manage products"
ON products FOR ALL
USING (is_admin());
 
-- Same pattern for categories
CREATE POLICY "Anyone can read categories"
ON categories FOR SELECT USING (true);
 
CREATE POLICY "Admins can manage categories"
ON categories FOR ALL
USING (is_admin());

-- Anyone can read product images
CREATE POLICY "Anyone can read product images"
ON product_images FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_id
    AND products.is_active = true
  )
);

-- Admins can manage product images
CREATE POLICY "Admins can manage product images"
ON product_images FOR ALL
USING (is_admin());

------------------------------------------------------
---- Orders
------------------------------------------------------
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
 
CREATE POLICY "Users can read own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);
 
CREATE POLICY "Users can create own orders"
ON orders FOR INSERT
WITH CHECK (auth.uid() = user_id);
 
CREATE POLICY "Admins can read all orders"
ON orders FOR SELECT
USING (is_admin());
 
CREATE POLICY "Admins can update order status"
ON orders FOR UPDATE
USING (is_admin());
 
-- Order items follow same pattern as orders
CREATE POLICY "Users can read own order items"
ON order_items FOR SELECT
USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND orders.user_id = auth.uid())
);

-- Users can create their own order items
CREATE POLICY "Users can create own order items"
ON order_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_id
    AND orders.user_id = auth.uid()
  )
);

-- Admins can manage (including inserting) order items (needed for order creation flow)
CREATE POLICY "Admins can manage order items"
ON order_items FOR ALL
USING (is_admin());

------------------------------------------------------
---- Profiles
------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile without changing their role"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (role = (SELECT role FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can read all profiles"
ON profiles FOR SELECT
USING (is_admin());

-- Admins can update any profile (including promoting users to admin)
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
USING (is_admin());
