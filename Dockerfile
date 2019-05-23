FROM node:8-alpine

WORKDIR /cosmos-web

COPY . ./

RUN npm install

CMD ["npm", "start"]
