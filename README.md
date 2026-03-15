# CampFriend

CampFriend est une application web full-stack locale pour rencontrer des amis au camping. Elle inclut les swipes, les matchs et le chat en temps reel.

## Stack technique

- Frontend: React (Vite), Tailwind CSS, React Router, Framer Motion
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, Socket.io

## Prerequis (macOS)

- Node.js 18+
- MongoDB Community Server installe localement

Si MongoDB n'est pas installe, via Homebrew:

```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
```

Demarrer MongoDB:

```bash
brew services start mongodb/brew/mongodb-community@7.0
```

## Installation

### 1) Serveur

```bash
cd /Users/lucas.lvnnt/Library/CloudStorage/OneDrive-Personnel/site/Campsfriends2/server
cp .env.example .env
npm install
npm run dev
```

### 2) Client

Ouvre un second terminal:

```bash
cd /Users/lucas.lvnnt/Library/CloudStorage/OneDrive-Personnel/site/Campsfriends2/client
cp .env.example .env
npm install
npm run dev
```

- Client: http://localhost:5173
- Serveur: http://localhost:5000

## Acces admin

Pour rendre un compte admin, definis `ADMIN_EMAIL` dans `server/.env` avec l'email utilise a l'inscription.

## Notes

- L'app tourne 100% en local: MongoDB sur `127.0.0.1`, serveur sur `localhost:5000`, client sur `localhost:5173`.
- Pour tester un match, ouvre deux sessions navigateur et cree deux comptes.
- La liste des campings par enseigne est generee depuis les listes officielles des enseignes (Capfun, Yelloh! Village, Sandaya, Huttopia, Tohapi, Siblu, Flower Campings) et stockee dans `client/src/data/campings-fr.js`.
