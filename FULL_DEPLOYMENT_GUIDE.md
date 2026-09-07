# 📘 CẨM NANG TOÀN TẬP DEPLOY & QUẢN TRỊ SERVER VPS DỰ ÁN TMS-01

> **Dành cho Lập trình viên & Quản trị viên hệ thống (DevOps & Fullstack)**  
> *Dự án: TMS-01 (Transportation Management System)*  
> *Kiến trúc: Angular 19 (Frontend SPA) + Spring Boot 4.1.0 (Backend REST API) + PostgreSQL 16 + Redis Alpine + Nginx Reverse Proxy.*

---

## 📋 MỤC LỤC
1. [Tổng Quan Kiến Trúc Đóng Gói (Containerization)](#1-tổng-quan-kiến-trúc-đóng-gói)
2. [Cấu Hình Môi Trường & File Gốc](#2-cấu-hình-môi-trường--file-gốc)
3. [Tập Lệnh Linux & Docker Từ Cơ Bản Đến Nâng Cao](#3-tập-lệnh-linux--docker-từ-cơ-bản-đến-nâng-cao)
4. [Quy Trình Re-Deploy Khi Có Code Mới](#4-quy-trình-re-deploy-khi-có-code-mới)
5. [Quản Lý & Backup Cơ Sở Dữ Liệu PostgreSQL](#5-quản-lý--backup-cơ-sở-dữ-liệu-postgresql)
6. [Cấu Hình Tên Miền (Domain) & HTTPS (SSL Certbot)](#6-cấu-hình-tên-miền--https-ssl)
7. [Xử Lý Sự Cố Thường Gặp (Troubleshooting)](#7-xử-lý-sự-cố-thường-gặp)

---

## 1. TỔNG QUAN KIẾN TRÚC ĐÓNG GÓI

```text
                               ┌────────────────────────────────────────┐
                               │       NGƯỜI DÙNG (CLIENT BROWSER)      │
                               └───────────────────┬────────────────────┘
                                                   │ HTTP (Port 80) / HTTPS (Port 443)
                                                   ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ SERVER VPS LINUX (UBUNTU)                                                                   │
│                                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ DOCKER CONTAINER: tms_frontend (Nginx Alpine Web Server)                              │  │
│  │  • Phục vụ Static Files Angular SPA (Port 80)                                         │  │
│  │  • Reverse Proxy chuyển hướng /api/ ─────────────────────────────┐                    │  │
│  └──────────────────────────────────────────────────────────────┼────────────────────────┘  │
│                                                                 │                           │
│                                                                 ▼ (Internal Network)        │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ DOCKER CONTAINER: tms_backend (Java 21 Spring Boot Service - Port 8080)               │  │
│  └──────────────────────────────┬───────────────────────────────┬────────────────────────┘  │
│                                 │                               │                           │
│                                 ▼                               ▼                           │
│  ┌───────────────────────────────────────────────┐ ┌─────────────────────────────────────┐  │
│  │ DOCKER CONTAINER: tms_postgres (Port 5432)    │ │ DOCKER CONTAINER: tms_redis         │  │
│  │ Volume persistence: postgres_data             │ │ (Port 6379) - Cache & Session       │  │
│  └───────────────────────────────────────────────┘ └─────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. CẤU HÌNH MÔI TRƯỜNG & FILE GỐC

### 2.1. File `docker-compose.yml` (Đặt tại `/var/www/tms-app/docker-compose.yml` trên VPS)
```yaml
version: '3.8'

services:
  # 1. Cơ sở dữ liệu PostgreSQL
  postgres:
    image: postgres:16-alpine
    container_name: tms_postgres
    restart: always
    environment:
      POSTGRES_DB: tms01_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: rootpassword
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # 2. Hệ thống Cache Redis
  redis:
    image: redis:alpine
    container_name: tms_redis
    restart: always
    ports:
      - "6379:6379"

  # 3. Backend API Service (Spring Boot Java 21)
  backend:
    build:
      context: ./Backend-TMS01/tms01
      dockerfile: Dockerfile
    container_name: tms_backend
    restart: always
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/tms01_db
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: rootpassword
      SPRING_DATA_REDIS_HOST: redis
      SPRING_DATA_REDIS_PORT: 6379
    ports:
      - "8080:8080"
    depends_on:
      - postgres
      - redis

  # 4. Frontend Web App (Angular 19 + Nginx)
  frontend:
    build:
      context: ./Frontend-TMS01
      dockerfile: Dockerfile
    container_name: tms_frontend
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 2.2. File `nginx.conf` của Frontend (`Frontend-TMS01/nginx.conf`)
```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html; # Chống lỗi 404 khi F5 trang Angular SPA
    }

    location /api/ {
        proxy_pass http://backend:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 3. TẬP LỆNH LINUX & DOCKER TỪ CƠ BẢN ĐẾN NÂNG CAO

### 3.1. Nhóm lệnh Quản lý Docker & Docker Compose (Thường Dùng Nhất)

| Câu lệnh | Giải thích chi tiết & Công dụng |
| :--- | :--- |
| `cd /var/www/tms-app` | Di chuyển đến thư mục làm việc chính chứa `docker-compose.yml`. |
| `docker-compose up -d --build` | Biên dịch lại code mới và khởi chạy ứng dụng dưới nền (Detach mode). |
| `docker-compose ps` | Hiển thị danh sách và trạng thái hoạt động của tất cả container. |
| `docker-compose stop` | Tạm dừng tất cả container (dữ liệu vẫn được giữ nguyên). |
| `docker-compose start` | Bật lại tất cả container sau khi dừng. |
| `docker-compose restart` | Khởi động lại toàn bộ các dịch vụ. |
| `docker-compose down` | Dừng và xóa tất cả container & network (dữ liệu postgres_data vẫn an toàn). |
| `docker-compose down -v` | ⚠️ **CẢNH BÁO**: Xóa sạch container VÀ XÓA LUÔN dữ liệu volume database. |

### 3.2. Nhóm lệnh Xem Nhật Ký (Logs) & Debug Sự Cố

| Câu lệnh | Giải thích chi tiết & Công dụng |
| :--- | :--- |
| `docker logs -f tms_backend` | Xem trực tiếp nhật ký (Log) của Backend Spring Boot theo thời gian thực. *(Ấn `Ctrl + C` để thoát)*. |
| `docker logs -f tms_frontend` | Xem trực tiếp log truy cập/lỗi của Nginx Frontend. |
| `docker logs -n 100 tms_backend` | Xem 100 dòng log gần nhất của Backend. |
| `docker stats` | Bảng điều khiển thời gian thực theo dõi mức độ chiếm CPU, RAM, Network của từng container. |

### 3.3. Nhóm lệnh Quản Lý Tài Nguyên Máy Chủ VPS (Linux System)

| Câu lệnh | Giải thích chi tiết & Công dụng |
| :--- | :--- |
| `df -h /` | Kiểm tra dung lượng ổ cứng khả dụng của máy chủ. |
| `free -h` | Kiểm tra bộ nhớ RAM và bộ nhớ ảo SWAP (Đã dùng bao nhiêu / Còn trống bao nhiêu). |
| `top` hoặc `htop` | Xem danh sách các tiến trình hệ thống đang ngốn CPU/RAM nhiều nhất. |
| `docker system prune -af` | 🧹 **Dọn dẹp rác Docker**: Xóa các Image cũ, Container rác không dùng đến để giải phóng hàng GB dung lượng ổ cứng. |

### 3.4. Nhóm lệnh Thao Tác Trực Tiếp Bên Trong Container (Advanced)

| Câu lệnh | Giải thích chi tiết & Công dụng |
| :--- | :--- |
| `docker exec -it tms_backend sh` | Truy cập trực tiếp vào bên trong môi trường Linux của Backend Container. |
| `docker exec -it tms_postgres psql -U postgres -d tms01_db` | Đăng nhập trực tiếp vào SQL command line của cơ sở dữ liệu PostgreSQL. |
| `docker exec -it tms_redis redis-cli` | Đăng nhập vào màn hình quản trị lệnh Redis CLI. |

---

## 4. QUY TRÌNH RE-DEPLOY KHI CÓ CODE MỚI

Khi bạn phát triển tính năng mới ở máy cá nhân (Local) và muốn cập nhật lên VPS:

```bash
# BƯỚC 1: Ở máy Local, push code lên Git
git add .
git commit -m "feat: nâng cấp tính năng"
git push origin main

# BƯỚC 2: SSH vào VPS (ssh root@<IP_VPS>) và kéo code mới về
cd /var/www/tms-app/Frontend-TMS01 && git pull origin main
cd /var/www/tms-app/Backend-TMS01 && git pull origin main

# BƯỚC 3: Re-build & Khởi chạy lại hệ thống trên VPS
cd /var/www/tms-app
docker-compose up -d --build
```

---

## 5. QUẢN LÝ & BACKUP CƠ SỞ DỮ LIỆU POSTGRESQL

### 5.1. Xuất file Backup SQL (Dump Database out)
Chạy lệnh sau trên VPS để xuất toàn bộ cơ sở dữ liệu thành file `.sql`:
```bash
docker exec -t tms_postgres pg_dump -U postgres tms01_db > /var/www/tms-app/backup_$(date +%Y%m%d_%H%M%S).sql
```

### 5.2. Khôi phục dữ liệu từ file SQL (Restore Database)
```bash
cat backup_file.sql | docker exec -i tms_postgres psql -U postgres -d tms01_db
```

---

## 6. CẤU HÌNH TÊN MIỀN (DOMAIN) & HTTPS (SSL CERTBOT)

Khi bạn mua Tên miền (Ví dụ: `tmslogistics.vn`) và muốn trỏ về VPS bật HTTPS bảo mật:

### 6.1. Trỏ IP Tên miền
Vào trang quản trị Tên miền, thêm **A Record**:
- `Host: @` -> `Value: <Địa_chỉ_IP_VPS>`
- `Host: www` -> `Value: <Địa_chỉ_IP_VPS>`

### 6.2. Bật SSL Certbot Miễn Phí Trên VPS
```bash
# Cài đặt Certbot
apt install -y certbot python3-certbot-nginx

# Chạy Certbot lấy chứng chỉ SSL tự động cho Nginx
certbot --nginx -d tmslogistics.vn -d www.tmslogistics.vn
```

---

## 7. XỬ LÝ SỰ CỐ THƯỜNG GẶP (TROUBLESHOOTING)

| Hiện tượng sự cố | Nguyên nhân chính | Cách xử lý |
| :--- | :--- | :--- |
| **Không truy cập được Web qua IP** | Tường lửa (Firewall) chặn port 80 | Gõ lệnh mở port: `ufw allow 80/tcp && ufw allow 443/tcp` |
| **Báo lỗi "Cannot connect to Backend"** | Nginx Proxy chưa kết nối được Backend container | Kiểm tra log Backend: `docker logs -f tms_backend`. Kiểm tra xem Postgres đã `Up` chưa. |
| **Hết dung lượng ổ cứng VPS (Disk Full)** | Docker tích lũy Image & Log cũ | Chạy lệnh dọn rác: `docker system prune -af` |
| **Lỗi `ContainerConfig` khi gõ docker-compose** | Xung đột bản docker-compose cũ | Cập nhật file binary mới: <br> `curl -SL https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-x86_64 -o /usr/local/bin/docker-compose && chmod +x /usr/local/bin/docker-compose` |
