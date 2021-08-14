FROM node:13
COPY . /home/node/project
WORKDIR /home/node/project
RUN npm install
RUN npm run test
RUN npm run build

FROM node:13
ENV PORT 8080
ENV NODE_ENV dev
ENV CONFIG_PATH ./env/dev.config.json
COPY --from=0 /home/node/project/build /app/
COPY --from=0 /home/node/project/node_modules /app/node_modules/
COPY --from=0 /home/node/project/env /app/env/
COPY --from=0 /home/node/project/feeds /app/feeds/
WORKDIR /app
EXPOSE ${PORT:-8080}
ENTRYPOINT ["node", "./app.js"]