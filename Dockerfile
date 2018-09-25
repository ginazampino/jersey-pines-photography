FROM     node:8.12.0-alpine
WORKDIR  /app

EXPOSE   8111

COPY     . .

RUN      [ "npm", "install" ]
RUN      [ "npm", "run", "build-prod" ]

CMD      [ "npm", "run", "server" ]