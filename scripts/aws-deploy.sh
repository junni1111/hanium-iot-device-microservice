echo start deploy script...

docker buildx build --platform linux/amd64 -t 913168039706.dkr.ecr.ap-northeast-2.amazonaws.com/device-microservice:latest --push .

