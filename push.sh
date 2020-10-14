#!/bin/bash

IMAGE=ethhmy-fe-web
TAG=latest
NETWORK=testnet

usage() {
   me=$(basename "$0")

cat <<-EOT
Usage: this script is used to push docker image to dockerhub for release.

$me [options]

Options:
   -h                print this message
   -n network        network of the docker image (default: testnet)
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
	echo sudo docker tag "$IMAGE" harmonyone/"$IMAGE":"$TAG"
	echo sudo docker push harmonyone/"$IMAGE":"$TAG"
else
	echo sudo docker tag "$IMAGE" harmonyone/"$IMAGE":"$TAG-$NETWORK"
	echo sudo docker push harmonyone/"$IMAGE":"$TAG-$NETWORK"
fi
