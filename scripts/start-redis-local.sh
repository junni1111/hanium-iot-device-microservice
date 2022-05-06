#!/bin/bash
set -e

Image="Redis";

echo "echo stop & remove old docker [$Image] and starting new fresh instance of [$Image]"
(docker kill $Image || :) && \
  (docker rm $Image || :) && \
  docker run --name $Image \
  -p 6379:6379 \
  -d local-redis:latest

echo "Start [$Image] ..";
