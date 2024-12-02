FROM node:18

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./

RUN npm install

# copy entire app src code in the current dir
COPY . . 

EXPOSE 3000

CMD ["npm", "start"]