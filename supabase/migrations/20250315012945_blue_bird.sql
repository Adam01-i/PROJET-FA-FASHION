/*
  # Ajout de produits d'exemple

  1. Changements
    - Ajout de plusieurs produits d'exemple dans la table `products`
    - Catégories variées : Électronique, Mode, Maison, Sport
    - Prix et stocks réalistes
    - Images depuis Unsplash
*/

INSERT INTO products (name, description, price, image_url, stock, category) VALUES
(
  'MacBook Pro 14"',
  'Ordinateur portable Apple avec puce M2 Pro, 16 Go de RAM et 512 Go de stockage SSD',
  1999.99,
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  10,
  'Électronique'
),
(
  'Nike Air Max 270',
  'Baskets lifestyle avec unité Air visible et mesh respirant pour un confort optimal',
  149.99,
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  25,
  'Mode'
),
(
  'Machine à café automatique',
  'Machine à café avec broyeur intégré, écran tactile et système de nettoyage automatique',
  599.99,
  'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  8,
  'Maison'
),
(
  'Tapis de yoga premium',
  'Tapis antidérapant écologique de 6mm d''épaisseur avec sangle de transport',
  39.99,
  'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  30,
  'Sport'
),
(
  'Montre connectée',
  'Smartwatch avec suivi d''activité, notifications et autonomie de 7 jours',
  199.99,
  'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  15,
  'Électronique'
),
(
  'Enceinte Bluetooth',
  'Enceinte portable waterproof avec son 360° et 20h d''autonomie',
  89.99,
  'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  20,
  'Électronique'
),
(
  'Sac à dos design',
  'Sac à dos urbain avec compartiment laptop 15" et port USB intégré',
  79.99,
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  18,
  'Mode'
),
(
  'Plante d''intérieur',
  'Monstera Deliciosa en pot de 17cm avec cache-pot design',
  29.99,
  'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  12,
  'Maison'
);