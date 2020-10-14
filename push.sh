#!/bin/bash

IMAGE=ethhmy-fe-web
TAG=latest
NETWORK=

usage() {
   me=$(basename "$0")

cat <<-EOT
Usage: this script is used to push docker image to dockerhub for release.

$me [options]

Options:
   -h                print this message
   -n network        network of the docker image (e.g. testnet/mainnet)
   -t tag            release tag of the docker image (default: $TAG)

EOT
   exit 0
}

while getopts ':hn:t:' opt; do
   case $opt in
      n) NETWORK="$OPTARG";;
      t) TAG="$OPTARG";;
      *) usage ;;
   esac
done

if [ -z "$TAG" -o -z "$NETWORK" ]; then
   usage
fi

if [ "$NETWORK" == "mainnet" ]; then
	sudo docker tag "$IMAGE" harmonyone/"$IMAGE":"$TAG"
	sudo docker push harmonyone/"$IMAGE":"$TAG"
else
	sudo docker tag "$IMAGE":"$NETWORK" harmonyone/"$IMAGE":"$TAG-$NETWORK"
	sudo docker push harmonyone/"$IMAGE":"$TAG-$NETWORK"
fi
