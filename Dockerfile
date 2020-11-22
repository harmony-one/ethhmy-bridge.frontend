FROM node:latest as build

RUN mkdir /app
WORKDIR /app

ARG NODE_ENV=mainnet

ENV PATH /app/node_modules/.bin:$PATH
ENV NODE_ENV=${NODE_ENV}

COPY package.json package-lock.json /app/

RUN npm install

COPY . /app/

RUN npm run build

FROM nginx:latest

COPY --from=build /app/build/ /usr/share/nginx/html/
ADD nginx.default.conf /etc/nginx/conf.d/default.conf
