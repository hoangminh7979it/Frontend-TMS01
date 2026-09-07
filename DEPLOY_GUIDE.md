# 📖 HUẤN LUYỆN TỪ A ĐẾN Z: QUY TRÌNH CẬP NHẬT CODE & RE-DEPLOY DỰ ÁN TMS-01 LÊN VPS

Tài liệu này hướng dẫn chi tiết quy trình cập nhật mã nguồn (Backend / Frontend) từ máy cá nhân lên Server VPS Vietnix khi bạn phát triển thêm tính năng mới hoặc sửa lỗi.

---

## 📌 QUY TRÌNH 3 BƯỚC CẬP NHẬT DỰ ÁN

```text
┌─────────────────────────────┐        Git Push        ┌─────────────────────────────┐
│  MÁY CÁ NHÂN (DEV LOCAL)    │ ─────────────────────► │     GITHUB REPOSITORIES     │
│  Sửa code, test ở máy tính  │                        │ (Backend & Frontend Repos)  │
└─────────────────────────────┘                        └──────────────┬──────────────┘
                                                                      │
                                                                      │ Git Pull & Build
                                                                      ▼
                                                       ┌─────────────────────────────┐
                                                       │   SERVER VPS (PRODUCTION)   │
                                                       │ docker-compose up -d --build│
                                                       └─────────────────────────────┘
```

---

## 💻 BƯỚC 1: LÀM VIỆC TẠI MÁY CÁ NHÂN (LOCAL COMPUTER)

Sau khi bạn sửa code, thêm giao diện hoặc viết thêm API mới ở máy tính của mình và đã test mượt mà:

### 1.1. Push code Frontend (nếu có sửa Frontend)
Mở Terminal tại thư mục `Frontend-TMS01`:
```bash
git add .
git commit -m "feat: cập nhật giao diện mới / tính năng mới"
git push origin main
```

### 1.2. Push code Backend (nếu có sửa Backend)
Mở Terminal tại thư mục `Backend-TMS01`:
```bash
git add .
git commit -m "feat: bổ sung API mới / sửa lỗi logic"
git push origin main
```

---

## 🖥️ BƯỚC 2: CẬP NHẬT CODE VÀ CHẠY LẠI TRÊN SERVER VPS

Mở **PowerShell** trên máy tính của bạn và kết nối SSH vào VPS:

```powershell
ssh root@<Địa_Chỉ_IP_VPS_Của_Bạn>
```

### 🚀 TRƯỜNG HỢP A: Nếu chỉ cập nhật Frontend (Giao diện Angular)
Copy dán nguyên khối lệnh sau vào VPS:

```bash
cd /var/www/tms-app/Frontend-TMS01
git pull origin main

cd /var/www/tms-app
docker-compose up -d --build frontend
```

### 🚀 TRƯỜNG HỢP B: Nếu chỉ cập nhật Backend (API Spring Boot)
Copy dán nguyên khối lệnh sau vào VPS:

```bash
cd /var/www/tms-app/Backend-TMS01
git pull origin main

cd /var/www/tms-app
docker-compose up -d --build backend
```

### 🚀 TRƯỜNG HỢP C: Cập nhật cả Frontend và Backend (Cả hệ thống)
Copy dán nguyên khối lệnh sau vào VPS:

```bash
cd /var/www/tms-app/Frontend-TMS01 && git pull origin main
cd /var/www/tms-app/Backend-TMS01 && git pull origin main

cd /var/www/tms-app
docker-compose up -d --build
```

---

## 🔍 BƯỚC 3: KIỂM TRA HỆ THỐNG SAU KHI CẬP NHẬT

### 3.1. Kiểm tra trạng thái các Container:
```bash
cd /var/www/tms-app
docker-compose ps
```
*(Đảm bảo cả 4 container `tms_frontend`, `tms_backend`, `tms_postgres`, `tms_redis` đều ghi trạng thái `running` hoặc `Up`).*

### 3.2. Xem nhật ký hoạt động (Logs) nếu xảy ra lỗi:
- xem log Backend: `docker logs -f tms_backend`
- Xem log Frontend: `docker logs -f tms_frontend`
- *(Nhấn `Ctrl + C` để thoát khỏi màn hình xem log).*

---

## 🛠️ MỘT SỐ CÂU LỆNH QUẢN TRỊ VPS HỮU ÍCH THƯỜNG DÙNG

| Thao tác | Câu lệnh Linux |
| :--- | :--- |
| **Kiểm tra dung lượng ổ cứng** | `df -h /` |
| **Kiểm tra dung lượng RAM** | `free -h` |
| **Xem mức độ ngốn CPU/RAM của Docker** | `docker stats` |
| **Khởi chạy lại toàn bộ hệ thống** | `cd /var/www/tms-app && docker-compose restart` |
| **Dừng tạm thời hệ thống** | `cd /var/www/tms-app && docker-compose stop` |
| **Bật lại hệ thống sau khi dừng** | `cd /var/www/tms-app && docker-compose start` |

---

### 🔒 NGUYÊN TẮC AN TOÀN DỮ LIỆU:
- Mọi câu lệnh `docker-compose up -d --build` hay `docker-compose restart` **ĐỀU GIỮ NGUYÊN 100% DỮ LIỆU** đơn hàng, đội xe, tài khoản trong PostgreSQL. Dữ liệu chỉ mất nếu bạn chủ động xóa thư mục volume của Docker.
