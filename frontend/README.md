# Frontend Anibook

Le frontend d’Anibook est une interface statique en HTML5, CSS3 et JavaScript vanilla. Il ne possède pas de compilation ni de dépendances npm : les pages utilisent directement `css/style.css` et `js/main.js`.

## Pages

| Page | Rôle |
| --- | --- |
| `index.html` | Accueil, statistiques et état de l’API. |
| `characters.html` | Catalogue des personnages avec recherche et filtre par univers. |
| `random.html` | Affichage d’un personnage choisi aléatoirement. |
| `quiz.html` | Quiz interactif à partir des données disponibles. |
| `admin.html` | Création, modification et suppression des personnages, univers et tags. |

## Lancer le frontend

Le backend doit être lancé avant d’ouvrir les pages, car l’interface récupère ses données avec `fetch`.

Depuis la racine du projet, avec Python :

```powershell
python -m http.server 5500 --directory .\frontend
```

Ouvrir ensuite :

```text
http://localhost:5500
```

Une extension VS Code de type serveur statique peut aussi servir le dossier `frontend`.

## Configuration de l’API

L’adresse est définie au début de [js/main.js](js/main.js). En développement local, le frontend utilise l’API sur le port `3000`; dans Docker, il utilise le chemin relatif `/api` :

```javascript
const API_URL = isLocalStaticServer
    ? 'http://localhost:3000/api'
    : '/api';
```

Si l’API utilise un autre port, adapter le bloc de configuration avant de charger les pages.

## Fonctionnement de l’administration

### Personnages

Le formulaire demande un nom et un univers. L’image et la description sont facultatives. Le champ des tags permet de :

1. Rechercher parmi les tags déjà récupérés depuis l’API.
2. Afficher au maximum cinq correspondances.
3. Sélectionner plusieurs tags.
4. Retirer un tag sélectionné avec le bouton `x` de sa pastille.

Lors de la création, le personnage est d’abord envoyé à `POST /api/characters`, puis chaque tag sélectionné est associé avec `POST /api/characters/:characterId/tags/:tagId`.

Les nouveaux tags doivent être créés depuis la section **Tags** de l’administration avant de pouvoir être sélectionnés dans le formulaire d’un personnage.

Lors de la modification d’un personnage, le formulaire modifie actuellement ses informations principales ; la gestion détaillée de ses associations de tags n’est pas encore proposée dans ce parcours.

### Univers et tags

Les univers et les tags sont administrables séparément. Après une création, modification ou suppression, les tableaux sont rechargés depuis l’API.

## Structure frontend

```text
frontend/
├── admin.html       # Gestion des données
```powershell
├── index.html       # Accueil
├── quiz.html        # Quiz
├── random.html      # Personnage aléatoire
├── css/
│   └── style.css    # Variables, layout et composants visuels
└── js/
    └── main.js      # Chargement API, affichage et interactions
```

## Dépannage

- **API indisponible** : démarrer le backend avec `npm --prefix .\backend start`.
- **Les données ne se chargent pas** : vérifier `http://localhost:3000/api/health`.
- **Le navigateur bloque les requêtes** : servir `frontend` avec un serveur HTTP local au lieu d’ouvrir les fichiers avec `file://`.
- **Un univers n’apparaît pas** : le créer dans l’administration puis recharger la page.
- **Un tag n’apparaît pas dans la recherche** : le créer dans la section Tags puis recharger l’administration.
- **La page Random ne répond pas** : vérifier que le backend est reconstruit et que `GET /api/characters/random` répond correctement.

En Docker, le frontend utilise automatiquement `/api`. Le fichier [nginx.conf](nginx.conf) transmet cette URL au service `backend`, ce qui rend l’application accessible depuis une autre machine via l’adresse IP du serveur CasaOS.
