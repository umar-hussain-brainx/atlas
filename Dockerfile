FROM node:18-alpine

EXPOSE 5000
WORKDIR /app
COPY . .

RUN NODE_OPTIONS=--max-old-space-size=4096 npm install --legacy-peer-deps
RUN npx prisma migrate dev --name init

RUN npm run build


CMD ["npm", "run", "start"]