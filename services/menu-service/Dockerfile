FROM node:20-alpine

WORKDIR /app
COPY packages/shared /app/packages/shared
COPY services/menu-service /app/services/menu-service
WORKDIR /app/services/menu-service

CMD ["npm", "start"]
