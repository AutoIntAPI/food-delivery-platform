FROM node:20-alpine

WORKDIR /app
COPY packages/shared /app/packages/shared
COPY services/users-service /app/services/users-service
WORKDIR /app/services/users-service

CMD ["npm", "start"]
