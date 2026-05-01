# Grocery

**Khoá luận Tốt nghiệp - Năm học 2025–2026**

Khoa Toán — Tin · Trường Đại học Sư phạm · Đại học Đà Nẵng


Dự án `Grocery` là một hệ thống thương mại điện tử gồm 3 thành phần chính:
- `backend`: API server Node.js + Express xử lý dữ liệu, xác thực, thanh toán, upload ảnh và trí tuệ nhân tạo.
- `admin`: giao diện quản trị dashboard React + Vite cho quản lý đơn hàng, sản phẩm, khách hàng, mã giảm giá và banner.
- `mobile`: ứng dụng di động Expo React Native cho người dùng cuối, hỗ trợ đăng nhập, giỏ hàng, thanh toán Stripe, quản lý địa chỉ và chat AI.

## Mục lục

- [Giới thiệu](#grocery)
- [Mục tiêu dự án](#mục-tiêu-dự-án)
- [Kiến trúc dự án](#kiến-trúc-dự-án)
- [Các thành phần chính](#các-thành-phần-chính)
- [Yêu cầu môi trường](#yêu-cầu-môi-trường)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cài đặt](#cài-đặt)
- [Chạy ứng dụng](#chạy-ứng-dụng)
- [Biến môi trường](#biến-môi-trường)
- [Cấu hình API Mobile](#cấu-hình-api-mobile)
- [Tính năng nổi bật](#tính-năng-nổi-bật)
- [Triển khai](#triển-khai)
- [Ghi chú](#ghi-chú)

## Mục tiêu dự án

Dự án nhằm xây dựng một hệ thống bán lẻ tạp hóa số với:
- Giao diện quản trị dễ dùng cho nhân viên và quản trị viên.
- Ứng dụng di động tiện lợi cho khách hàng.
- Hệ thống thanh toán và giỏ hàng hoạt động đầy đủ.
- Tích hợp xác thực người dùng, upload ảnh và AI hỗ trợ mua sắm.

## Kiến trúc dự án

```
Grocery/
├─ backend/         # Express API server
│  ├─ src/
│  │  ├─ config/
│  │  ├─ controllers/
│  │  ├─ middleware/
│  │  ├─ models/
│  │  ├─ routes/
│  │  ├─ seeds/
│  │  └─ server.js
│  └─ package.json
├─ admin/           # React + Vite admin dashboard
│  ├─ src/
│  │  ├─ components/
│  │  ├─ layouts/
│  │  ├─ lib/
│  │  └─ pages/
│  └─ package.json
└─ mobile/          # Expo React Native app
   ├─ app/
   ├─ assets/
   ├─ components/
   ├─ hooks/
   ├─ lib/
   ├─ services/
   ├─ types/
   └─ package.json
```

## Các thành phần chính

### Backend
- Node.js + Express
- MongoDB qua Mongoose
- Xác thực người dùng bằng Clerk
- Thanh toán với Stripe
- Upload ảnh sản phẩm qua Cloudinary
- Xử lý webhook Stripe
- Tích hợp Inngest cho event processing
- Tích hợp Google Gemini AI cho chatbot
- Hỗ trợ API: users, products, cart, orders, payment, coupons, banners, comments, reviews, notifications, AI

### Admin dashboard
- React + Vite
- Clerk auth cho quản trị viên
- Quản lý:
  - Sản phẩm
  - Đơn hàng
  - Khách hàng
  - Mã giảm giá
  - Banner
- Dashboard hiển thị biểu đồ doanh thu, trạng thái đơn hàng, sản phẩm bán chạy

### Mobile app
- Expo Router + React Native
- Clerk auth cho người dùng
- Stripe Payment Sheet
- React Query để quản lý dữ liệu
- NativeWind + Tailwind CSS
- Tính năng:
  - Duyệt sản phẩm
  - Thêm/xóa/ sửa giỏ hàng
  - Nhập mã giảm giá
  - Chọn địa chỉ giao hàng
  - Thanh toán
  - Chat AI
  - Bình luận và đánh giá
  - Thông báo

## Yêu cầu môi trường

- Node.js >= 20
- npm
- MongoDB (hoặc MongoDB Atlas)
- Tài khoản Clerk
- Tài khoản Stripe
- Tài khoản Cloudinary
- Khóa Google Gemini AI
- Khóa Inngest

## Công nghệ sử dụng

- Backend: Node.js, Express, Mongoose, Clerk, Stripe, Cloudinary, Inngest, Google Gemini AI
- Admin: React, Vite, Clerk React, React Query, Tailwind CSS
- Mobile: Expo, Expo Router, React Native, Clerk Expo, Stripe React Native, React Query, NativeWind

## Cài đặt

### 1. Backend
```bash
cd backend
npm install
```

### 2. Admin
```bash
cd admin
npm install
```

### 3. Mobile
```bash
cd mobile
npm install
```

> Lưu ý: root `package.json` chỉ định cấu hình build cho backend và admin. Nếu cần chạy app mobile, hãy cài đặt trong thư mục `mobile/`.

## Chạy ứng dụng

### Backend
```bash
cd backend
npm run dev
```

hoặc

```bash
cd backend
npm start
```

### Admin dashboard
```bash
cd admin
npm run dev
```

### Mobile app
```bash
cd mobile
npm start
```

## Biến môi trường

### Backend
Tạo file `backend/.env` và cấu hình các biến sau:

- `NODE_ENV`
- `PORT`
- `DB_URL`
- `CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `INNGEST_SIGNING_KEY`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `ADMIN_EMAIL`
- `CLIENT_URL`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `GEMINI_API_KEY`

### Admin
Tạo file `admin/.env` với:

- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_API_URL` (ví dụ: `http://localhost:5000/api`)
- `VITE_ADMIN_EMAIL`

### Mobile
Tạo file `mobile/.env` với:

- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`

## Cấu hình API Mobile

File mobile sử dụng endpoint backend tại:
- `mobile/lib/api.ts`

Nếu chạy backend cục bộ, hãy thay đổi `API_URL` trong file này về `http://localhost:5000/api` hoặc URL backend phù hợp.

## Tính năng nổi bật

### Backend
- Xác thực người dùng bằng Clerk
- Quản lý sản phẩm, đơn hàng, giỏ hàng
- Hỗ trợ upload ảnh sản phẩm với Cloudinary
- Thanh toán qua Stripe Payment Intent
- Xử lý webhook Stripe
- Tích hợp AI để trả lời dựa trên thông tin đơn hàng và giỏ hàng

### Admin
- Dashboard thống kê doanh thu, đơn hàng, khách hàng, sản phẩm
- Quản lý CRUD sản phẩm
- Quản lý mã giảm giá và banner
- Quản lý khách hàng và đơn hàng

### Mobile
- Tương tác giỏ hàng và cập nhật số lượng
- Thanh toán an toàn với Stripe
- Chọn địa chỉ giao hàng
- Thêm bình luận, đánh giá
- Nhận thông báo
- Chat AI hỗ trợ mua sắm

## Triển khai

- Backend có thể triển khai lên Render, Heroku, Vercel Serverless hoặc VPS.
- Admin có thể build bằng `npm run build --prefix admin` và deploy tệp `admin/dist`.
- Mobile có thể chạy bằng Expo hoặc build APK/IPA.

## Ghi chú

- Đừng commit `backend/.env`, `admin/.env`, `mobile/.env` chứa thông tin bí mật.
- Kiểm tra cấu hình `CLIENT_URL` trong backend để cho phép CORS đúng với địa chỉ frontend.
- Với mobile chạy local, cần đồng bộ `API_URL` của backend và gói auth Clerk.

*© 2026 — Khoá luận tốt nghiệp ngành Công nghệ Thông tin*
*Khoa Toán — Tin · Trường Đại học Sư phạm · Đại học Đà Nẵng*
*Mã nguồn được phát hành cho mục đích học thuật (Academic Use Only).*
