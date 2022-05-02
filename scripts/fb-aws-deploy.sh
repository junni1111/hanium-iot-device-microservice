echo start deploy script...

aws ecr --profile fb get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin 930514904954.dkr.ecr.ap-northeast-2.amazonaws.com

docker buildx build --platform linux/amd64 -t 930514904954.dkr.ecr.ap-northeast-2.amazonaws.com/device-microservice:latest --push .

