## GLPG CIAM

[![Build Status](https://travis-ci.com/bs-23/glpg-ciam.svg?token=MzSs9Q4pu5W2TDL3FHze&branch=master)](https://travis-ci.com/bs-23/glpg-ciam)

## Built with
- [Express](https://expressjs.com/)
- [Formik](https://jaredpalmer.com/formik/)
- [Passport](http://passportjs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [React](https://reactjs.org/)
- [Redux](https://redux.js.org/)
- [Webpack](https://webpack.js.org/)

## Configuring environment variables

> Rename .env.example file to .env and adjust your environment variables:

```bash
PORT=5050
TOKEN_SECRET=<auth_token_secret>

PGHOST=<postgresql_host>
PGPORT=<postgresql_port>
PGDATABASE=<postgresql_database>
PGUSER=<postgresql_user>
PGPASSWORD=<postgresql_password>

```

## Installation and bootstrapping
> You need to have [Node.js](https://nodejs.org/en/) and [PostgreSQL](https://www.postgresql.org/) installed on your machine before running the followings:

```bash
$ cd /path/to/project
$ yarn install          # install dependencies
$ npm start             # development build
$ npm run production    # production build
```

## Database Seeding
> This will create the default admin user for the dashbaord.
```bash
$ cd /path/to/project
$ npm run seed
```
