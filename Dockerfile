FROM node:8-alpine as react

WORKDIR /cosmos-web
COPY . ./
RUN npm install

CMD ["npm", "start"]

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=react-build /app/build /usr/share/nginx/html
EXPOSE 80

CMD [“nginx”, “-g”, “daemon off;”]
