# Thrift Store - Pre-loved Fashion Marketplace

A full-stack MERN e-commerce platform for buying and selling pre-loved fashion items.

## Features

- 🛍️ Browse products with advanced filtering (category, gender, price, condition)
- 👤 User authentication (local & Google OAuth)
- 💰 Product listing with image upload
- 🛒 Shopping cart functionality
- 📦 Order management system
- 💳 Razorpay payment integration
- 👔 Separate Men's & Women's collections
- 📱 Responsive design
- 🔔 Real-time toast notifications

## Tech Stack

**Frontend:**
- React.js
- React Router
- Tailwind CSS
- Axios

**Backend:**
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Passport.js (Google OAuth)

**Services:**
- Cloudinary (Image hosting)
- Razorpay (Payments)
- MongoDB Atlas (Database)

## Installation

### Prerequisites
- Node.js (v14+)
- MongoDB
- npm or yarn

### Backend Setup

```bash
cd thrift-store-backend
npm install

# Create .env file with:
# MONGO_URI=your_mongodb_uri
# JWT_SECRET=your_jwt_secret
# GOOGLE_CLIENT_ID=your_google_client_id
# GOOGLE_CLIENT_SECRET=your_google_client_secret
# CLOUDINARY_CLOUD_NAME=your_cloudinary_name
# CLOUDINARY_API_KEY=your_cloudinary_key
# CLOUDINARY_API_SECRET=your_cloudinary_secret

npm start
```

### Frontend Setup

```bash
cd thrift-store-frontend
npm install
npm start
```

The app will run on:
- Frontend: http://localhost:3000
- Backend: http://localhost:5001

## Deployment

### Recommended: Vercel (Frontend) + Render (Backend)

**Frontend (Vercel):**
1. Push to GitHub
2. Import project on vercel.com
3. Set root directory: `thrift-store-frontend`
4. Add environment variable: `REACT_APP_API_URL`

**Backend (Render):**
1. Create web service on render.com
2. Set root directory: `thrift-store-backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all environment variables

## Project Structure

```
thrift-store/
├── thrift-store-frontend/    # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   └── public/
└── thrift-store-backend/      # Express backend
    ├── src/
    │   ├── config/
    │   ├── controllers/
    │   ├── middleware/
    │   ├── models/
    │   └── routes/
    └── uploads/
```

## License

MIT

## Author

priyanshu23
