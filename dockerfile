FROM node:14
MAINTAINER seonghyeon.jee@gmail.com

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

EXPOSE 7779
CMD ["npm", "run", "start:prod"]
