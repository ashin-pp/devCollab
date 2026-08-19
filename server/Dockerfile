FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --legacy-peer-deps

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -S app && adduser -S app -G app \
  && mkdir -p /app/logs \
  && chown app:app /app /app/logs

COPY --from=deps --chown=app:app /app/node_modules ./node_modules
COPY --chown=app:app package.json ./
COPY --chown=app:app tsconfig.json ./
COPY --chown=app:app src ./src

USER app

EXPOSE 5000

CMD ["npm", "start"]
