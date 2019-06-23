FROM node:7
WORKDIR /video_manager
COPY package.json /app
RUN npm install
RUN mkdir videos
RUN mkdir imagenes
COPY . /video_manager
CMD node server.js
EXPOSE 3001
