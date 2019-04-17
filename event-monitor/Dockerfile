FROM node:10.15.3-jessie

RUN apt-get update && apt-get install -y libsasl2-dev

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "npm", "start" ]
