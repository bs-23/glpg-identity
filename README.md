## GLPG CIAM

## Environment Setup
- [Git](https://git-scm.com/)
- [Node.js v14.0.0.0](https://nodejs.org/en/)
- [Yarn v1.22.4](https://classic.yarnpkg.com/en/docs/install/#windows-stable)
- [PostgreSQL v12.2](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)
- [pgAdmin v4](https://www.pgadmin.org/)
- [Visual Studio Code](https://code.visualstudio.com/)

## Configure environment variables
> Create a .env file and adjust the following environment variables:

```bash
PORT=5050
TOKEN_SECRET=<auth_token_secret>
POSTGRES_DATABASE_URL=<postgresql_connection_string>
```

## Available commands
```bash
$ cd /path/to/project
$ yarn install          # install dependencies
$ yarn seed             # seed the database
$ yarn start            # development build
$ yarn production       # production build
$ yarn test             # running unit tests for node.js code
```
