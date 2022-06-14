
## Description

A faucet bot for substrate framework build by [Nest](https://github.com/nestjs/nest).

## Installation

```bash
$ yarn
```

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```
## Docker

build docker file

```bash
./docker/build.sh
```

run in docker

```bash
docker run -itd -p 9955:9955 --env FAUCET_URL=ws://192.168.31.131:9944 --env FAUCET_KEY=0x1111111111111111111111111111111111111111111111111111111111111111 --env FAUCET_AMOUNT=10000000000 --env FAUCET_PENDING=200 --name=subot subot
```

For test, you should run a substrate node with `substrate --dev --tmp`;

## License

Nest is [MIT licensed](LICENSE).
