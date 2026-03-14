# 🛍️ Dashing E-commerce Platform

![Dashing E-commerce]()

## 📋 Overview

Dashing is a modern, full-stack e-commerce platform built for scalability and performance. It features a responsive Next.js frontend with TypeScript and a robust Spring Boot backend, all powered by a Supabase PostgreSQL database. The platform provides a seamless shopping experience with comprehensive admin management tools.

## ✨ Key Features

### For Customers
- 🛒 **Intuitive Shopping Cart** - Add, remove, and manage items in real-time
- ❤️ **Wishlist** - Save favorite products for later
- 🔍 **Advanced Product Search** - Filter by category, price, and more
- ⭐ **Product Reviews** - Rate and review purchased products
- 📱 **Responsive Design** - Perfect experience on desktop, tablet, and mobile
- 🔐 **Secure Authentication** - User accounts with JWT-based security

### For Sellers
- 📊 **Seller Dashboard** - Track sales, inventory, and performance
- 📦 **Product Management** - Add, edit, and manage product listings
- 📈 **Sales Analytics** - View revenue, popular products, and trends
- 📋 **Order Fulfillment** - Process and update customer orders

### For Administrators
- 🖥️ **Admin Dashboard** - Complete platform oversight
- 👥 **User Management** - Manage customers, sellers, and permissions
- 📝 **Order Management** - View and update all orders
- ⭐ **Review Moderation** - Approve or reject product reviews
- 📬 **Message Center** - Handle customer inquiries
- 📞 **Contact Info Management** - Update business contact details
- 👨‍💼 **Team Management** - Manage team members and founders

## 🏗️ Architecture

### Frontend (Vercel)
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Form Handling**: React Hook Form with Zod validation
- **API Client**: Axios with typed services
- **UI Components**: Headless UI + Custom components
- **Authentication**: JWT-based with secure token storage

### Backend (Fly.io)
- **Framework**: Spring Boot 3
- **Language**: Java 17
- **Security**: Spring Security with JWT
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Spring Data JPA
- **API Documentation**: OpenAPI/Swagger
- **File Storage**: Local filesystem (configurable for cloud)
- **Email**: JavaMail for notifications

### Database (Supabase)
- **Type**: PostgreSQL
- **Features**: Row Level Security, Real-time subscriptions
- **Tables**: Users, Products, Orders, Reviews, Team Members, Contact Messages

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Java 17+
- Maven
- Supabase account
- Git

### Frontend Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd dashing-ecommerce/frontend

# Install dependencies
npm install

# Create .env.local file and add your environment variables
cp .env.example .env.local

# Start development server
npm run dev
