# Ecommerce App

Applicazione ecommerce full stack MERN con frontend React/Vite e backend Express.
Permette di navigare il catalogo prodotti, gestire il carrello, autenticarsi,
completare il checkout, consultare gli ordini utente e amministrare ordini,
prodotti e utenti da una dashboard admin protetta.

## Screenshot

![Home](./screenshot/home.png)
![Carrello](./screenshot/cart.png)
![Ordini](./screenshot/orders.png)

## Descrizione Del Progetto

Il progetto è composto da:

- un frontend React con Vite pubblicabile su Vercel
- un backend Node.js + Express pubblicabile su Render
- un database MongoDB Atlas per utenti, prodotti e ordini
- una dashboard admin responsive protetta da JWT e role based auth

## Tecnologie Usate

- Frontend: React, Vite, React Router, Tailwind CSS, Axios, Recharts
- Backend: Node.js, Express, Mongoose, JSON Web Token
- Database: MongoDB Atlas
- Deploy: Vercel per il frontend, Render per il backend

## Link Progetto

- Frontend: `mouhamed-market.vercel.app`
- Backend: `https://mouha-market-api.onrender.com`

Sostituisci questi due link con gli URL reali dopo il deploy.

## Struttura Progetto

```text
ecommerce-app/
  client/
    src/
      components/
      components/admin/
      pages/
      pages/admin/
      services/
  server/
    controllers/
    middleware/
    models/
    routes/
  render.yaml
```

## Funzionalità

- Catalogo prodotti
- Dettaglio prodotto
- Carrello con badge quantità
- Registrazione e login
- Checkout protetto
- Pagina "I miei ordini"
- Dashboard admin protetta
- Gestione ordini con search, filtro status e pagination
- Creazione manuale ordini da admin
- Gestione prodotti con add, edit e delete
- Vista utenti con statistiche ordini e spesa totale
- Revenue chart e widget ordini recenti
- Loading state, toast notification, empty state e confirmation modal
- Seed prodotti realistici

## Role Based Auth

Il model `User` include il campo `role`:

```js
role: "user" | "admin"
```

Il valore di default è `user`. Le API admin sono protette da:

- JWT tramite `server/middleware/auth.js`
- controllo ruolo tramite `server/middleware/isAdmin.js`

Per compatibilità con dati già presenti, il backend considera admin anche gli
utenti legacy con `isAdmin: true`, anche se non hanno ancora il campo `role`.

### Promuovere Un Utente Ad Admin

Dopo aver creato un account dall'app, puoi promuoverlo da MongoDB Atlas:

```js
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin", isAdmin: true } }
)
```

Se il documento contiene già `isAdmin: true`, puoi aggiungere solo il campo
`role: "admin"` per allinearlo al nuovo schema. Poi effettua di nuovo il login.
Gli admin vengono indirizzati alla dashboard `/admin` e vedono anche il link
Admin nella navbar.

## Admin Dashboard

Route frontend disponibili:

- `/admin`
- `/admin/orders`
- `/admin/products`
- `/admin/users`

La dashboard mostra:

- Total Orders
- Total Revenue
- Total Products
- Pending Orders
- Revenue chart
- Recent orders widget

Le pagine admin includono layout responsive con sidebar desktop, menu mobile,
toast notifications, loading spinner, empty states e confirmation modal per le
eliminazioni.

## Endpoint Principali Backend

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Products Pubblici

- `GET /api/products`
- `GET /api/products/:id`

### Orders Utente

- `POST /api/orders`
- `GET /api/orders/my-orders`

### Admin

- `GET /api/admin/stats`
- `GET /api/admin/orders`
- `POST /api/admin/orders`
- `PUT /api/admin/orders/:id`
- `DELETE /api/admin/orders/:id`
- `GET /api/admin/products`
- `POST /api/admin/products`
- `PUT /api/admin/products/:id`
- `DELETE /api/admin/products/:id`
- `GET /api/admin/users`

Tutte le route `/api/admin/*` richiedono token JWT valido e ruolo admin.

## Avvio Locale

### 1. Backend

```bash
cd server
npm install
npm run dev
```

Variabili richieste in `server/.env`:

```env
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=replace-with-a-long-random-secret
```

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

Variabile opzionale in `client/.env`:

```env
VITE_API_URL=http://localhost:3000
```

Il client aggiunge automaticamente `/api` alla base URL.

## Seed Prodotti

Per caricare il catalogo iniziale:

```bash
cd server
npm run seed:products
```

## Build Produzione

### Frontend

```bash
cd client
npm run build
```

### Backend

```bash
cd server
npm start
```

## Deploy Backend Su Render

### Opzione A: Deploy Manuale

1. Vai su Render e crea un nuovo `Web Service`
2. Collega il repository GitHub
3. Imposta:
   - Root Directory: `server`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Aggiungi le env vars:
   - `MONGODB_URI`
   - `JWT_SECRET`
5. Deploy

### Opzione B: Blueprint Con `render.yaml`

Nel repo è già presente `render.yaml` alla root. Puoi usare `New > Blueprint`
su Render e collegare il repository.

## Deploy Frontend Su Vercel

1. Vai su Vercel e importa il repository GitHub
2. Imposta:
   - Root Directory: `client`
   - Framework Preset: `Vite`
3. Aggiungi la env var:

```env
VITE_API_URL=https://TUO-BACKEND.onrender.com
```

4. Deploy

Note:

- il file `client/vercel.json` è già configurato per fare fallback a `index.html`
- questo evita errori `404` quando aggiorni una route come `/cart`, `/my-orders` o `/admin`

## Pubblicazione Su GitHub

Se il progetto non è ancora in git:

```bash
git init
git add .
git commit -m "Initial ecommerce app"
```

Poi crea un repository su GitHub e collega il remote:

```bash
git remote add origin https://github.com/TUO-USERNAME/TUO-REPO.git
git branch -M main
git push -u origin main
```

Importante:

- non pubblicare mai i file reali `server/.env` e `client/.env`
- usa solo file `.env.example` o variabili configurate nel provider di deploy
- se hai già condiviso credenziali reali, ruotale prima di rendere il repo pubblico

## Note Finali

- Il frontend usa `VITE_API_URL` per cambiare backend tra locale e produzione
- Il backend legge `PORT` da Render automaticamente
- Il checkout ricalcola totale e disponibilità lato server
- La sicurezza admin viene verificata sia lato frontend sia lato backend; il backend resta la fonte di verità
