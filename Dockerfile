FROM node:10.12 as builder
WORKDIR /app

ARG SSH_PRIVATE_KEY
RUN mkdir /root/.ssh/
RUN touch /root/.ssh/known_hosts
RUN echo "${SSH_PRIVATE_KEY}" > /root/.ssh/id_rsa
RUN ssh-keyscan bitbucket.org >> /root/.ssh/known_hosts

COPY /app/config ./config
COPY /app/src ./src
COPY index.js .
COPY package.json .
COPY package-lock.json .

RUN npm install
RUN rm -rf /root/.ssh
RUN rm -rf install



FROM spelwerk-api-account:latest
WORKDIR /app

COPY --from=builder /app .

EXPOSE 8080

CMD ["npm","start"]
