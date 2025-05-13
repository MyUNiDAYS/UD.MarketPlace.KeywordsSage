FROM node:alpine3.21

WORKDIR /app

COPY package.json /app/package.json
COPY tsconfig.json /app/tsconfig.json
COPY src/services/modelFormat /app/dist/services/modelFormat

COPY src /app/src

WORKDIR /app

RUN npm install --omit=dev

RUN npm install typescript

RUN npx tsc -p tsconfig.json
ENV AWS_REGION=eu-west-1

EXPOSE 3000

CMD ["node", "dist/app.js"]
