# CarHandlerPwa

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.10.

## ⚠️ Configurazione Iniziale Obbligatoria

**PRIMA DI AVVIARE L'APP**, devi configurare le credenziali Firebase:

1. Copia il file di esempio:
   ```bash
   cp .env.example .env
   ```

2. Modifica il file `.env` e inserisci le tue credenziali Firebase reali

3. Genera i file environment:
   ```bash
   node generate-env.js
   ```

**IMPORTANTE**: Il file `.env` e i file in `src/environments/` contengono credenziali sensibili e NON vengono tracciati da Git. Consulta [SECURITY.md](SECURITY.md) per maggiori dettagli sulla sicurezza.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
npm run build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

### Environment Variables for Production

Before deploying to production, you need to set the following environment variables:

```bash
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id
```

The build process will automatically run `generate-env.js` to create the environment files with these values.

### Deployment

When deploying to platforms like GitHub Pages, Netlify, or Vercel, make sure to:
1. Set the environment variables in your deployment platform's settings
2. Run the build command: `npm run build`
3. Deploy the contents of the `dist/car-handler-pwa/browser` directory

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
