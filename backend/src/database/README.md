# Base de données et migrations

Anibook utilise SQLite avec le fichier `backend/database.sqlite`. Le chemin est construit depuis le code du backend, donc il reste stable même si la commande est lancée depuis la racine ou depuis `backend`.

## Schéma

Le schéma contient quatre tables principales :

- `universes` : univers disponibles.
- `tags` : tags réutilisables.
- `characters` : personnages, chacun rattaché à un univers.
- `character_tags` : table d’association entre personnages et tags.

Les contraintes importantes sont :

- Le nom d’un univers est unique.
- Le nom d’un tag est unique.
- Un personnage doit avoir un univers existant.
- Une association personnage/tag ne peut apparaître qu’une seule fois.
- La suppression d’un personnage supprime ses associations.
- La suppression d’un univers utilisé par un personnage est refusée.

## Migrations disponibles

Les fichiers sont exécutés dans l’ordre alphabétique et enregistrés dans la table `migrations` :

| Migration | Rôle |
| --- | --- |
| `001_initial_schema.sql` | Crée les tables de base. |
| `002_repair_character_schema.sql` | Garantit la présence des tables tags, personnages et associations pour les bases initialisées avec une ancienne version du runner. |

Le runner utilise `CREATE TABLE IF NOT EXISTS`, ce qui permet de relancer le serveur sans recréer les tables existantes.

## Démarrage

Les migrations sont lancées automatiquement avant `app.listen` :

```powershell
npm --prefix .\backend start
```

Un message similaire à celui-ci apparaît dans le terminal :

```text
Migrations terminées.
API Anibook démarrée sur http://localhost:3000
```

## Ajouter une migration

1. Créer un nouveau fichier SQL dans `backend/src/database/migrations`.
2. Utiliser un préfixe numérique suivant l’ordre courant, par exemple `003_add_favorite_column.sql`.
3. Rédiger une migration rejouable avec `IF NOT EXISTS` lorsque c’est possible.
4. Démarrer le backend pour l’exécuter.
5. Vérifier les tables et les endpoints concernés.
6. Ne pas modifier une migration déjà exécutée sur une base partagée ; ajouter une nouvelle migration corrective.

Exemple :

```sql
ALTER TABLE characters
ADD COLUMN favorite INTEGER NOT NULL DEFAULT 0;
```

Pour une modification non rejouable, vérifier d’abord l’état du schéma afin d’éviter une erreur au redémarrage.

## Bonnes pratiques

- Ne pas committer de données de test dans `database.sqlite`.
- Sauvegarder le fichier SQLite avant une migration destructive.
- Préférer les paramètres SQL (`?`) dans les repositories plutôt que de concaténer des valeurs utilisateur.
- Garder la logique métier dans les services et les requêtes SQLite dans les repositories.
- Tester au minimum les endpoints touchés après chaque migration.

## Réinitialiser une base locale

Cette opération supprime les données locales. À utiliser uniquement en développement après sauvegarde si nécessaire :

```powershell
Remove-Item .\backend\database.sqlite
npm --prefix .\backend start
```

Le backend recréera une base propre et exécutera toutes les migrations disponibles.
