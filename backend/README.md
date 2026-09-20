# Backend Anibook

Le backend est une API REST Node.js basée sur Express 5 et SQLite. Il écoute par défaut sur le port `3000` et expose ses routes sous `/api`.

## Prérequis et installation

- Node.js récent.
- npm.

Depuis la racine du projet :

```powershell
npm --prefix .\backend install
```

Le fichier SQLite utilisé par l’application se trouve dans `backend/database.sqlite`. Il est créé automatiquement si nécessaire.

## Commandes

Depuis la racine :

```powershell
# Démarrage normal
npm --prefix .\backend start

# Développement avec redémarrage automatique
npm --prefix .\backend run dev
```

Depuis le dossier `backend` :

```powershell
npm start
npm run dev
```

Au démarrage, le serveur exécute les migrations SQL avant de commencer à écouter sur `http://localhost:3000`.

## Santé de l’API

```http
GET /api/health
```

Réponse :

```json
{
  "status": "OK"
}
```

## API des personnages

### Lister les personnages

```http
GET /api/characters?search=son&universeId=1&limit=50
```

Tous les paramètres sont facultatifs. Sans filtre, l’API renvoie les 50 personnages les plus récemment créés. `search` filtre le nom, `universeId` filtre l’univers et `limit` est limité à 50.

Réponse :

```json
{
  "characters": [
    {
      "id": 1,
      "name": "Naruto Uzumaki",
      "icon": null,
      "illustration": "https://example.com/naruto.jpg",
      "description": "...",
      "universe_id": 1,
      "universe": "Naruto"
    }
  ]
}
```

### Récupérer un personnage

```http
GET /api/characters/:id
```

### Créer un personnage

```http
POST /api/characters
Content-Type: application/json
```

Champs obligatoires : `name` et `universe_id` (le backend accepte aussi `universeId`). Les autres champs sont facultatifs.

```json
{
  "name": "Naruto Uzumaki",
  "universe_id": 1,
  "icon": null,
  "illustration": "https://example.com/naruto.jpg",
  "description": "Ninja de Konoha"
}
```

La réponse est `201 Created` et contient l’identifiant créé.

### Modifier un personnage

```http
PUT /api/characters/:id
Content-Type: application/json
```

Le corps reprend les champs de création. La réponse est `204 No Content`.

### Supprimer un personnage

```http
DELETE /api/characters/:id
```

La réponse est `204 No Content`. Les associations avec les tags sont supprimées automatiquement par SQLite.

La route `GET /api/characters/random` renvoie un personnage choisi aléatoirement. Elle renvoie `404` si aucun personnage n’existe.

## API des univers

| Méthode | Route | Résultat |
| --- | --- | --- |
| `GET` | `/api/universes` | Liste enveloppée dans `universes`. |
| `GET` | `/api/universes/:id` | Univers unique. |
| `POST` | `/api/universes` | Crée `{ "name": "..." }`. Réponse `201`. |
| `PUT` | `/api/universes/:id` | Modifie `{ "name": "..." }`. Réponse `204`. |
| `DELETE` | `/api/universes/:id` | Supprime l’univers s’il n’est pas utilisé. Réponse `204`. |

## API des tags

| Méthode | Route | Résultat |
| --- | --- | --- |
| `GET` | `/api/tags` | Liste enveloppée dans `tags`. |
| `GET` | `/api/tags/:id` | Tag unique. |
| `POST` | `/api/tags` | Crée `{ "name": "..." }`. Réponse `201`. |
| `PUT` | `/api/tags/:id` | Modifie `{ "name": "..." }`. Réponse `204`. |
| `DELETE` | `/api/tags/:id` | Supprime le tag. Réponse `204`. |

## API des associations personnage/tag

| Méthode | Route | Résultat |
| --- | --- | --- |
| `GET` | `/api/characters/:characterId/tags` | Liste enveloppée dans `tags`. |
| `POST` | `/api/characters/:characterId/tags/:tagId` | Ajoute une association. Réponse `204`. |
| `DELETE` | `/api/characters/:characterId/tags/:tagId` | Retire une association. Réponse `204`. |

Les associations sont uniques grâce à la clé primaire composée `character_id + tag_id`.

## Organisation du code

```text
backend/src/
├── main.js                         # Express, middlewares et démarrage
├── config/database.js              # Connexion SQLite
├── database/
│   ├── migrationRunner.js          # Exécution des migrations
│   └── migrations/                 # Schéma versionné
├── characters/                     # Controller, service, repository, DTO, routes
├── universes/                      # Controller, service, repository, DTO, routes
├── tags/                           # Controller, service, repository, DTO, routes
├── character-tags/                 # Gestion des associations
└── middlewares/                    # 404 et erreurs HTTP
```

Le flux classique est : route -> controller -> service -> repository -> SQLite. La validation des données d’entrée est faite dans les controllers et les DTO normalisent les noms de champs.

## Erreurs et dépannage

- `400` : identifiant ou champ obligatoire invalide.
- `404` : ressource introuvable.
- `500` : erreur interne, souvent liée à SQLite ou à une contrainte d’intégrité.
- `EADDRINUSE` : le port `3000` est déjà utilisé ; arrêter l’autre processus Node avant de relancer le backend.
- `no such table` : vérifier que le serveur a bien démarré depuis une version contenant les migrations présentes dans `src/database/migrations`.

Pour inspecter l’activité du backend, regarder les logs du terminal qui exécute `npm start`.
