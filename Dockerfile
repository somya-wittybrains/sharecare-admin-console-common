FROM node:20-alpine

WORKDIR /app 
COPY . .
COPY build ./src/public
COPY build public
COPY ./node_modules ./src/node_modules
COPY debug-logger.js ./src
COPY newrelic.js ./src
COPY appService.js ./src
COPY proxy-controller.js ./src

EXPOSE 3000

CMD [ "node", "src/appService.js"]

  
