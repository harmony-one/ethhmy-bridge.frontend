#!/bin/bash

sudo docker build -t ethhmy-bridge.fe .
rm -rf artifacts
mkdir artifacts
sudo docker run -i --rm -v ${PWD}/artifacts:/mnt/artifacts ethhmy-bridge.fe /bin/bash << COMMANDS
cp /app/ethhmy-bridge-fe.tgz /mnt/artifacts
chown -R $(id -u):$(id -g) /mnt/artifacts
COMMANDS

pushd artifacts
tar xfz ethhmy-bridge-fe.tgz
popd

sudo docker build -f Dockerfile.fe-static -t ethhmy-fe-web .
