# Luxonera - Site E-Commerce de Montres de Luxe

Site vitrine premium pour Luxonera, une boutique de montres de luxe avec intégration WhatsApp pour les commandes.

## 🌟 Caractéristiques

- **Design Premium** inspiré de Rolex et Patek Philippe
- **Animations 3D** avec React Three Fiber pour une expérience immersive
- **Viewer 3D Interactif** pour explorer les montres en détail
- **Panier persistant** avec Zustand
- **Commandes WhatsApp** (+226 71363053)
- **Animations fluides** avec GSAP et Framer Motion
- **100% Responsive** - Mobile, Tablette, Desktop
- **Performance optimisée** avec Next.js 15

## 🚀 Stack Technique

- **Framework**: Next.js 15 avec App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **3D**: React Three Fiber + Three.js + @react-three/drei
- **Animations**: GSAP, ScrollTrigger, Framer Motion
- **State Management**: Zustand avec persistence
- **Fonts**: Playfair Display, Cormorant Garamond, Inter

## 📁 Structure du Projet

```
luxonera/
├── public/
│   ├── images/          # Images des montres (à ajouter)
│   └── models/          # Modèles 3D .glb (optionnel)
├── src/
│   ├── app/
│   │   ├── (shop)/      # Pages du site
│   │   │   ├── page.tsx           # Landing page
│   │   │   ├── catalog/           # Catalogue
│   │   │   ├── watch/[slug]/      # Page produit
│   │   │   ├── cart/              # Panier
│   │   │   └── about/             # À propos
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/      # Header, Footer
│   │   ├── canvas/      # Composants 3D
│   │   ├── product/     # ProductCard, ProductGrid
│   │   ├── cart/        # CartItem, WhatsAppCheckout
│   │   ├── sections/    # Sections landing page
│   │   └── ui/          # Button, Loading, FloatingWhatsApp
│   ├── data/
│   │   ├── products.ts  # Catalogue de 12 montres
│   │   └── siteConfig.ts
│   ├── lib/
│   │   ├── utils.ts
│   │   └── whatsapp.ts  # Intégration WhatsApp
│   ├── store/
│   │   └── cartStore.ts # Store Zustand
│   └── types/
│       ├── product.ts
│       └── cart.ts
```

## 🛠️ Installation

### 1. Installer les dépendances

```bash
npm install
```

### 2. Lancer le serveur de développement

```bash
npm run dev
```

Le site sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📸 Ajouter vos images

Le projet utilise actuellement des placeholders. Pour ajouter vos vraies images :

### Structure des images recommandée :

```
public/
├── images/
│   ├── watches/
│   │   ├── classique-or-main.jpg
│   │   ├── classique-or-1.jpg
│   │   ├── classique-or-2.jpg
│   │   └── ... (autres montres)
│   ├── hero/
│   │   └── hero-bg.jpg
│   └── lifestyle/
│       └── lifestyle-1.jpg
```

### Formats recommandés :

- **Images produits**: 1000x1000px minimum, format JPG ou WebP
- **Images hero**: 1920x1080px, format JPG ou WebP
- **Qualité**: 85-90% pour équilibrer poids/qualité

### Optimisation automatique

Next.js optimise automatiquement les images avec le composant `<Image>`. Vos images seront :

- Redimensionnées automatiquement
- Converties en WebP/AVIF
- Lazy-loadées
- Responsive

## 🎨 Personnalisation

### Modifier les couleurs

Éditez `tailwind.config.js` :

```javascript
colors: {
  accent: {
    gold: '#D4AF37',  // Votre couleur or
    champagne: '#F7E7CE',
  },
}
```

### Modifier le catalogue de montres

Éditez `src/data/products.ts` pour ajouter/modifier les montres :

```typescript
{
  id: 'watch-xxx',
  slug: 'nom-montre',
  name: 'Nom de la Montre',
  collection: 'Collection',
  price: 1000000,
  // ... autres propriétés
}
```

### Modifier le numéro WhatsApp

Éditez `src/data/siteConfig.ts` :

```typescript
whatsapp: {
  number: '22671363053',  // Votre numéro
  displayNumber: '+226 71 36 30 53',
}
```

## 🎭 Animations

Le site utilise plusieurs bibliothèques d'animation :

- **GSAP + ScrollTrigger**: Animations au scroll
- **Framer Motion**: Transitions et micro-interactions
- **React Three Fiber**: Animations 3D

Toutes les animations sont optimisées pour les performances.

## 📱 Responsive Design

Le site est entièrement responsive avec 3 breakpoints principaux :

- **Mobile**: < 768px (1 colonne)
- **Tablette**: 768px - 1024px (2 colonnes)
- **Desktop**: > 1024px (3-4 colonnes)

## 🔧 Build pour Production

### Build statique

```bash
npm run build
```

Le site sera généré dans le dossier `.next/`

### Pour export statique

Décommentez dans `next.config.js` :

```javascript
output: 'export',
```

Puis :

```bash
npm run build
```

Les fichiers statiques seront dans `/out`

## 🚀 Déploiement

### Vercel (Recommandé)

1. Push votre code sur GitHub
2. Connectez votre repo sur [vercel.com](https://vercel.com)
3. Déployez en un clic

### Netlify

1. Push votre code sur GitHub
2. Connectez votre repo sur [netlify.com](https://netlify.com)
3. Build command: `npm run build`
4. Publish directory: `.next`

### Autres hébergeurs

Pour un hébergement statique, utilisez `output: 'export'` et déployez le dossier `/out`.

## 📦 Fonctionnalités Principales

### 1. Landing Page Premium

- Hero section full-screen avec animations
- Collection featured avec animations scroll
- Section héritage avec parallax
- Section artisanat avec cartes animées

### 2. Catalogue Complet

- Filtres par collection
- Tri (prix, nom, nouveautés)
- Grille responsive 3 colonnes
- Hover effects élégants

### 3. Page Produit Détaillée

- Galerie d'images avec thumbnails
- Viewer 3D interactif (si modèle disponible)
- Spécifications complètes
- Ajout au panier
- Commande directe WhatsApp
- Produits similaires

### 4. Panier avec WhatsApp

- Persistant (localStorage)
- Gestion quantités
- Checkout via WhatsApp
- Message formaté automatiquement

### 5. Viewer 3D

- Rotation automatique ou manuelle
- Zoom
- Lighting premium
- Shadows et reflets réalistes

## 🎯 SEO & Performance

- **Métadonnées** optimisées
- **Images** optimisées automatiquement
- **Lazy loading** des composants
- **Code splitting** automatique
- Score Lighthouse visé : **> 90**

## 🔐 Sécurité

- Pas de base de données (site statique)
- Pas de paiement en ligne
- Commandes via WhatsApp sécurisé
- Validation côté client

## 📝 Données Produits

Le site contient 12 montres exemple dans différentes collections :

- **Heritage**: Montres classiques
- **Sport**: Chronographes et montres de plongée
- **Femme**: Montres féminines avec diamants
- **Complications**: Montres haute horlogerie
- **Moderne**: Designs contemporains
- Etc.

Vous pouvez modifier ces données dans `src/data/products.ts`.

## 🎨 Design System

### Typographie

- **Display**: Cormorant Garamond (titres principaux)
- **Serif**: Playfair Display (sous-titres)
- **Sans**: Inter (texte corps)

### Palette de Couleurs

- **Noir**: #000000 (principal)
- **Blanc**: #FFFFFF
- **Or**: #D4AF37 (accent)
- **Gris neutre**: #F5F5F5

### Spacing

- Sections: 80-120px padding
- Cards: 24-32px padding
- Gap: 32-48px

## 🐛 Troubleshooting

### Les images ne s'affichent pas

Vérifiez que les images sont dans `public/images/` et que les chemins dans `products.ts` sont corrects.

### Erreur avec React Three Fiber

Assurez-vous d'avoir la version RC installée :

```bash
npm install @react-three/fiber@rc @react-three/drei three
```

### Erreur avec Zustand persist

Vérifiez que vous utilisez la version correcte :

```bash
npm install zustand
```

### Build error

Supprimez `.next` et `node_modules` puis réinstallez :

```bash
rm -rf .next node_modules
npm install
npm run build
```

## 📞 Support

Pour toute question concernant ce projet :

- WhatsApp: +226 71 36 30 53
- Email: support@luxonera.com (exemple)

## 📄 Licence

Ce projet est propriétaire et confidentiel.

## 🙏 Crédits

- Design inspiré de Rolex et Patek Philippe
- Animations avec GSAP et Framer Motion
- 3D avec React Three Fiber
- Built with Next.js 15

---

**Luxonera** - L'Excellence Horlogère
