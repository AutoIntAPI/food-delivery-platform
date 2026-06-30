FROM node:20-alpine

WORKDIR /app
COPY packages/shared /app/packages/shared
COPY services/notifications-service /app/services/notifications-service
WORKDIR /app/services/notifications-service

CMD ["npm", "start"]
