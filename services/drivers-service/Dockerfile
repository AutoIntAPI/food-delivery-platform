FROM node:20-alpine

WORKDIR /app
COPY packages/shared /app/packages/shared
COPY services/drivers-service /app/services/drivers-service
WORKDIR /app/services/drivers-service

CMD ["npm", "start"]
