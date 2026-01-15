# Guide de Déploiement - Luxonera sur VPS Hostinger

> **Système d'exploitation** : Ubuntu 22.04 LTS ou 24.04 LTS

## Prérequis
- VPS Hostinger (1 vCPU, 4 Go RAM, 50 Go NVMe)
- Accès SSH au serveur
- Nom de domaine pointant vers l'IP du VPS (optionnel mais recommandé)

---

## IMPORTANT : Fichiers sensibles à ne JAMAIS partager

Les fichiers suivants contiennent des informations sensibles et sont **automatiquement exclus de Git** grâce au `.gitignore` :

| Fichier | Contenu sensible |
|---------|------------------|
| `.env` | Variables d'environnement |
| `.env.local` | Secrets locaux (DATABASE_URL, NEXTAUTH_SECRET) |
| `.env.production` | Secrets de production |
| `*.pem`, `*.key` | Clés privées SSL |
| `credentials.json` | Identifiants API |

**Ne jamais :**
- Commiter ces fichiers sur GitHub/GitLab
- Les partager par email ou messagerie
- Les inclure dans des captures d'écran

**Le fichier `.env.local` doit être créé manuellement sur le serveur** (voir Étape 5).

---

## ÉTAPE 1 : Connexion au VPS

### 1.1 Se connecter en SSH
```bash
ssh root@VOTRE_IP_VPS
```
Remplace `VOTRE_IP_VPS` par l'adresse IP de ton VPS (visible dans le dashboard Hostinger).

### 1.2 Mettre à jour le système
```bash
apt update && apt upgrade -y
```

### 1.3 Créer un utilisateur non-root (recommandé pour la sécurité)
```bash
adduser luxonera
usermod -aG sudo luxonera
```
Entre un mot de passe sécurisé quand demandé.

### 1.4 Se connecter avec le nouvel utilisateur
```bash
su - luxonera
```

---

## ÉTAPE 2 : Installation de Node.js

### 2.1 Installer Node.js 20 LTS via NodeSource
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2.2 Vérifier l'installation
```bash
node --version
npm --version
```
Tu devrais voir `v20.x.x` pour Node.js.

---

## ÉTAPE 3 : Installation de PostgreSQL

### 3.1 Installer PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
```

### 3.2 Vérifier que PostgreSQL fonctionne
```bash
sudo systemctl status postgresql
```

### 3.3 Configurer la base de données

#### Se connecter à PostgreSQL
```bash
sudo -u postgres psql
```

#### Créer un utilisateur et une base de données
```sql
CREATE USER luxonera_user WITH PASSWORD 'TON_MOT_DE_PASSE_SECURISE';
CREATE DATABASE luxonera_db OWNER luxonera_user;
GRANT ALL PRIVILEGES ON DATABASE luxonera_db TO luxonera_user;
\q
```
**IMPORTANT** : Remplace `TON_MOT_DE_PASSE_SECURISE` par un mot de passe fort !

### 3.4 Tester la connexion
```bash
psql -U luxonera_user -d luxonera_db -h localhost
```
Entre le mot de passe. Si tu vois le prompt `luxonera_db=>`, c'est bon ! Tape `\q` pour quitter.

---

## ÉTAPE 4 : Installation de Git et récupération du projet

### 4.1 Installer Git
```bash
sudo apt install -y git
```

### 4.2 Créer le dossier de l'application
```bash
sudo mkdir -p /var/www/luxonera
sudo chown luxonera:luxonera /var/www/luxonera
cd /var/www/luxonera
```

### 4.3 Cloner ton projet

**Option A : Depuis GitHub/GitLab**
```bash
git clone https://github.com/TON_USERNAME/luxonera.git .
```

**Option B : Transfert direct depuis ton PC (si pas de repo Git)**

Sur ton PC Windows, ouvre PowerShell et exécute :
```powershell
scp -r "C:\Users\Mr.Adam's\Desktop\Decouverte\projet\luxonera\*" luxonera@VOTRE_IP_VPS:/var/www/luxonera/
```

---

## ÉTAPE 5 : Configuration de l'application

### 5.1 Créer le fichier .env.local

Tu peux te référer au fichier `.env.example` du projet comme modèle.

```bash
cd /var/www/luxonera
nano .env.local
```

### 5.2 Ajouter les variables d'environnement

Copie et adapte ces variables :

```env
# ===========================================
# BASE DE DONNÉES POSTGRESQL
# ===========================================
DATABASE_URL="postgresql://luxonera_user:TON_MOT_DE_PASSE_DB@localhost:5432/luxonera_db"
DIRECT_URL="postgresql://luxonera_user:TON_MOT_DE_PASSE_DB@localhost:5432/luxonera_db"

# ===========================================
# NEXTAUTH.JS (Authentification)
# ===========================================
NEXTAUTH_URL="https://tondomaine.com"
NEXTAUTH_SECRET="COLLE_ICI_LA_CLE_GENEREE"

# ===========================================
# CONFIGURATION DU SITE
# ===========================================
NEXT_PUBLIC_SITE_NAME="Luxonera"
NEXT_PUBLIC_SITE_URL="https://tondomaine.com"

# ===========================================
# WHATSAPP
# ===========================================
NEXT_PUBLIC_WHATSAPP_NUMBER="22671363053"

# ===========================================
# ADMIN (pour le premier compte admin)
# ===========================================
ADMIN_EMAIL="ton_email@exemple.com"
ADMIN_PASSWORD="UnMotDePasseTresSecurise123!"

# ===========================================
# STOCKAGE D'IMAGES (optionnel - si tu utilises Vercel Blob)
# ===========================================
# BLOB_READ_WRITE_TOKEN="ton_token_vercel_blob"
```

### 5.3 Générer NEXTAUTH_SECRET

Exécute cette commande et copie le résultat :
```bash
openssl rand -base64 32
```

### 5.4 Remplacer les valeurs

| Variable | Remplacer par |
|----------|---------------|
| `TON_MOT_DE_PASSE_DB` | Le mot de passe PostgreSQL créé à l'étape 3.3 |
| `tondomaine.com` | Ton vrai nom de domaine (ou l'IP du VPS) |
| `COLLE_ICI_LA_CLE_GENEREE` | Le résultat de `openssl rand -base64 32` |
| `ton_email@exemple.com` | Ton email admin |
| `UnMotDePasseTresSecurise123!` | Un mot de passe admin fort |

Sauvegarde avec `Ctrl+O`, `Entrée`, puis `Ctrl+X`.

### 5.5 Installer les dépendances
```bash
npm install
```

### 5.6 Générer le client Prisma et appliquer les migrations
```bash
npx prisma generate
npx prisma migrate deploy
```

### 5.7 (Optionnel) Peupler la base de données avec des données initiales
Si tu as un script seed :
```bash
npx prisma db seed
```

### 5.8 Construire l'application
```bash
npm run build
```
Cette étape peut prendre quelques minutes.

---

## ÉTAPE 6 : Installation et configuration de PM2

PM2 va garder ton application en ligne 24/7 et la redémarrer automatiquement si elle plante.

### 6.1 Installer PM2 globalement
```bash
sudo npm install -g pm2
```

### 6.2 Créer le fichier de configuration PM2
```bash
nano ecosystem.config.js
```

### 6.3 Ajouter cette configuration
```javascript
module.exports = {
  apps: [
    {
      name: 'luxonera',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/luxonera',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
```
Sauvegarde avec `Ctrl+O`, `Entrée`, puis `Ctrl+X`.

### 6.4 Démarrer l'application avec PM2
```bash
pm2 start ecosystem.config.js
```

### 6.5 Vérifier que l'application fonctionne
```bash
pm2 status
pm2 logs luxonera
```

### 6.6 Configurer PM2 pour démarrer au boot du serveur
```bash
pm2 startup
```
Exécute la commande affichée (elle commence par `sudo`).

```bash
pm2 save
```

---

## ÉTAPE 7 : Installation et configuration de Nginx

Nginx servira de reverse proxy et gérera le SSL.

### 7.1 Installer Nginx
```bash
sudo apt install -y nginx
```

### 7.2 Créer la configuration du site
```bash
sudo nano /etc/nginx/sites-available/luxonera
```

### 7.3 Ajouter cette configuration

**Si tu as un nom de domaine :**
```nginx
server {
    listen 80;
    server_name tondomaine.com www.tondomaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
```

**Si tu n'as PAS de nom de domaine (accès par IP) :**
```nginx
server {
    listen 80;
    server_name VOTRE_IP_VPS;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Remplace `tondomaine.com` ou `VOTRE_IP_VPS` par tes valeurs.

Sauvegarde avec `Ctrl+O`, `Entrée`, puis `Ctrl+X`.

### 7.4 Activer le site
```bash
sudo ln -s /etc/nginx/sites-available/luxonera /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
```

### 7.5 Tester et redémarrer Nginx
```bash
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 7.6 Tester l'accès
Ouvre ton navigateur et va sur `http://tondomaine.com` ou `http://VOTRE_IP_VPS`.

---

## ÉTAPE 8 : Configuration SSL avec Let's Encrypt (HTTPS)

**Requis : un nom de domaine pointant vers ton VPS**

### 8.1 Installer Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 8.2 Obtenir le certificat SSL
```bash
sudo certbot --nginx -d tondomaine.com -d www.tondomaine.com
```
- Entre ton email
- Accepte les conditions
- Choisis de rediriger HTTP vers HTTPS (option 2)

### 8.3 Vérifier le renouvellement automatique
```bash
sudo certbot renew --dry-run
```

---

## ÉTAPE 9 : Configuration du pare-feu

### 9.1 Configurer UFW
```bash
sudo apt install -y ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 9.2 Vérifier le statut
```bash
sudo ufw status
```

---

## ÉTAPE 10 : Commandes utiles pour la maintenance

### Voir les logs de l'application
```bash
pm2 logs luxonera
```

### Redémarrer l'application
```bash
pm2 restart luxonera
```

### Arrêter l'application
```bash
pm2 stop luxonera
```

### Voir l'état des processus
```bash
pm2 status
```

### Mettre à jour l'application
```bash
cd /var/www/luxonera
git pull origin main                  # Si tu utilises Git
npm install                           # Si nouvelles dépendances
npx prisma migrate deploy             # Si nouvelles migrations
npm run build                         # Reconstruire
pm2 restart luxonera                  # Redémarrer
```

### Voir l'utilisation des ressources
```bash
pm2 monit
```

### Voir les logs Nginx
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Redémarrer les services
```bash
sudo systemctl restart nginx
sudo systemctl restart postgresql
pm2 restart all
```

---

## Résolution des problèmes courants

### Erreur "EACCES permission denied"
```bash
sudo chown -R luxonera:luxonera /var/www/luxonera
```

### L'application ne démarre pas
```bash
pm2 logs luxonera --lines 50
```
Regarde les erreurs affichées.

### Erreur de connexion à la base de données
Vérifie que PostgreSQL fonctionne :
```bash
sudo systemctl status postgresql
```
Vérifie ton `DATABASE_URL` dans `.env.local`.

### Erreur 502 Bad Gateway
L'application n'est pas démarrée ou a planté :
```bash
pm2 status
pm2 restart luxonera
```

### Erreur de mémoire (OOM)
Avec 4 Go de RAM, tu devrais être tranquille. Mais si besoin, ajoute du swap :
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## Checklist finale

- [ ] VPS accessible en SSH
- [ ] Node.js 20 installé
- [ ] PostgreSQL installé et configuré
- [ ] Base de données créée
- [ ] Code source transféré
- [ ] Fichier .env.local configuré
- [ ] Dépendances installées (`npm install`)
- [ ] Migrations appliquées (`npx prisma migrate deploy`)
- [ ] Application construite (`npm run build`)
- [ ] PM2 configuré et application démarrée
- [ ] Nginx configuré comme reverse proxy
- [ ] SSL configuré (si domaine)
- [ ] Pare-feu configuré
- [ ] Site accessible via navigateur

---

## Architecture finale

```
Internet
    │
    ▼
┌─────────────────┐
│     Nginx       │  ← Port 80/443 (HTTP/HTTPS)
│  (Reverse Proxy)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Next.js App   │  ← Port 3000 (interne)
│   (via PM2)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │  ← Port 5432 (interne)
│   (Database)    │
└─────────────────┘
```

---

## Support

Si tu rencontres des problèmes :
1. Vérifie les logs : `pm2 logs luxonera`
2. Vérifie Nginx : `sudo nginx -t`
3. Vérifie PostgreSQL : `sudo systemctl status postgresql`

Bonne chance avec ton déploiement !
