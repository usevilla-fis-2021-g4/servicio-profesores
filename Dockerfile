FROM node:10-alpine

WORKDIR /app

COPY package.json .

COPY package-lock.json .

RUN npm install

COPY index.js .
COPY profesores.js .
COPY server.js .
COPY db.js .

EXPOSE 3000

CMD npm start