# qual motor?
FROM node:20-alpine
# criar a pasta do projeto dentro do "container"
WORKDIR /app
# copiar os arquivos de dependências primeiro (otimiza o cache)
COPY package*.json ./
# instalar as dependências (express, cors...)
RUN npm install --production
# copiar o resto do código (server.js, database.json...)
COPY . .
# porta
EXPOSE 3000
# ligar
CMD ["node", "server.js"]