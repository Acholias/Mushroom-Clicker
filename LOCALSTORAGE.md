# Système de LocalStorage - Mushroom Clicker

## Fonctionnement

### Page d'accueil (welcome.html)
- Le joueur entre son nom (max 20 caractères)
- Le joueur choisit sa difficulté :
  - 🌱 **Facile** : Tous les bonus activés, coûts x1
  - ⚡ **Difficile** : Gold mushroom uniquement, coûts x2.5
  - 🔥 **Extrême** : Roue de fortune uniquement, coûts x5
  - 💀 **Cauchemar** : Aucun bonus, coûts x10

### Données stockées dans localStorage
- `mushroomPlayerName` : Nom du joueur
- `mushroomDifficulty` : Difficulté choisie ('facile', 'difficile', 'extreme', 'cauchemar')

### Page de jeu (mushroom.html)
- Récupère automatiquement le nom et la difficulté depuis le localStorage
- Applique les paramètres de difficulté (coûts, apparition des bonus)
- Affiche le nom du joueur dans les stats et le leaderboard

## Utilisation

1. **Démarrer** : Ouvrir `welcome.html`
2. **Entrer son nom** et choisir la difficulté
3. **Cliquer sur "Commencer l'aventure"**
4. Le jeu démarre avec les paramètres choisis

## Fichiers

- `welcome.html` : Page d'accueil
- `welcome.js` : Gestion du localStorage
- `script.js` : Lecture des données au démarrage du jeu
