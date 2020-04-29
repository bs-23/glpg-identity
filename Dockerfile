FROM node:12.7-alpine AS builder
WORKDIR /app
COPY . .
RUN yarn install

FROM node:12.7-alpine AS prod
WORKDIR /app
COPY --from=builder /app ./
# Install yarn and pm2 dependency into image
RUN npm install yarn@latest -g && npm install pm2@latest -g
ENV PORT=80
EXPOSE 80

# Using root user to run the project
USER root
CMD ["yarn", "start"]
# Production start not working
# CMD ["yarn", "production"]