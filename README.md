## GLPG CIAM

## Built with
- [Express](https://expressjs.com/)
- [Formik](https://jaredpalmer.com/formik/)
- [Jest](https://jestjs.io/)
- [Passport](http://passportjs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [React](https://reactjs.org/)
- [Redux](https://redux.js.org/)
- [Webpack](https://webpack.js.org/)

## Configuring environment variables

> Create a .env file and adjust your environment variables:

```bash

PORT=5050
TOKEN_SECRET=<auth_token_secret>
POSTGRES_DATABASE_URL=<postgresql_connection_string>

```

## Installation and bootstrapping
> You need to have [Node.js](https://nodejs.org/en/) and [PostgreSQL](https://www.postgresql.org/) installed on your machine before running the followings:

```bash
$ cd /path/to/project
$ yarn install          # install dependencies
$ yarn start            # development build
$ yarn production       # production build
```

## Database Seeding
> This will create the default system admin

```bash
$ cd /path/to/project
$ yarn seed
```

## Unit Tests

```bash
$ cd /path/to/project
$ yarn test
```
