# Stage 1: Build Angular ứng dụng bằng Node.js 20
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build -- --configuration production

# Stage 2: Phục vụ sản phẩm build qua Web Server Nginx
FROM nginx:alpine
COPY --from=build /app/dist/frontend-tms01/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
