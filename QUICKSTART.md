# 🚀 Démarrage Rapide - Luxonera

## Installation en 3 étapes

### 1️⃣ Installer les dépendances

```bash
npm install
```

### 2️⃣ Lancer le serveur de développement

```bash
npm run dev
```

### 3️⃣ Ouvrir dans le navigateur

Visitez [http://localhost:3000](http://localhost:3000)

## ✅ C'est tout !

Le site est maintenant fonctionnel avec :
- ✅ Landing page premium avec animations
- ✅ Catalogue de 12 montres de luxe
- ✅ Pages produits détaillées
- ✅ Panier fonctionnel
- ✅ Intégration WhatsApp
- ✅ Viewer 3D interactif
- ✅ Design responsive

## 📸 Prochaines étapes

### Ajouter vos images

Placez vos images dans `public/images/watches/` avec les noms correspondants dans `src/data/products.ts`.

Exemple :
```
public/images/watches/
├── classique-or-main.jpg
├── classique-or-1.jpg
├── classique-or-2.jpg
└── ...
```

### Modifier le catalogue

Éditez `src/data/products.ts` pour personnaliser vos montres.

### Changer le numéro WhatsApp

Éditez `src/data/siteConfig.ts` :

```typescript
whatsapp: {
  number: '22671363053',  // Votre numéro
  displayNumber: '+226 71 36 30 53',
}
```

## 🎨 Personnalisation

### Couleurs

Modifiez `tailwind.config.js` pour changer les couleurs de la marque.

### Contenu

- **Landing page**: `src/app/(shop)/page.tsx`
- **About page**: `src/app/(shop)/about/page.tsx`
- **Produits**: `src/data/products.ts`

## 📦 Build pour Production

```bash
npm run build
npm start
```

## 🚀 Déploiement

Le moyen le plus simple est d'utiliser [Vercel](https://vercel.com) :

1. Push votre code sur GitHub
2. Importez sur Vercel
3. Déployez en un clic

## ❓ Besoin d'aide ?

Consultez le [README.md](./README.md) complet pour plus de détails.

---

**Luxonera** - L'Excellence Horlogère
