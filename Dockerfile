# develop stage
FROM node:16.3-alpine

RUN apk update && apk add --no-cache nmap
RUN echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
  echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
  apk update
RUN apk add --no-cache \
  chromium \
  harfbuzz \
  freetype \
  freetype-dev \
  ca-certificates \
  ttf-freefont \
  nss \
  libc6-compat \
  udev
RUN apk add python3 \
  build-base \
  make \
  g++

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

RUN chown 1000:1000 /app

USER 1000:1000

ENV PATH /home/node/.yarn/bin:$PATH
