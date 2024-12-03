FROM node:18

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./

RUN npm install
#need to install netcat to check connection to db before starting the app and migrate if needed
RUN apt update
RUN apt install netcat-openbsd  

# copy entire app src code in the current dir
COPY . . 
COPY entrypoint.sh /usr/src/app/entrypoint.sh
RUN chmod +x /usr/src/app/entrypoint.sh
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]

EXPOSE 3000

CMD ["npm", "start"]