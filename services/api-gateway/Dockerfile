FROM node:20-alpine

WORKDIR /app
COPY packages/shared /app/packages/shared
COPY services/api-gateway /app/services/api-gateway
WORKDIR /app/services/api-gateway

CMD ["npm", "start"]
