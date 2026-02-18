# Tahap 1: Membangun aplikasi
FROM node:16 AS builder

# Membuat direktori kerja
WORKDIR /usr/src/app

# Menyalin file package.json dan yarn.lock
COPY package.json yarn.lock ./

RUN yarn install 

# Menyalin sumber kode aplikasi
COPY . .

# Membangun aplikasi
RUN yarn build

# Menghapus folder node_modules untuk memastikan tidak ada modul native yang tidak sesuai
RUN rm -rf node_modules

# Install ulang modul, kali ini akan dikompilasi di dalam container ini
RUN yarn install --production 

# Tahap 2: Menyiapkan image produksi
FROM node:16-slim

# Membuat direktori kerja
WORKDIR /usr/src/app

# Menyalin build aplikasi dan node_modules dari tahap builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/.env ./

# Menyalin file .env
COPY .env .

# Menetapkan port dan perintah untuk menjalankan aplikasi
EXPOSE 3000
CMD ["node", "dist/main"]
