#!/bin/bash

IMAGE=ethhmy-fe-web
TAG=latest

usage() {
   me=$(basename "$0")

cat <<-EOT
Usage: this script is used to push docker image to dockerhub for release.

$me [options]

Options:
   -h                print this message
   -t tag            release tag of the docker image (default: $TAG)

EOT
   exit 0
}

while getopts ':ht:' opt; do
   case $opt in
      t) TAG="$OPTARG";;
      *) usage ;;
   esac
done

if [ -z "$TAG" ]; then
   usage
fi

sudo docker tag "$IMAGE" harmonyone/"$IMAGE":"$TAG"
sudo docker push harmonyone/"$IMAGE"
