/*
  # Ajout de 20 produits supplémentaires

  1. Changements
    - Ajout de 20 nouveaux produits dans la table `products`
    - Diversification des catégories
    - Prix variés
    - Images de qualité depuis Unsplash
*/

INSERT INTO products (name, description, price, image_url, stock, category) VALUES
(
  'iPad Air',
  'Tablette Apple avec écran Liquid Retina 10.9", puce M1 et support Apple Pencil',
  699.99,
  'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  15,
  'Électronique'
),
(
  'Robot aspirateur intelligent',
  'Robot aspirateur avec cartographie laser, contrôle via application et station de vidage automatique',
  499.99,
  'https://images.unsplash.com/photo-1589006015375-a4c1ce28340e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  8,
  'Maison'
),
(
  'Robe d''été florale',
  'Robe légère en coton bio avec motif floral et coupe midi',
  79.99,
  'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  20,
  'Mode'
),
(
  'Haltères ajustables',
  'Set d''haltères ajustables de 2 à 24kg avec support de rangement',
  299.99,
  'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  12,
  'Sport'
),
(
  'Appareil photo mirrorless',
  'Appareil photo numérique 24MP avec stabilisation et Wi-Fi intégré',
  899.99,
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  5,
  'Électronique'
),
(
  'Canapé convertible',
  'Canapé-lit 3 places en tissu avec rangement intégré',
  799.99,
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  4,
  'Maison'
),
(
  'Lunettes de soleil aviateur',
  'Lunettes de soleil style aviateur avec verres polarisés',
  129.99,
  'https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  30,
  'Mode'
),
(
  'Vélo électrique urbain',
  'Vélo électrique avec autonomie de 80km et cadre en aluminium',
  1499.99,
  'https://images.unsplash.com/photo-1571068316344-75bc76f77890?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  6,
  'Sport'
),
(
  'Console de jeux portable',
  'Console portable avec écran OLED 7" et bibliothèque de jeux rétro',
  299.99,
  'https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  18,
  'Électronique'
),
(
  'Lampe design',
  'Lampe de table articulée avec variateur de luminosité',
  89.99,
  'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  15,
  'Maison'
),
(
  'Chemise en lin',
  'Chemise homme en lin naturel, coupe regular fit',
  59.99,
  'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  25,
  'Mode'
),
(
  'Tapis de course pliable',
  'Tapis de course électrique pliable avec programmes d''entraînement',
  699.99,
  'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  7,
  'Sport'
),
(
  'Casque audio sans fil',
  'Casque bluetooth avec réduction de bruit active et 30h d''autonomie',
  249.99,
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  22,
  'Électronique'
),
(
  'Bureau ergonomique',
  'Bureau réglable en hauteur avec plateau en bambou',
  399.99,
  'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  10,
  'Maison'
),
(
  'Sac à main cuir',
  'Sac à main en cuir véritable avec finitions dorées',
  199.99,
  'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  16,
  'Mode'
),
(
  'Set de tennis',
  'Raquette de tennis professionnelle avec housse et accessoires',
  159.99,
  'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  14,
  'Sport'
),
(
  'Vidéoprojecteur 4K',
  'Vidéoprojecteur home cinéma 4K HDR avec son Dolby Atmos',
  999.99,
  'https://images.unsplash.com/photo-1478720568477-152d9b164e26?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  6,
  'Électronique'
),
(
  'Set de couteaux japonais',
  'Set de 5 couteaux de cuisine professionnels en acier Damascus',
  299.99,
  'https://images.unsplash.com/photo-1593618998160-c0d677c60425?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  9,
  'Maison'
),
(
  'Montre automatique',
  'Montre mécanique automatique avec bracelet en cuir italien',
  449.99,
  'https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  11,
  'Mode'
),
(
  'Paddle gonflable',
  'Stand up paddle board gonflable avec pagaie et sac de transport',
  399.99,
  'https://images.unsplash.com/photo-1526188717906-ab4a2f949f47?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
  8,
  'Sport'
);