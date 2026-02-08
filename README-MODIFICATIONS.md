# Legio Invicta - Modifications apportées

## Résumé des modifications

Voici toutes les améliorations apportées à votre site web Legio Invicta :

### 1. ✅ Nom de joueur modifiable (en haut à gauche)

**Fonctionnalités :**
- Chaque joueur a un ID unique caché généré automatiquement
- Le nom du joueur est affiché en haut à gauche dans la barre d'authentification
- **Cliquer sur le nom** permet de le modifier
- Le nom est sauvegardé dans un cookie (persiste entre les sessions)
- Plusieurs joueurs peuvent avoir le même nom (seul l'ID est unique)

**Comment ça marche :**
- L'ID est généré au format : `player_[timestamp]_[random]`
- Le nom par défaut est "Player"
- Cliquez sur le nom → modifiez → appuyez sur Entrée ou cliquez ailleurs pour sauvegarder

### 2. ✅ Dernière modification du panneau d'affichage

**Fonctionnalités :**
- Quand quelqu'un modifie le panneau d'affichage (ajoute/modifie/déplace une note)
- Le système affiche "Last modified: [Nom du joueur] (il y a X temps)"
- Visible dans les paramètres du panneau d'affichage

**Où le voir :**
- En haut à droite du panneau d'affichage
- Affiche le nom du joueur et quand la modification a eu lieu

### 3. ✅ Chat et panneau masqués dans les sections événements

**Fonctionnalités :**
- Quand vous allez dans une section événement (Horizon, Samurai, Nomad, etc.)
- Le chat et le panneau d'affichage sont automatiquement masqués
- Ils réapparaissent quand vous retournez au menu principal

**Sections où c'est actif :**
- Beyond the Horizon
- Outer Realms
- Nomad Invasion
- Samurai Invasion
- Berimond

**Sections où c'est visible :**
- Menu principal
- Alliance Chat
- Edit Board
- Event Calendar
- Alliance Rules

### 4. ✅ Logo cliquable pour retourner au menu

**Fonctionnalités :**
- Le logo "Legio Invicta" en haut de page est maintenant cliquable
- Cliquer dessus renvoie directement au menu principal
- Effet visuel au survol (agrandissement et glow)

### 5. ✅ Event Calendar remplacé par un lien

**Fonctionnalités :**
- L'Event Calendar ne tente plus de charger les données (ce qui ne fonctionnait pas)
- À la place, affiche une page simple avec un lien direct vers le calendrier officiel
- Le lien ouvre le site officiel de Goodgame Empire dans un nouvel onglet

**URL du calendrier :**
- https://communityhub.goodgamestudios.com/empire/event-plan/

### 6. ✅ Système d'images optionnelles pour tous les éléments

**Fonctionnalités :**
- Le système détecte automatiquement si une image existe
- Si l'image existe → elle est affichée
- Si l'image n'existe pas → la couleur CSS de base est utilisée

**Images déjà présentes (ne pas toucher) :**
- `img/samurai-banner.png` ✓
- `img/horizon-banner.png` ✓
- `img/legion-logo.png` ✓
- `img/outer-realms-banner.png` ✓
- `img/berimond-banner.png` ✓

**Nouvelles images optionnelles que vous pouvez ajouter :**
- `img/bouton-retour.png` - Bouton "Back to Menu"
- `img/nomad-button.png` - Bouton Nomad Invasion
- `img/nomad-banner.png` - Bannière Nomad event
- `img/calendar-button.png` - Bouton Event Calendar
- `img/rules-button.png` - Bouton Alliance Rules
- `img/board-button.png` - Bouton Edit Board
- `img/chat-button.png` - Bouton Alliance Chat
- `img/horizon-button.png` - Bouton Beyond the Horizon
- `img/samurai-button.png` - Bouton Samurai
- `img/outer-realms-button.png` - Bouton Outer Realms
- `img/berimond-button.png` - Bouton Berimond

**Couleurs de fallback (si pas d'image) :**
- Nomad : Dégradé marron (#8b4513 → #654321)
- Calendar : Dégradé rouge foncé
- Rules : Dégradé or vers rouge
- Board : Dégradé vert foncé
- Chat : Dégradé bleu foncé
- Back button : Dégradé or

## Installation

1. Remplacez vos fichiers existants par les nouveaux :
   - `index.html`
   - `script.js`
   - `firebase-app.js`
   - `styles.css`

2. Les images existantes fonctionnent déjà

3. (Optionnel) Ajoutez de nouvelles images dans le dossier `img/` selon vos besoins

## Structure des fichiers

```
votre-site/
├── index.html          (modifié)
├── script.js           (modifié)
├── firebase-app.js     (modifié)
├── styles.css          (modifié)
└── img/
    ├── legion-logo.png          ✓ existant
    ├── horizon-banner.png       ✓ existant
    ├── samurai-banner.png       ✓ existant
    ├── outer-realms-banner.png  ✓ existant
    ├── berimond-banner.png      ✓ existant
    ├── bouton-retour.png        (optionnel)
    ├── nomad-banner.png         (optionnel)
    ├── nomad-button.png         (optionnel)
    ├── calendar-button.png      (optionnel)
    ├── rules-button.png         (optionnel)
    ├── board-button.png         (optionnel)
    ├── chat-button.png          (optionnel)
    ├── horizon-button.png       (optionnel)
    ├── samurai-button.png       (optionnel)
    ├── outer-realms-button.png  (optionnel)
    └── berimond-button.png      (optionnel)
```

## Détails techniques

### Cookies utilisés
- `playerId` : ID unique du joueur (365 jours)
- `playerName` : Nom du joueur (365 jours)

### Firebase Database Structure
```
bulletinBoard/
├── notes/
│   └── [noteId]/
│       ├── title
│       ├── content
│       ├── x, y
│       ├── color
│       ├── background
│       └── updatedAt
└── meta/
    ├── lastModifiedBy (nom du joueur)
    └── lastModifiedAt (timestamp)

chat/
└── messages/
    └── [messageId]/
        ├── text
        ├── author (nom du joueur)
        ├── userId
        └── timestamp
```

## Notes importantes

1. **Compatibilité** : Toutes les fonctionnalités existantes sont préservées
2. **Firebase** : Les configurations Firebase restent inchangées
3. **Responsive** : Tout fonctionne sur mobile et desktop
4. **Performance** : Pas d'impact négatif sur les performances

## Support

Pour toute question :
- Vérifiez que tous les fichiers sont correctement uploadés
- Vérifiez la console du navigateur pour les erreurs
- Assurez-vous que Firebase est correctement configuré

Bon jeu ! ⚔️
