# nx-typeorm-plugin
![License](https://img.shields.io/github/license/jujulego/nx-typeorm-plugin)
[![Version](https://img.shields.io/npm/v/@jujulego/nx-typeorm-plugin)](https://www.npmjs.com/package/@jujulego/nx-typeorm-plugin)

Plugin for [Nx](https://nx.dev) mono-repositories. Helps to use [Typeorm](https://www.npmjs.com/package/typeorm) inside an app.

## Setup
Before using this plugin you must setup Typeorm with an `ormconfig.json` file at the root of your app.

All you need to use this plugin is to install it:
- `npm install --save-dev @jujulego/nx-typeorm-plugin`
- `yarn add --dev @jujulego/nx-typeorm-plugin`

## Generators
### migration
It will generate a new migration.

Use: `nx g @jujulego/nx-typeorm-plugin:migration`

#### Options
| name     | default            | description
|----------|--------------------|------------------------
| name     | __required__       | Name of the migration to generate
| project  | nx default project | Nx project where the migration should be generated
| database | `default`          | Database connection to use (as in the `ormconfig.json`)

## Executors
### db-create
It will create the database inside your database server.

Add the target _db-create_ to your project's config in your `workspace.json`:
```json
{
  "projects": {
    "example": {
      "targets": {
        "db-create": {
          "executor": "@jujulego/nx-typeorm-plugin:db-create"
        }
      }
    }
  }
}
```

__Warning only `postgresql` and `mysql` databases are supported.__

#### Options
| name     | default   | description
|----------|-----------|------------------------
| database | `default` | Database connection to use (as in the `ormconfig.json`)

### db-migrate
It will apply typeorm migrations to a database.

Add the target _db-migrate_ to your project's config in your `workspace.json`:
```json
{
  "projects": {
    "example": {
      "targets": {
        "db-migrate": {
          "executor": "@jujulego/nx-typeorm-plugin:db-migrate"
        }
      }
    }
  }
}
```

#### Options
| name     | default   | description
|----------|-----------|------------------------
| database | `default` | Database connection to use (as in the `ormconfig.json`)

## Running unit tests

Run `nx test nx-typeorm-plugin` to execute the unit tests via [Jest](https://jestjs.io).
