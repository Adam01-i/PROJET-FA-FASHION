Projet-E-Commerce

# Fa-Fashion - Plateforme E-commerce

## 📋 Description du Projet

**Fa-Fashion** est une application e-commerce moderne et complète développée avec React, TypeScript et Supabase. La plateforme permet aux utilisateurs de parcourir des produits, passer des commandes et gérer leur compte, avec des interfaces distinctes pour les clients, assistants et administrateurs.

## 🎯 Fonctionnalités Principales

### 👤 Clients
- **Catalogue Produits** : Navigation et recherche de produits
- **Panier d'achat** : Ajout/suppression de produits, ajustement des quantités
- **Commande via WhatsApp** : Intégration directe avec WhatsApp pour passer commande
- **Favoris** : Liste de produits favoris
- **Historique des commandes** : Suivi des commandes passées
- **Compte utilisateur** : Inscription, connexion, gestion de profil

### 👨‍💼 Assistants
- **Gestion des commandes** : Suivi et mise à jour des statuts de commande
- **Vérification d'inventaire** : Gestion des stocks et disponibilités
- **Dashboard Assistant** : Interface dédiée avec statistiques

### 👑 Administrateurs
- **Dashboard Admin** : Vue d'ensemble complète de la plateforme
- **Gestion des produits** : CRUD complet des produits
- **Gestion des commandes** : Visualisation et gestion de toutes les commandes
- **Gestion des utilisateurs** : Administration des rôles et comptes
- **Analytiques** : Statistiques de vente et performances

## 🏗️ Architecture Technique

### Frontend
- **React 18** avec TypeScript
- **React Router DOM** pour la navigation
- **Tailwind CSS** pour le styling
- **Lucide React** pour les icônes
- **Framer Motion** pour les animations

### Backend & Base de données
- **Supabase** (PostgreSQL + Auth + Storage)
- **Authentification** avec rôles (client/assistant/admin)
- **Base de données** : Tables `profiles`, `products`, `orders`, `order_items`
- **Stockage** : Images des produits

### Fonctionnalités Avancées
- **Responsive Design** : Mobile-first approach
- **Authentification sécurisée** avec redirection basée sur les rôles
- **Panier persistant** avec localStorage
- **Intégration WhatsApp** pour les commandes
- **Notifications Toast** pour l'UX
- **Animations fluides** entre les pages

## 📁 Structure des Dossiers


adam@adaam:~/Bureau/MES_PROJETS/FAFASHION/FAFASHION FRONTEND$ tree -L 2
.
├── index.html
├── public
│   ├── factures
│   ├── image.webp
│   └── img1.jpg
├── README.md
├── src
│   ├── App.tsx
│   ├── components
│   ├── contexts
│   ├── hooks
│   ├── index.css
│   ├── lib
│   ├── main.tsx
│   ├── models
│   ├── payment
│   ├── services
│   ├── styles
│   ├── templates
│   ├── ui
│   ├── utils

## 🔧 Installation et Configuration

### Prérequis
- Node.js 16+ et npm
- Compte Supabase

### 1. Cloner le projet
```bash
git clone https://github.com/Adam01-i/PROJET-FA-FASHION.git
cd fa-fashion
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration Supabase
- Créer un projet sur [supabase.com](https://supabase.com)
- Exécuter les SQL migrations fournies
- Récupérer les variables d'environnement

### 4. Variables d'environnement
Créer un fichier `.env.local` :
```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_anon_key
```

### 5. Lancer l'application
```bash
npm run dev
```

## 🗄️ Base de Données

### Tables Principales
- **profiles** : Informations utilisateurs et rôles
- **products** : Catalogue produits avec stock
- **orders** : Commandes avec statuts
- **order_items** : Items des commandes
- **wishlist** : Produits favoris

### RLS (Row Level Security)
- Politiques configurées pour chaque table
- Séparation des données par rôles
- Accès restreint selon les permissions

## 🚀 Déploiement

### Options recommandées
- **Vercel** : Déploiement simplifié avec CI/CD
- **Netlify** : Alternative excellente pour React
- **Supabase Hosting** : Intégration native

```bash
# Build pour production
npm run build

# Serveur de preview
npm run preview
```

## 📱 Interfaces

### Page d'accueil
- Header avec navigation contextuelle
- Catalogue produits responsive
- Barre de recherche
- Panier dynamique

### Panier
- Vue détaillée des articles
- Calcul automatique du total
- Bouton WhatsApp pour commander
- Gestion des quantités

### Dashboard Admin
- Vue globale des statistiques
- Tableaux de gestion
- Formulaire d'ajout de produits
- Graphiques de performance

### Dashboard Assistant
- Interface simplifiée
- Focus sur commandes et inventaire
- Actions rapides

## 🔐 Sécurité

- **Auth Supabase** : Gestion sécurisée des sessions
- **RLS** : Protection au niveau base de données
- **Validation** : Vérification côté client et serveur
- **HTTPS** : Communication chiffrée

## 📈 Performance

- **Code splitting** automatique avec Vite
- **Lazy loading** des composants
- **Optimisation des images** via Supabase Storage
- **Minification** pour production

## 🧪 Tests

```bash
# Lancer les tests
npm test

# Tests avec couverture
npm run test:coverage

# Tests E2E (si configurés)
npm run test:e2e
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Équipe

- **Développeur Frontend** : Adama Seck
- **Design UI/UX** :  Adama Seck
- **Backend & DevOps** : Supabase

## 📞 Support

Pour toute question ou problème :
1. Ouvrir une issue sur GitHub
2. Consulter la documentation Supabase
3. Contacter l'équipe de développement

---

**Fa-Fashion** © 2024 - Une solution e-commerce moderne et scalable
