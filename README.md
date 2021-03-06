## GLPG CDP

## Local Environment Setup
- [Git](https://git-scm.com/)
- [Node.js v14.5.0](https://nodejs.org/en/)
- [Yarn v1.22.4](https://classic.yarnpkg.com/en/docs/install/#windows-stable)
- [PostgreSQL v12.2](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)
- [pgAdmin v4](https://www.pgadmin.org/)
- [Visual Studio Code](https://code.visualstudio.com/)

## Environment variables for local development
> Create a .env file and adjust the following environment variables. DONOT include this file in version control.

```bash
PORT=<express_server_port>
RECAPTCHA_SITE_KEY=<recaptcha_site_key>
AWS_ACCESS_KEY_ID=<aws_access_key_id>
AWS_SECRET_ACCESS_KEY=<aws_secret_access_key>
AWS_REGION=<aws_region>
AWS_SECRET_NAME=<aws_secret_name>
```

## Available npm scripts
```bash
$ yarn install          # install dependencies
$ yarn seed             # generate required database schemas
$ yarn start            # development build
$ yarn production       # production build
$ yarn test             # run unit tests
$ yarn sonarqube        # generate sonarqube analysis
```

## API Documentation
Go to `/api-docs` for Swagger Documentation of the API.
