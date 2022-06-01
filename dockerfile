FROM node:14
MAINTAINER seonghyeon.jee@gmail.com

WORKDIR /app
COPY package.json package-lock.json .
RUN npm install
COPY . .
RUN npm run build

EXPOSE 7779 8888
CMD ["npm", "run", "start:prod"]
