FROM node:22-bookworm-slim

ENV NODE_ENV=production
WORKDIR /app

COPY package.json server-card.json glama.json README.md LICENSE ./
COPY catalog ./catalog

RUN npm install --omit=dev

USER node

CMD ["node", "catalog/stdio.mjs"]
