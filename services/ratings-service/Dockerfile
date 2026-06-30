FROM node:20-alpine

WORKDIR /app
COPY packages/shared /app/packages/shared
COPY services/ratings-service /app/services/ratings-service
WORKDIR /app/services/ratings-service

CMD ["npm", "start"]
