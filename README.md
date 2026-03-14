# Kalchakra Learning Academy - Course Selling Platform

A full-stack course selling platform similar to CodeWithHarry, built with modern web technologies.

## 🚀 Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **React Toastify** - Toast notifications
- **React Player** - Video player component

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Razorpay** - Payment gateway integration

### Deployment
- **Vercel** - Frontend deployment
- **Railway/Render** - Backend deployment

## 📋 Features

### Core Features
- ✅ User authentication (JWT)
- ✅ Course catalog with search and filters
- ✅ Course detail pages with curriculum
- ✅ Razorpay payment integration
- ✅ Student dashboard with enrolled courses
- ✅ Admin panel for course management
- ✅ Order management system

### UI/UX Features
- ✅ Modern, responsive design
- ✅ Dark mode support
- ✅ Smooth animations
- ✅ Mobile-first approach
- ✅ Clean coding education theme

### Security Features
- ✅ Password hashing with bcrypt
- ✅ JWT authentication
- ✅ Protected API routes
- ✅ Input validation

## 🏗️ Project Structure

```
kalchakra-learning-academy/
├── backend/
│   ├── controllers/     # Route controllers
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── config/         # Configuration files
│   ├── server.js       # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/        # Next.js app router pages
│   │   ├── components/ # Reusable components
│   │   ├── contexts/   # React contexts
│   │   └── utils/      # Utility functions
│   ├── public/         # Static assets
│   └── package.json
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Git

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in backend root:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
EMAIL_FROM=noreply@kalchakra.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
PORT=5000
```

4. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file in frontend root:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
```

4. Start the development server:
```bash
npm run dev
```

## 📊 Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  enrolledCourses: [ObjectId],
  role: String (student/admin),
  isEmailVerified: Boolean,
  // timestamps
}
```

### Course Model
```javascript
{
  title: String,
  description: String,
  price: Number,
  instructor: ObjectId,
  thumbnail: String,
  modules: [ObjectId],
  category: String,
  level: String,
  duration: Number,
  previewVideo: String,
  isPublished: Boolean,
  enrolledStudents: [ObjectId],
  averageRating: Number,
  totalReviews: Number,
  // timestamps
}
```

### Order Model
```javascript
{
  user: ObjectId,
  course: ObjectId,
  paymentId: String,
  orderId: String,
  amount: Number,
  status: String,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  // timestamps
}
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get single course
- `POST /api/courses` - Create course (Admin)
- `PUT /api/courses/:id` - Update course (Admin)
- `DELETE /api/courses/:id` - Delete course (Admin)

### Payments
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment
- `GET /api/payment/orders` - Get user orders
- `GET /api/payment/admin/orders` - Get all orders (Admin)

## 🚀 Deployment

### Frontend (Vercel)
1. Push your frontend code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Backend (Railway/Render)
1. Push your backend code to GitHub
2. Connect to Railway or Render
3. Set environment variables
4. Deploy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 📞 Support

For support, email support@kalchakra.com or join our Discord community.

---

Built with ❤️ by the Kalchakra Learning Academy team  "Harish"