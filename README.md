ObserveRTC Demo Application
---

## Clone

```bash
git clone https://github.com/ObserveRTC/demo-app.git
```

## Install and Build

1. Install the observer

```bash
cd observer && yarn && tsc
```

2. Install the sfu

```bash
cd sfu && yarn && tsc
```

3. Install the webapp

```bash
cd webapp && yarn
```

## Run

1. Start observer

```bash
cd observer

node dist/main.js
```

2. Start sfu

```bash
cd sfu

node dist/main.js
```

3. Start the webapp

```bash
cd webapp

yarn start
```

