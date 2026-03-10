FROM node:24-alpine
WORKDIR /security-ms
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY ./package.json .
COPY ./tsconfig.json .
ENV PORT=3000
EXPOSE ${PORT}
RUN pnpm install
CMD [ "pnpm", "dev" ]