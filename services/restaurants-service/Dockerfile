FROM node:20-alpine

WORKDIR /app
COPY packages/shared /app/packages/shared
COPY services/restaurants-service /app/services/restaurants-service
WORKDIR /app/services/restaurants-service

CMD ["npm", "start"]
