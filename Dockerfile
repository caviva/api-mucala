FROM node:18-bullseye as bot
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
ARG PUBLIC_URL
ARG PORT
CMD ["npm", "start"]
