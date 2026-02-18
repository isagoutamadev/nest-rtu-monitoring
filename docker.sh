#!/bin/bash

IMAGE_TAG_DEV="harbor.telkom.co.id/dso-app/newosase/api:dev"
IMAGE_TAG_PROD="harbor.telkom.co.id/dso-app/newosase/api:latest"

CONTAINER_NAME_DEV='newosase-api-dev'
CONTAINER_NAME_PROD='newosase-api-prod'

PORT_EXPOSE_DEV='3000'
PORT_EXPOSE_PROD='3001'

INTERNAL_PORT='8000'

build() {
  echo "Building Docker image..."

  if [[ "$1" == "dev" ]]; then
    docker build --no-cache -t $IMAGE_TAG_DEV .
  else
    docker build --no-cache -t $IMAGE_TAG_PROD .
  fi

  echo "Docker image built successfully."
}

push() {
  local image_tag=""
  
  if [[ "$1" == "dev" ]]; then
    image_tag=$IMAGE_TAG_DEV
  else
    image_tag=$IMAGE_TAG_PROD
  fi

  echo "Pushing Docker image to registry..."
  docker push $image_tag
  echo "Docker image pushed to registry successfully."
}

pull() {
  local image_tag=""
  
  if [[ "$1" == "dev" ]]; then
    image_tag=$IMAGE_TAG_DEV
  else
    image_tag=$IMAGE_TAG_PROD
  fi

  echo "Pulling the latest Docker image from registry..."
  docker pull $image_tag
  echo "Docker image pulled successfully."
}

drop() {
  local container_name=""
  
  if [[ "$1" == "dev" ]]; then
    container_name=$CONTAINER_NAME_DEV
  else
    container_name=$CONTAINER_NAME_PROD
  fi

  echo "Dropping the existing container..."
  docker stop $container_name && docker rm $container_name
  echo "Container dropped successfully."
}

up() {
  local image_tag=""
  local port_expose=""
  local container_name=""

  if [[ "$1" == "dev" ]]; then
    image_tag=$IMAGE_TAG_DEV
    port_expose=$PORT_EXPOSE_DEV
    container_name=$CONTAINER_NAME_DEV
  else
    image_tag=$IMAGE_TAG_PROD
    port_expose=$PORT_EXPOSE_PROD
    container_name=$CONTAINER_NAME_PROD
  fi

  echo "Starting the Docker container..."
  echo "Running: docker run -d -p $port_expose:$INTERNAL_PORT --name $container_name $image_tag"
  docker run -d -p $port_expose:$INTERNAL_PORT --name $container_name $image_tag
  echo "Docker container started successfully."
}

refresh() {
  if [[ "$1" == "dev" ]]; then
    pull "dev"
    drop "dev"
    up "dev"
  else
    pull "prod"
    drop "prod"
    up "prod"
  fi
 sudo docker ps
}

# ... (other functions)

# Check for the argument and call the corresponding function
case "$1" in
  build)
    build $2
    ;;
  push)
    push $2
    ;;
  pull)
    pull $2
    ;;
  drop)
    drop $2
    ;;
  up)
    up $2
    ;;
  refresh)
    if [[ "$2" == "dev" ]]; then
      refresh "dev"
    else
      refresh "prod"
    fi
    ;;
  *)
    echo "Usage: $0 {build|push|pull|drop|up|refresh} [dev|prod]"
    exit 1
esac