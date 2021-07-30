# MTF API

This repository is used for the REST APIs for MTF

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [NodeJs](https://nodejs.org/en/download/package-manager/)
- [TypeScript](https://www.typescriptlang.org/)
- [MongoDB](https://www.mongodb.com/)

### Installing

A step by step series of examples that tell you how to get a development env running

Clone the git repository

```
git clone https://github.com/krish-dev/int-meet-api.git
```

Install all dependency packages

```
npm install
```

Create a .env file in the root directory as define below
| Key | Usage |
|-------------------------------|------------------------------------------------------------------|
| NODE_ENV | This is used to define the environment. The default value is dev |
| NODE_PORT | This is used to define the port. The default port is 4000 |
| API_KEY | API key for the application |
| MONGO_HOST | MongoDB host |
| MONGO_PORT | MongoDB port |
| MONGO_DATABASE | MongoDB database name |
| MONGO_USERNAME | MongoDB username |
| MONGO_PASSWORD | MongoDB pass |
| MONGO_AUTHENTICATION_DATABASE | MongoDB authentication database name |
| PASSWORD_SALT_ROUND | Password Salt Round |
| USER_ACCESS_TOKEN_SECRET | Random |
| ACCESS_TOKEN_EXPIRED | 3600 |
| USER_REFRESH_TOKEN_SECRET | Random |
| REFRESH_TOKE_EXPIRED | 259200 |

**NPM scripts and their usage**

To clear the build directory run

```
npm run clean
```

To copy assets to the build directory run

```
npm run copy-assets
```

To list down all listing error and fix auto fixable linting error run

```
npm run lint
```

To compile all the node project

```
npm run tsc
```

For creating a build run

```
npm run build
```

To start the NodeJs server with new build and without watch run

```
npm run dev:start
```

To start the NodeJs server with new build and watch run

```
npm run dev
```

To start the NodeJs server with the existing build and without a watch

```
npm run start
```

After a creating the .env file and executing a start script a nodejs server will be running on your defined port

**Swagger Documentation**
After starting the nodejs server the swagger documentation will be accessable via `http://localhost:<YOUR_DEFINED_PORT>/api-docs`

### Run Unit Test Cases

N/A

## Deployment

N/A
