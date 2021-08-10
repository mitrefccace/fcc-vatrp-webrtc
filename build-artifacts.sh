# build-artifacts.sh
# This script contains the docker-compose commands to create an image to build the application on both linux and windows
# shutting down any running containers 
docker-compose down
# building the image to run the build
docker-compose build
# creating and starting a container to run the build
docker-compose up