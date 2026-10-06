FROM node:20-alpine
WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY server.js ./
COPY public ./public

ENV PORT=3000
ENV API_URL=http://backend:8080

EXPOSE 3000
CMD ["npm", "start"]
