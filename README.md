# Terenick CRA

Application web de gestion de comptes rendus d'activite (CRA), composee d'un front React/Vite et d'une API NestJS.

Le projet permet de gerer les utilisateurs, clients, missions, comptes rendus d'activite, lignes de CRA, facturation et contact via formulaire.

## Sommaire

- [Stack technique](#stack-technique)
- [Structure du projet](#structure-du-projet)
- [Fonctionnalites principales](#fonctionnalites-principales)
- [Installation](#installation)
- [Lancement en local](#lancement-en-local)
- [Variables d'environnement](#variables-denvironnement)
- [Docker](#docker)
- [Scripts utiles](#scripts-utiles)

## Stack technique

### Frontend

- React
- Vite
- React Router
- Tailwind CSS / FlyonUI
- CSS modules et CSS classique
- FullCalendar
- Framer Motion

### Backend

- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- JWT
- Swagger
- Nodemailer
- reCAPTCHA

## Structure du projet

```txt
.
├── backend/        # API NestJS
├── terenick/       # Frontend React/Vite
└── .vscode/        # Configuration editeur
```

### Frontend

```txt
terenick/
├── public/         # Assets statiques
├── src/
│   ├── assets/     # Images et ressources importees
│   ├── components/ # Composants reutilisables
│   ├── pages/      # Pages de l'application
│   ├── utils/      # Helpers front
│   ├── App.jsx     # Routes principales
│   └── main.jsx    # Point d'entree React
```

### Backend

```txt
backend/
├── src/
│   ├── auth/
│   ├── users/
│   ├── providers/
│   ├── customers/
│   ├── assignments/
│   ├── activity-reports/
│   ├── activity-reports-lines/
│   ├── activity-reports-costs/
│   ├── mail/
│   └── migrations/
```

## Fonctionnalites principales

- Authentification avec JWT
- Inscription et connexion utilisateur
- Reinitialisation de mot de passe
- Gestion des clients
- Gestion des missions
- Creation et suivi des comptes rendus d'activite
- Gestion des lignes de CRA
- Interface specifique pour les clients
- Page de profil utilisateur
- Facturation / notes de frais
- Formulaire de contact avec protection reCAPTCHA
- Documentation Swagger cote backend en environnement non production

## Installation

Cloner le projet :

```bash
git clone <url-du-repo>
cd <nom-du-repo>
```

Installer le backend :

```bash
cd backend
npm install
```

Installer le frontend :

```bash
cd ../terenick
npm install
```

## Lancement en local

### 1. Lancer la base PostgreSQL

Le backend attend une base PostgreSQL accessible par defaut sur le port `5433`.

Avec Docker Compose :

```bash
cd backend
docker compose up postgres
```

### 2. Lancer le backend

```bash
cd backend
npm run start:dev
```

L'API est disponible par defaut sur :

```txt
http://localhost:3000
```

La documentation Swagger est disponible en developpement sur :

```txt
http://localhost:3000/api
```

### 3. Lancer le frontend

```bash
cd terenick
npm run dev
```

Le front est disponible par defaut sur :

```txt
http://localhost:5173
```

## Variables d'environnement

### Backend

Creer un fichier `.env` dans `backend/`.

Exemple :

```env
PORT=3000
NODE_ENV=development

DATABASE_HOST=localhost
DATABASE_PORT=5433
DATABASE_USER=your_database_user
DATABASE_PASSWORD=your_database_password
DATABASE_NAME=your_database_name

TYPEORM_SYNCHRONIZE=false

JWT_SECRET=your_jwt_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=your_email@example.com
CONTACT_EMAIL_TO=contact@example.com

RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
```

### Frontend

Creer un fichier `.env` dans `terenick/`.

Exemple :

```env
VITE_API_URL=http://localhost:3000
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

## Docker

Le projet contient un `docker-compose.yml` dans le dossier `backend`.

Pour lancer PostgreSQL, le backend et le frontend :

```bash
cd backend
docker compose up --build
```

Services exposes :

```txt
Frontend : http://localhost:5174
Backend  : http://localhost:3000
Postgres : localhost:5433
```

## Scripts utiles

### Frontend

Depuis `terenick/` :

```bash
npm run dev       # Lancer le serveur Vite
npm run build     # Generer le build de production
npm run preview   # Previsualiser le build
npm run lint      # Lancer ESLint
```

### Backend

Depuis `backend/` :

```bash
npm run start:dev          # Lancer l'API en mode watch
npm run build              # Compiler le projet
npm run start:prod         # Lancer la version compilee
npm run lint               # Lancer ESLint
npm run test               # Lancer les tests unitaires
npm run test:e2e           # Lancer les tests end-to-end
npm run test:cov           # Generer la couverture de tests
npm run migration:generate # Generer une migration TypeORM
npm run migration:run      # Executer les migrations
npm run migration:revert   # Annuler la derniere migration
```

## API principale

Le backend expose notamment les modules suivants :

- `/auth`
- `/users`
- `/customers`
- `/providers`
- `/assignments`
- `/activity-reports`
- `/activity-reports-lines`
- `/activity-reports-costs`
- `/mail`

## Notes

- Ne pas committer les fichiers `.env`.
- Remplacer toutes les valeurs sensibles avant un deploiement.
- En production, desactiver `TYPEORM_SYNCHRONIZE` et utiliser les migrations.
- La documentation Swagger est desactivee automatiquement si `NODE_ENV=production`.
