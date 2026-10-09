# TutoAngularDsfr

Calcul de la prime de transport d'un collaborateur sur un trimestre.
Voir la [documentation fonctionnelle](docs/documentation-fonctionnelle.md) pour
le détail des écrans et des règles de gestion.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.0.

## Installation

### Prérequis

- **Node.js 24** (LTS), dont la version exacte est fixée dans [`.nvmrc`](.nvmrc).
  Angular 22 exige Node `^22.22.3 || ^24.15.0 || >=26`, mais `@edugouvfr/ngx-dsfr`
  ne prend pas encore en charge Node 26 : Node 24 est la version compatible avec
  les deux.
- **npm 11**, fourni avec Node 24.
- [nvm](https://github.com/nvm-sh/nvm), conseillé pour installer et changer de
  version de Node.

### Étapes

1. Installer et activer la version de Node du projet (lue dans `.nvmrc`) :

   ```bash
   nvm install
   nvm use
   ```

2. Installer les dépendances, à l'identique de `package-lock.json` :

   ```bash
   npm ci
   ```

3. Lancer l'application, puis ouvrir `http://localhost:4200/` :

   ```bash
   npm start
   ```

La CLI Angular n'a pas besoin d'être installée globalement : `npx ng <commande>`
utilise celle du projet. Les commandes `ng` ci-dessous peuvent s'écrire ainsi.

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
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

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
