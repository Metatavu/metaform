FROM node:14

WORKDIR /usr/src/app
COPY package*.json ./

RUN apt update
RUN apt install libnss3 libnss3-dev libgdk-pixbuf2.0-dev libgtk-3-dev libxss-dev -y
RUN npm install
RUN npm install -g grunt-cli
RUN npm install -g sass
COPY . .
RUN grunt

EXPOSE 3000
CMD [ "node", "app.js" ]