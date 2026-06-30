FROM node:20-alpine

WORKDIR /app
COPY packages/shared /app/packages/shared
COPY services/orders-service /app/services/orders-service
WORKDIR /app/services/orders-service

CMD ["npm", "start"]
