# Anibook

Anibook est une application web de consultation et de gestion de personnages issus de différents univers. Le projet est volontairement simple à lancer : le frontend est composé de pages HTML/CSS/JavaScript vanilla et le backend expose une API REST Node.js/Express connectée à SQLite.

## Fonctionnalités

- Consulter le catalogue des personnages.
- Rechercher un personnage par son nom.
- Filtrer le catalogue par univers.
- Afficher un personnage choisi aléatoirement.
- Jouer au quiz disponible dans l’interface.
- Administrer les personnages, les univers et les tags.
- Associer plusieurs tags existants à un personnage grâce à une recherche dans l’administration.
- Vérifier l’état de l’API depuis la page d’accueil.

## Architecture

```text
Anibook/
├── backend/
│   ├── src/
│   │   ├── characters/       # Personnages et API associée
│   │   ├── universes/         # Univers
│   │   ├── tags/              # Tags
│   │   ├── character-tags/    # Associations personnages/tags
│   │   ├── database/          # Migrations SQLite
│   │   └── main.js            # Démarrage de l’API
│   └── database.sqlite        # Base locale créée/utilisée par le backend
├── frontend/
│   ├── css/style.css          # Styles globaux
│   ├── js/main.js             # Logique des pages
│   └── *.html                 # Pages de l’application
├── docker-compose.yml          # Lance frontend + backend + volume SQLite
├── AGENTS.md                   # Contexte et tâches pour un agent de code
└── README.md
```

## Prérequis

- Node.js récent, avec npm.
- Un navigateur moderne.
- Un serveur HTTP local pour servir le frontend. Ouvrir directement les fichiers HTML peut fonctionner, mais un serveur local évite les restrictions du navigateur.

## Installation

Depuis la racine du projet :

```powershell
npm --prefix .\backend install
```

Le frontend n’a pas de dépendances npm.

## Démarrage

### Backend

```powershell
npm --prefix .\backend start
```

L’API démarre sur `http://localhost:3000`. Pour le développement avec redémarrage automatique :

```powershell
npm --prefix .\backend run dev
```

### Frontend

Avec Python installé :

```powershell
python -m http.server 5500 --directory .\frontend
```

Puis ouvrir `http://localhost:5500`. Une extension de serveur statique VS Code peut également être utilisée.

Le frontend appelle actuellement l’API à l’adresse `http://localhost:3000/api`, définie dans [frontend/js/main.js](frontend/js/main.js).

### Avec Docker ou CasaOS

Docker permet de lancer le backend et le frontend ensemble. Le frontend utilise automatiquement `/api` en production et Nginx transmet les appels au backend. Cela permet d’ouvrir Anibook depuis un autre ordinateur ou un téléphone sans que le navigateur cherche l’API sur son propre `localhost` :

```powershell
docker-compose up --build
```

Adresses :

- Frontend local : `http://localhost:8081`
- Frontend depuis un autre appareil : `http://ADRESSE_IP_DU_SERVEUR:8081`
- API de contrôle : `http://ADRESSE_IP_DU_SERVEUR:3000/api/health`

#### Installation dans CasaOS

1. Copier le projet sur le serveur CasaOS, par exemple dans `/DATA/AppData/anibook`.
2. Ouvrir **CasaOS > App Store > Docker Compose** ou l’outil d’installation d’une application personnalisée.
3. Utiliser le contenu de [docker-compose.yml](docker-compose.yml).
4. Construire et démarrer l’application.
5. Ouvrir le port `8081` dans le réseau local et utiliser l’adresse IP du serveur CasaOS.

Exemple : si CasaOS possède l’adresse `192.168.1.50`, ouvrir `http://192.168.1.50:8081`.

Pour un accès depuis Internet, ne pas exposer directement SQLite ou le port backend sans protection. Utiliser de préférence un reverse proxy HTTPS, une authentification et un pare-feu.

La base SQLite est conservée dans le volume Docker `anibook-data`. Pour arrêter les conteneurs :

```powershell
docker compose down
```

Pour supprimer aussi les données SQLite locales du volume :

```powershell
docker compose down -v
```

## Contexte pour un agent de code

Le fichier [AGENTS.md](AGENTS.md) contient l’architecture, les règles de modification, les commandes de vérification et une liste de tâches priorisées. Il peut servir de contexte de départ à un petit modèle chargé de continuer le projet.

## Documentation détaillée

- [Guide frontend](frontend/README.md)
- [Guide backend et API](backend/README.md)
- [Base de données et migrations](backend/src/database/README.md)

## Vérification rapide

Quand le backend est lancé, cette URL doit renvoyer `{"status":"OK"}` :

```text
http://localhost:3000/api/health
```

Si la page frontend affiche l’API comme indisponible, vérifier que le backend tourne bien sur le port `3000` et que le frontend est servi depuis une URL HTTP.