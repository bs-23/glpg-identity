## GLPG CDP

## Dev Environment Setup
- [Git](https://git-scm.com/)
- [Node.js v14.2.0](https://nodejs.org/en/)
- [Yarn v1.22.4](https://classic.yarnpkg.com/en/docs/install/#windows-stable)
- [PostgreSQL v12.2](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)
- [pgAdmin v4](https://www.pgadmin.org/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Sonarqube](https://www.sonarqube.org/)

## Configure environment variables
> Create a .env file and adjust the following environment variables. DONOT include this file in version control.

Required env variables:
```bash
AWS_ACCESS_KEY_ID=<aws_access_key_id>
AWS_SECRET_ACCESS_KEY=<aws_secret_access_key>
AWS_REGION=<aws_region>
AWS_SECRET_NAME=<aws_secret_name>
```

Optional env variables:
```bash
PORT=5050
TOKEN_SECRET=<auth_token_secret>
POSTGRES_URL=<postgresql_connection_string>
POSTGRES_DATABASE=<database_name>
SONARQUBE_URL=<sonarqube_url>
SONARQUBE_TOKEN=<sonarqube_token>
```

## Available commands
```bash
$ cd /path/to/project
$ yarn install          # install dependencies
$ yarn seed             # seed the database
$ yarn start            # development build
$ yarn production       # production build
$ yarn test             # running unit tests
```
