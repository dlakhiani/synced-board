FROM node:20
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 4444
CMD ["node", "server.js"]
