FROM node:14.1-alpine AS builder
WORKDIR /app
COPY . .
RUN yarn install

FROM node:14.1-alpine AS prod
WORKDIR /app
COPY --from=builder /app ./
# Install pm2 dependency into image
RUN npm install pm2@latest -g
ENV PORT=80
EXPOSE 80

# Using root user to run the project
USER root
CMD ["yarn", "start"]
# Production start not working
# CMD ["yarn", "production"]
