FROM node:20-alpine

WORKDIR /app
COPY packages/shared /app/packages/shared
COPY services/payments-service /app/services/payments-service
WORKDIR /app/services/payments-service

CMD ["npm", "start"]
