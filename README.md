# testsoothe-cli

A command-line utility app for [TestSoothe](https://testsoothe.com).

## Installation

```bash
yarn global add @dscribers/testsoothe-cli
```

## Usage

See https://docs.testsoothe.com/runner/cli.html for usage.

## Development

> You need Docker and Docker compose.

- Clone library
- CD into the library directory
- Copy `.env.example` to `.env`
- Update variables in `.env`
- Run `docker-compose up -d`
- Run `docker-compose exec cli yarn`
- Run `docker-compose exec cli yarn link`
- Access cli as `docker-compose exec cli testsoothe [command]`
