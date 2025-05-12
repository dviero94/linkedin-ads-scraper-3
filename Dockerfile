FROM apify/actor-node-playwright-chrome:latest

COPY package.json ./
RUN npm install --only=prod

COPY . ./

CMD ["npm", "start"]
