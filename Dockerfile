FROM node:lts-bookworm-slim
WORKDIR /app

COPY ./package.json ./
RUN npm install

COPY ./*.js ./
COPY ./buttons ./buttons
COPY ./commands ./commands
COPY ./util ./util

CMD ["npm", "start"]
