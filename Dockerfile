FROM node:18-alpine

WORKDIR /app

# Add cache-busting argument for node_modules layer
ARG CACHEBUST=1
ENV CACHEBUST=${CACHEBUST}

COPY package*.json ./

RUN NODE_OPTIONS=--max-old-space-size=4096 npm install --legacy-peer-deps

# Copy the rest of the app
COPY . .

RUN npm run build
RUN npx prisma migrate deploy

EXPOSE 5000

CMD ["npm", "run", "start"]
