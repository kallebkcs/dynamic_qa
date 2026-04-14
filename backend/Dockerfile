FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Porta em que o serv vai rodar
EXPOSE 3000
#
CMD ["npm", "run", "dev"]