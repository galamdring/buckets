FROM node:19

WORKDIR /app
COPY . .
RUN npm install && npm run build

ENTRYPOINT ["npm", "run", "start"]
