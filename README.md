# AfterGoodHours

A marketplace for hostel residents to buy and sell everyday items within their
community.

## Problem Statement

In hostels, students often have extra snacks, beverages, fruits, stationery, and other items that only their close friends know about. A student in need of a specific item may not find it even though someone nearby has it. There's no structured way for hostel residents to discover and exchange goods.

## Target Users

Students living in hostels/dorms who want to:
- **Sell** their extra items quickly to nearby residents
- **Buy** everyday items without going to a store

## Solution

AfterGoodHours lets students list items for sale and browse, filter, and purchase
items from other residents. A seller's room number is shown to the buyer only
after payment is verified.

## Key Features

- JWT authentication using httpOnly cookies
- Product listings with images, prices, quantities, and categories
- Product search, category filters, and sorting
- Shopping cart with quantity controls
- Razorpay payment flow (configure test credentials for local development)
- Seller room details revealed only after payment verification
- Socket.IO order notifications
- Buyer reviews for completed orders
- Seller dashboard for managing listings and incoming orders
- Responsive layout for mobile and desktop

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite |
| State Management | Redux Toolkit |
| Styling | Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB Atlas + Mongoose |
| Authentication | JWT + httpOnly Cookies |
| Media Storage | Cloudinary |
| Payments | Razorpay |
| Real-time | Socket.IO |
| Deployment | Vercel (frontend) + Render (backend) |

## Architecture

```
Browser (React + Vite)
        │
        ├── REST API (Axios, withCredentials)
        │
        └── WebSocket (Socket.IO)
                │
                ▼
        Express + Node.js (Render)
                │
        ┌───────┴────────┐
        ▼                ▼
  MongoDB Atlas      Cloudinary
  (Data)             (Images)
```

### Major Components

- **Auth** — register/login/logout, JWT in httpOnly cookie, profile management
- **Products** — CRUD listings, Cloudinary image upload, category/search/filter/pagination
- **Cart** — per-user cart with quantity validation against live stock
- **Orders** — Razorpay order creation → signature verification → order creation → stock decrement
- **Socket.IO** — real-time seller notifications on new orders, buyer notifications on status changes
- **Reviews** — post-completion buyer reviews update seller's average rating

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- MongoDB connection string
- Cloudinary account
- Razorpay account (use test credentials for local development)

### Install dependencies

```bash
npm install --prefix backend
npm install --prefix frontend/vite-project
```

### Configure environment variables

```bash
cp backend/.env.example backend/.env
cp frontend/vite-project/.env.example frontend/vite-project/.env
```

On Windows PowerShell, use `Copy-Item` in place of `cp`. Set the values in both
`.env` files using the variable names listed below. Do not commit `.env` files
or production credentials.

### Run the application

Start the backend from the repository root:
```bash
npm run dev:backend
```

In a second terminal, start the frontend:

```bash
npm run dev
```

The frontend is available at `http://localhost:5173`; the backend runs on
`http://localhost:8084` by default.

To load sample listings, run `node seed.js` from the `backend` directory after
configuring its `.env` file. **The seed script deletes all existing product
listings before inserting sample data.**

### Build and lint

Run these commands from the repository root:

```bash
npm run build
npm run lint
```

## Environment Variables

### Backend (`backend/.env`)

```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-strong-secret
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
CLIENT_URL=http://localhost:5173
NODE_ENV=development
PORT=8084
```

### Frontend (`frontend/vite-project/.env`)

```env
VITE_API_URL=http://localhost:8084
VITE_RAZORPAY_KEY_ID=rzp_test_...
```

## Deployment

- **Frontend**: [Vercel](https://vercel.com), with `frontend/vite-project` as the root directory
- **Backend**: [Render](https://render.com), with `backend` as the root directory and `npm start` as the start command
- **Database**: MongoDB Atlas
- **Media storage**: Cloudinary

## API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/me | Get current user |
| GET | /api/products | Browse products (search, filter, paginate) |
| POST | /api/products | Create listing |
| GET | /api/products/:id | Get product detail |
| PUT | /api/products/:id | Update listing |
| DELETE | /api/products/:id | Delete listing |
| GET | /api/cart | Get user's cart |
| POST | /api/cart/add | Add to cart |
| PUT | /api/cart/update | Update quantity |
| DELETE | /api/cart/remove/:id | Remove item |
| POST | /api/orders/create-razorpay-order | Initiate payment |
| POST | /api/orders/verify-payment | Verify & create order |
| GET | /api/orders/buyer | Buyer's orders |
| GET | /api/orders/seller | Seller's orders |
| PUT | /api/orders/:id/status | Update order status |
| POST | /api/reviews | Submit review |
| GET | /api/reviews/seller/:id | Get seller reviews |
