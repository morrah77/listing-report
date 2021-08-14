#Report REST API service

##Description

The simplest REST API service implemented above express.js

See OpenAPI definition at [./swagger.json](./swagger.json)

*TODO*: complete the OpenApi document with all the exposed REST endpoints

The basic infrastructure includes:

- an application

- *TODO*: consider adding Redis for report caching

##Prerequisites

```
npm i
```

##Build

###Local

```
npm run build
```

###Docker

```
docker build -t report-server -f ./Dockerfile .

```

##Run

###Prerequisites

- Check if you have some data files in `feeds` directory

- Prepare the environment:

```
./scripts/run.sh

```

or

```
export NETWORK_GATEWAY="`docker network inspect --format '{{range .IPAM.Config}}{{.Gateway}}{{end}}' report-server`" && \
CONFIG_PATH='./env/dev.config.json NODE_ENV=dev PORT=8080 APP_CONFIG_VOLUME=`pwd`/env
```

*TODO* bind and test report-server-redis


###Run the application

####Locally

```
npm start
```


####Docker

#####dev

```
docker run --rm --network report-server --name report-server -e NODE_ENV=dev -e CONFIG_PATH='./env/dev.config.json' -e PORT=8080 -p 8080:3000 report-server
```

or, with custom config and data directory,

```
docker run --rm -d --network report-server --name report-server -v `pwd`/env:/app/env -v `pwd`/feeds:/app/feeds -e NODE_ENV=dev -e CONFIG_PATH='./env/dev.config.json' -e PORT=8080 -p 8080:3000 report-server
```

or serve built app from local machine via Docker container

```
docker run --rm -d --network report-server --name report-server -v `pwd`/build:/app -v `pwd`/node_modules:/app/node_modules -v `pwd`/env:/app/env-v `pwd`/feeds:/app/feeds -e NODE_ENV=dev -e CONFIG_PATH='./env/dev.config.json' -e PORT=8080 -p 8080:3000 report-server
```


#####prod

```
docker run --rm --network report-server --name report-server -e NODE_ENV=prod -e CONFIG_PATH ./env/prod.config.json -e PORT=8080 -v `pwd`/env:/app/env-v `pwd`/feeds:/app/feeds -p 8080:8000 report-server
```


##Test


###Local automatic tests

```
npm run build-test && npm run test

```

####Manually

#####Test the application launched locally:

```
curl -iv -X GET 'http://localhost:3000/v0/report/avg_selling_prices?json=true'
curl -iv -X GET 'http://localhost:3000/v0/report/make_distributions?json=true'
curl -iv -X GET 'http://localhost:3000/v0/report/avg_price?json=true'
curl -iv -X GET 'http://localhost:3000/v0/report/ranked_listings?json=true'
curl -iv -X GET 'http://localhost:3000/v0/data/upload'
curl -iv -X POST -F listings=@feeds/listings.csv -F contacts=@feeds/contacts.csv 'http://localhost:3000/v0/data/upload?json=true'

```

Or using a web browser:

[http://localhost:3000/v0/report/avg_selling_prices](http://localhost:3000/v0/report/avg_selling_prices)

[http://localhost:3000/v0/report/make_distributions](http://localhost:3000/v0/report/make_distributions)

[http://localhost:3000/v0/report/avg_price](http://localhost:3000/v0/report/avg_price)

[http://localhost:3000/v0/report/ranked_listings](http://localhost:3000/v0/report/ranked_listings)

[http://localhost:3000/v0/data/upload](http://localhost:3000/v0/data/upload)


#####Test the application launched in a Docker container:

```

curl -iv -X GET 'http://'$NETWORK_GATEWAY':8080/v0/report/avg_selling_prices?json=true'
curl -iv -X GET 'http://'$NETWORK_GATEWAY':8080/v0/report/make_distributions?json=true'
curl -iv -X GET 'http://'$NETWORK_GATEWAY':8080/v0/report/avg_price?json=true'
curl -iv -X GET 'http://'$NETWORK_GATEWAY':8080/v0/report/ranked_listings?json=true'
curl -iv -X GET 'http://'$NETWORK_GATEWAY':8080/v0/data/upload'
curl -iv -X POST -F listings=@feeds/listings.csv -F contacts=@feeds/contacts.csv 'http://'$NETWORK_GATEWAY':8080/v0/data/upload?json=true'

```

Or using a web browser:

[http://localhost:8080/v0/report/avg_selling_prices](http://localhost:8080/v0/report/avg_selling_prices)

[http://localhost:8080/v0/report/make_distributions](http://localhost:8080/v0/report/make_distributions)

[http://localhost:8080/v0/report/avg_price](http://localhost:8080/v0/report/avg_price)

[http://localhost:8080/v0/report/ranked_listings](http://localhost:8080/v0/report/ranked_listings)

[http://localhost:8080/v0/data/upload](http://localhost:8080/v0/data/upload)

##TODO

- consider adding authorization for the REST endpoints
- consider using Redis cache for generated reports
- test docker-compose.yml with clear space
- use one logger library (pref. winston) for all classes
- take logger transport from config
- refactor routers
- improve uploaded files validation
- increase code coverage
- add integration test for the whole application
- consider to add Travis/Jenkins scripts
- implement data files upload/retrieval using S3 API
 