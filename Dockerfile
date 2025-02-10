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
RUN chmod +x /usr/src/app/init_conf/entrypoint.sh
ENTRYPOINT ["/usr/src/app/init_conf/entrypoint.sh"]

EXPOSE 3000
#start the app in dev mode, later on replace for start
#CMD ["npm", "run", "dev"] 
CMD ["npm", "start"]