FROM node:lts as react

WORKDIR /cosmos-web
COPY . ./
RUN npm install

CMD ["npm", "start"]
