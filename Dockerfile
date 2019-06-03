FROM node:7
WORKDIR /app
COPY package.json /app
RUN npm install
RUN mkdir videos
RUN mkdir video
COPY . /app
CMD node server.js
EXPOSE 3001
