ObserveRTC Demo Application
---

## Clone

```bash
git clone https://github.com/ObserveRTC/demo-app.git
```

## Install and Build

1. Install the server 

```bash
cd server && yarn
```

2. Install the webapp

```bash
cd webapp && yarn
```

## Run

1. Start server

```bash
cd server

node dist/main.js
```

2. Start the webapp

```bash
cd webapp

yarn start
```

## Add your monitoring in the webapp

To see how for example you can use the client-monitor and develop something on top of it, 
you can open `webapp/src/components/Stats/MySandbox.tsx`.

## Access the observed samples at the server

To evaluate stats, see: `server/src/evaluators/`

To export reports to database see: `server/src/exports.ts`
