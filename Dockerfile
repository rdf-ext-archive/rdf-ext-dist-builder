FROM node:6.11

RUN mkdir -p /srv
WORKDIR /srv

COPY package.json /srv
RUN npm install
RUN npm install pm2 -g
COPY . /srv

CMD pm2-docker process.json

EXPOSE 8080
