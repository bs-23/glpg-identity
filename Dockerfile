FROM node:14.5-alpine AS builder
WORKDIR /app
COPY . .
RUN yarn install

FROM node:14.5-alpine AS prod
WORKDIR /app
COPY --from=builder /app ./
RUN npm install pm2 -g
ENV PORT=80
EXPOSE 80

# Using root user to run the project
USER root
CMD ["yarn", "production"]
