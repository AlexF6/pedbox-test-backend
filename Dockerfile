FROM node:20-alpine

# Instalar pnpm globalmente
RUN npm install -g pnpm

WORKDIR /usr/src/app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar el resto del código y el directorio prisma
COPY . .

# Generar el cliente de Prisma
RUN pnpm prisma generate

EXPOSE 3000

# Comando para desarrollo (ajustar según el script de tu package.json)
CMD ["pnpm", "run", "dev"]