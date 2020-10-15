#!/bin/bash
NETWORK=

usage() {
   me=$(basename "$0")

cat <<-EOT
Usage: this script is used to build docker image for current branch and tag.

$me [options]

Options:
   -h                print this message
   -n network        network of the docker image (e.g. testnet/mainnet)

EOT
   exit 0
}

while getopts ':hn:' opt; do
   case $opt in
      n) NETWORK="$OPTARG";;
      *) usage ;;
   esac
done

if [ -z "$NETWORK" ]; then
   usage
fi

if [ "$NETWORK" == "mainnet" ]; then
	sudo docker build -f Dockerfile.build -t ethhmy-bridge.fe .
else
	sudo docker build -f Dockerfile.build."$NETWORK" -t ethhmy-bridge.fe .
fi

rm -rf artifacts
mkdir artifacts
sudo docker run -i --rm -v ${PWD}/artifacts:/mnt/artifacts ethhmy-bridge.fe /bin/bash << COMMANDS
cp /app/ethhmy-bridge-fe.tgz /mnt/artifacts
chown -R $(id -u):$(id -g) /mnt/artifacts
COMMANDS

pushd artifacts
tar xfz ethhmy-bridge-fe.tgz
popd

if [ "$NETWORK" == "mainnet" ]; then
	sudo docker build -f Dockerfile.fe-static -t ethhmy-fe-web .
else
	sudo docker build -f Dockerfile.fe-static -t ethhmy-fe-web:"$NETWORK" .
fi
