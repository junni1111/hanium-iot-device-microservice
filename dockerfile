FROM node:14
MAINTAINER seonghyeon.jee@gmail.com

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 8000 8888
CMD ["npm", "run", "start:prod"]
