# 📁 Structure Complète du Projet Luxonera

```
luxonera/
│
├── 📄 Configuration Files
│   ├── package.json                 # Dépendances et scripts
│   ├── next.config.js              # Configuration Next.js
│   ├── tailwind.config.js          # Configuration Tailwind CSS
│   ├── tsconfig.json               # Configuration TypeScript
│   ├── postcss.config.js           # Configuration PostCSS
│   ├── .eslintrc.json             # Configuration ESLint
│   ├── .gitignore                 # Fichiers ignorés par Git
│   ├── .env.example               # Variables d'environnement exemple
│   ├── README.md                  # Documentation complète
│   ├── QUICKSTART.md              # Guide de démarrage rapide
│   └── PROJECT_STRUCTURE.md       # Ce fichier
│
├── 📂 public/                      # Fichiers statiques
│   ├── images/                    # Images du site
│   │   ├── watches/               # Images des montres (à ajouter)
│   │   ├── hero/                  # Images hero section
│   │   ├── lifestyle/             # Images lifestyle
│   │   └── .gitkeep              # Garde le dossier dans Git
│   └── models/                    # Modèles 3D .glb (optionnel)
│
└── 📂 src/                         # Code source
    │
    ├── 📂 app/                     # App Router Next.js 15
    │   ├── layout.tsx             # Layout racine
    │   ├── globals.css            # Styles globaux
    │   ├── not-found.tsx          # Page 404
    │   │
    │   └── 📂 (shop)/             # Groupe de routes shop
    │       ├── layout.tsx         # Layout avec Header/Footer
    │       ├── page.tsx           # 🏠 Landing Page
    │       │
    │       ├── 📂 catalog/        # Catalogue
    │       │   └── page.tsx       # 📚 Page catalogue
    │       │
    │       ├── 📂 watch/          # Pages produits
    │       │   └── 📂 [slug]/     # Route dynamique
    │       │       └── page.tsx   # 🕐 Page produit détaillée
    │       │
    │       ├── 📂 cart/           # Panier
    │       │   └── page.tsx       # 🛒 Page panier
    │       │
    │       └── 📂 about/          # À propos
    │           └── page.tsx       # ℹ️ Page à propos
    │
    ├── 📂 components/              # Composants React
    │   │
    │   ├── 📂 layout/             # Composants layout
    │   │   ├── Header.tsx         # En-tête sticky avec navigation
    │   │   └── Footer.tsx         # Pied de page
    │   │
    │   ├── 📂 canvas/             # Composants 3D
    │   │   └── WatchViewer.tsx    # Viewer 3D interactif
    │   │
    │   ├── 📂 product/            # Composants produits
    │   │   ├── ProductCard.tsx    # Carte produit avec hover
    │   │   └── ProductGrid.tsx    # Grille de produits
    │   │
    │   ├── 📂 cart/               # Composants panier
    │   │   ├── CartItem.tsx       # Item dans le panier
    │   │   └── WhatsAppCheckout.tsx # Checkout WhatsApp
    │   │
    │   ├── 📂 sections/           # Sections landing page
    │   │   ├── HeroSection.tsx    # Hero avec animations
    │   │   ├── FeaturedCollection.tsx # Collection vedette
    │   │   ├── HeritageStory.tsx  # Histoire de la marque
    │   │   └── CraftsmanshipSection.tsx # Artisanat
    │   │
    │   └── 📂 ui/                 # Composants UI réutilisables
    │       ├── Button.tsx         # Bouton avec variants
    │       ├── Loading.tsx        # Indicateurs de chargement
    │       └── FloatingWhatsApp.tsx # Bouton WhatsApp flottant
    │
    ├── 📂 data/                    # Données statiques
    │   ├── products.ts            # 12 montres de luxe
    │   └── siteConfig.ts          # Configuration du site
    │
    ├── 📂 lib/                     # Utilitaires
    │   ├── utils.ts               # Fonctions utilitaires
    │   └── whatsapp.ts            # Intégration WhatsApp
    │
    ├── 📂 store/                   # State management
    │   └── cartStore.ts           # Store Zustand pour le panier
    │
    └── 📂 types/                   # Types TypeScript
        ├── product.ts             # Types pour les produits
        └── cart.ts                # Types pour le panier
```

## 📊 Statistiques du Projet

- **Total de fichiers**: ~40 fichiers
- **Lignes de code**: ~3000+ lignes
- **Composants React**: 20+ composants
- **Pages**: 5 pages principales
- **Produits**: 12 montres dans le catalogue

## 🎨 Technologies Utilisées

### Frontend
- ⚡ Next.js 15 (App Router)
- ⚛️ React 19
- 📘 TypeScript
- 🎨 Tailwind CSS

### Animations
- 🎭 Framer Motion
- 🎬 GSAP + ScrollTrigger

### 3D
- 🎮 React Three Fiber
- 🔧 @react-three/drei
- 📦 Three.js

### State Management
- 🐻 Zustand avec persistence

### Styling
- 🎨 Tailwind CSS
- 🔤 Google Fonts (Playfair Display, Cormorant Garamond, Inter)

## 🚀 Fonctionnalités Principales

### Pages
1. **Landing Page** - Hero + Collections + Histoire + Artisanat
2. **Catalogue** - Filtres, tri, grille responsive
3. **Page Produit** - Galerie, 3D viewer, specs, WhatsApp
4. **Panier** - Gestion quantités, checkout WhatsApp
5. **À Propos** - Histoire de Luxonera

### Composants Clés
- **WatchViewer** - Viewer 3D interactif avec Three.js
- **ProductCard** - Carte produit avec hover animations
- **WhatsAppCheckout** - Formulaire de commande WhatsApp
- **FloatingWhatsApp** - Bouton flottant permanent

### Animations
- Scroll-triggered animations (GSAP)
- Page transitions (Framer Motion)
- 3D model rotation (Three.js)
- Hover effects élégants

## 📱 Responsive Design

- **Mobile** (< 768px): Layout 1 colonne
- **Tablette** (768px - 1024px): Layout 2 colonnes
- **Desktop** (> 1024px): Layout 3-4 colonnes

## 🎯 Optimisations

- ✅ Image optimization (Next.js Image)
- ✅ Lazy loading des composants
- ✅ Code splitting automatique
- ✅ Font optimization
- ✅ Persistent cart (localStorage)

## 🔧 Scripts Disponibles

```bash
npm run dev      # Serveur de développement
npm run build    # Build pour production
npm run start    # Serveur de production
npm run lint     # Linter le code
```

---

**Structure créée pour Luxonera - L'Excellence Horlogère**
