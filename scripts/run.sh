#!/bin/bash
#Check Docker network existence and create a network if not exists. If 'run' is provided as 1st argument, launch the application in Docker with ./build dir as volume
#Run as `run.sh [run]`
NETWORK_NAME='report-server'
NETWORK_EXISTS="`docker network ls -f "name=$NETWORK_NAME" --format '{{.Name}}'`";
echo 'NETWORK_EXISTS='$NETWORK_EXISTS;
if [ -z $NETWORK_EXISTS ]; then
    echo "Creating a network...";
    docker network create --driver bridge $NETWORK_NAME
fi

NETWORK_GATEWAY="`docker network inspect --format '{{range .IPAM.Config}}{{.Gateway}}{{end}}' $NETWORK_NAME`"
echo 'NETWORK_GATEWAY='$NETWORK_GATEWAY;

export NETWORK_GATEWAY;

#TODO
#REDIS_VOLUME=`pwd`/data/redis docker run --name report-server-redis -v $REDIS_VOLUME/data:/data -v -v $REDIS_VOLUME/conf/redis.conf:/usr/local/etc/redis/redis.conf -d redis redis-server --appendonly yes

if [ -z $1 ]; then
    echo "Don't run the application..."
elif [ $1 == run ]; then
    echo "Running the application..";
    docker run --rm -d --network report-server --name report-server -v `pwd`/build:/app -v `pwd`/node_modules:/app/node_modules -v `pwd`/env:/app/env -v `pwd`/feeds:/app/feeds -e NODE_ENV=dev -e CONFIG_PATH='./env/dev.config.json' -e PORT=8080 -p 8080:3000 report-server

    echo "Launched the application instance with name 'report-server'. Run\n\ndocker logs -f report-server\n\nto see the logs."
fi
