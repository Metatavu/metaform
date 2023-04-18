FROM node:14

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install
RUN npm install -g grunt-cli
RUN npm install -g sass
COPY . .
RUN grunt

EXPOSE 3000
CMD [ "node", "app.js" ]