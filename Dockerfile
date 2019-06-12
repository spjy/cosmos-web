FROM node:8-alpine as react

WORKDIR /cosmos-web
COPY . ./
RUN npm install

CMD ["npm", "start"]

