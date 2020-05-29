# develop stage
FROM node:14.3-alpine as develop-stage
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
RUN yarn
COPY . .
RUN apk --no-cache add curl
RUN apk add --update bash
