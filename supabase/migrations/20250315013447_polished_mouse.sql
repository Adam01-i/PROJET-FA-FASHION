/*
  # Mise à jour des images de produits

  1. Changements
    - Mise à jour des URLs d'images pour certains produits avec des images valides
*/

UPDATE products 
SET image_url = 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
WHERE name = 'iPad Air';

UPDATE products 
SET image_url = 'https://images.unsplash.com/photo-1584771145729-0bd9fda6529b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
WHERE name = 'Robot aspirateur intelligent';

UPDATE products 
SET image_url = 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
WHERE name = 'Robe d''été florale';

UPDATE products 
SET image_url = 'https://images.unsplash.com/photo-1549476464-37392f717541?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
WHERE name = 'Haltères ajustables';

UPDATE products 
SET image_url = 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
WHERE name = 'Canapé convertible';

UPDATE products 
SET image_url = 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
WHERE name = 'Lunettes de soleil aviateur';

UPDATE products 
SET image_url = 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
WHERE name = 'Vélo électrique urbain';