# 🚀 Frontend-Backend Integration Guide

## ✅ **Integration Complete!**

Your Next.js frontend is now fully integrated with the PHP CodeIgniter backend for static builds.

## 📁 **Project Structure**

```
inventory/
├── stocify/                    # Next.js Frontend (Static Build)
│   ├── src/
│   │   ├── app/               # App Router (no api folder)
│   │   ├── components/        # React Components
│   │   ├── lib/
│   │   │   └── api.ts         # API Client for CodeIgniter
│   │   └── stores/            # Zustand State Management
│   ├── out/                   # Static Build Output
│   └── next.config.ts         # Static Export Config
├── application/               # CodeIgniter Backend
│   ├── controllers/Api/       # API Controllers
│   ├── models/                # Database Models
│   └── config/                # Configuration
└── database_schema/           # SQL Schema Files
```

## 🔧 **Configuration**

### **Frontend Configuration:**
- ✅ **Next.js Config**: Configured for static export (`output: 'export'`)
- ✅ **API Client**: Points to `http://localhost/inventory`
- ✅ **Build Script**: `npm run build:static` creates static files in `out/` folder

### **Backend Configuration:**
- ✅ **Clean URLs**: `.htaccess` removes `index.php` from URLs
- ✅ **CORS Headers**: Allows frontend-backend communication
- ✅ **API Routes**: All endpoints working at `/api/*`

## 🚀 **Build & Deploy Process**

### **1. Build Static Frontend:**
```bash
cd stocify
npm run build:static
```

This creates a static build in the `stocify/out/` folder.

### **2. Deploy Frontend:**
Copy the contents of `stocify/out/` to your web server's document root.

### **3. Backend is Ready:**
Your CodeIgniter backend is already configured and running at `http://localhost/inventory`

## 🌐 **Environment Configuration**

### **Development:**
```bash
# Frontend runs on: http://localhost:3000
# Backend runs on: http://localhost/inventory
# API calls go to: http://localhost/inventory/api/*
```

### **Production:**
Update the API URL in your frontend:
```typescript
// In stocify/src/lib/api.ts
this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://yourdomain.com/inventory';
```

## 📡 **API Endpoints Working**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | User authentication |
| `/api/auth/logout` | POST | User logout |
| `/api/auth/me` | GET | Get current user |
| `/api/users` | GET/POST | User management |
| `/api/products` | GET/POST/PUT/DELETE | Product management |
| `/api/orders` | GET/POST/PUT/DELETE | Order management |
| `/api/stock` | GET/POST/PUT/DELETE | Stock management |
| `/api/categories` | GET/POST/PUT/DELETE | Category management |
| `/api/suppliers` | GET/POST/PUT/DELETE | Supplier management |
| `/api/roles` | GET/POST/PUT/DELETE | Role management |

## 🔄 **Data Flow**

1. **Frontend** (Static HTML/JS) → **API Client** → **CodeIgniter Backend** → **MySQL Database**
2. **Authentication**: JWT tokens stored in localStorage
3. **CORS**: Properly configured for cross-origin requests
4. **Data Format**: JSON responses match frontend expectations

## 🧪 **Testing Integration**

### **Test Backend:**
```bash
# Visit: http://localhost/inventory/test_api.php
# Or test individual endpoints:
curl http://localhost/inventory/api/roles
curl http://localhost/inventory/api/categories
curl http://localhost/inventory/api/suppliers
```

### **Test Frontend:**
```bash
cd stocify
npm run dev
# Visit: http://localhost:3000
# Login and test all features
```

## 📦 **Static Build Benefits**

- ✅ **No Server Required**: Frontend is pure HTML/CSS/JS
- ✅ **Fast Loading**: Static files load instantly
- ✅ **CDN Ready**: Can be deployed to any CDN
- ✅ **SEO Friendly**: Server-side rendering for static pages
- ✅ **Secure**: No server-side vulnerabilities in frontend

## 🚀 **Deployment Options**

### **Option 1: Same Server**
```
yourdomain.com/          # Frontend (static files)
yourdomain.com/inventory/ # Backend (CodeIgniter)
```

### **Option 2: Separate Servers**
```
frontend.yourdomain.com  # Frontend (static files)
api.yourdomain.com       # Backend (CodeIgniter)
```

### **Option 3: CDN + Backend**
```
CDN (Cloudflare, etc.)   # Frontend (static files)
yourdomain.com/inventory/ # Backend (CodeIgniter)
```

## 🔧 **Production Checklist**

- [ ] Update `NEXT_PUBLIC_API_URL` to production domain
- [ ] Build static frontend: `npm run build:static`
- [ ] Deploy frontend files to web server
- [ ] Configure web server for clean URLs
- [ ] Test all API endpoints
- [ ] Test authentication flow
- [ ] Test CRUD operations
- [ ] Configure SSL certificates
- [ ] Set up database backups

## 🎯 **Next Steps**

1. **Build Frontend**: Run `npm run build:static` in the `stocify` folder
2. **Deploy**: Copy `out/` folder contents to your web server
3. **Test**: Verify all functionality works in production
4. **Monitor**: Set up logging and monitoring for the backend

## 🏆 **Integration Complete!**

Your Next.js frontend and PHP CodeIgniter backend are now fully integrated and ready for production deployment as a static build!
