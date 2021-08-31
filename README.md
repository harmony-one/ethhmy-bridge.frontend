# harmony eth bridge frontend

Ethereum<>Harmony two way bridge (trusted version)

## Install instructions

### Requirements

- nodejs

### Commands

- Fetch repo

```
git clone git@github.com:harmony-one/ethhmy-bridge.frontend.git
```

- Install dependencies

```
npm install
```

- Develop

```
npm run dev
```

- Build

```
npm run build
```

- Start

```
cd build
serve
```

# Docker

## build

```
./build.sh
```

The build artificats will be in artifacts/build folder.

## Start

```
./start.sh
```

The frontend will be started in http://localhost:8080

## push to docker hub

You need to have permission to push to the harmonyone repo.

```bash
sudo docker login
sudo docker tag ethhmy-fe-web harmonyone/ethhmy-fe-web:latest
sudo docker push harmonyone/ethhmy-fe-web
```

You may also push to difference release version other than just `latest`.

# Analytics Section

The analytics section needs a GraphQL backend, this can be set in ANALITYCS_SUBGRAPH_URL env variable.

All the components for this section are based on the components from other parts of the UI and they are located under the components/Subgraph. There are 3 different components available in this verison.

## numeric

This component execute a subgraph query and shows the result as a Single Numeric value.

## charts

This component draws charts based on a GraphQL query, however it does some computation on the data so by changing the query maybe there is a need to change the data process as well.

## tables

This is a symbolic tables such as the one in the Tokens page however the search functionality is a little different and also there some computation on the symbols to remove some parts. Absolutely this component needs some improvement, however, it does the job.
