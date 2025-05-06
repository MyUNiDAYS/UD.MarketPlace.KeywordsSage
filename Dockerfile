FROM node:alpine3.21

WORKDIR /app

COPY package.json /app/package.json
COPY tsconfig.json /app/tsconfig.json

COPY src/api /app/src/api

# Change the working directory to /app
WORKDIR /app

# Install only production dependencies
RUN npm install --omit=dev

RUN npm install typescript

# Compile TypeScript files using the Docker-specific tsconfig.json
RUN npx tsc -p tsconfig.json
# ENV START_TIME_HOURS_AGO=1
ENV AWS_REGION=eu-west-1

EXPOSE 3000

# Run the application
CMD ["node", "dist/bedrockInterface.js"]
