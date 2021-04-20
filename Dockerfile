# develop stage
FROM node:14.3-alpine

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

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

RUN chown 1000:1000 /app

USER 1000:1000

COPY --chown=1000:1000 package.json ./
COPY --chown=1000:1000 yarn.lock ./

RUN yarn

COPY --chown=1000:1000 . .
