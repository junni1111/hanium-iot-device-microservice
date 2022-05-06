#!/bin/bash
set -e

Image="mosquitto";

echo "echo stop & remove old docker [$Image] and starting new fresh instance of [$Image]"
(docker kill $Image || :) && \
  (docker rm $Image || :) && \
  docker run --name $Image \
  -p 1883:1883 \
  -d local-mosquitto:latest

echo "Start [$Image] ..";
