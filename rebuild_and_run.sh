#!/bin/bash

container_name="ff"

# Build the Docker image
docker build -t $container_name .

# Check if the container exists
container_exists=$(docker container ls -a -f "name=$container_name" -q)

# If the container exists, stop and remove it
if [ ! -z "$container_exists" ]; then
    docker stop $container_name
    docker rm $container_name
fi

# Run the new container
docker run -d -p 3000:3000 --name $container_name $container_name
docker logs -f $container_name
