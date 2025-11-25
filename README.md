# E-Commerce Product Management System

A modern, full-featured product management dashboard built with Vue 3, TypeScript, and Vite. This application provides a complete admin interface for managing products with authentication, CRUD operations, search, filtering, sorting, and more.

## 🚀 Features

- **Authentication** - Secure login with JWT token management
- **Product Management** - Full CRUD operations (Create, Read, Update, Delete)
- **Advanced Filtering** - Search, category filters, and stock status filters
- **Sorting** - Sort by title, category, price, or stock
- **Pagination** - Efficient data loading with customizable page sizes
- **Product Details** - Comprehensive product view with reviews and ratings
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Dark Mode Support** - Built-in dark theme support
- **Toast Notifications** - User-friendly feedback for all actions
- **Category Color Coding** - Consistent color-coded categories with localStorage persistence

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18.0.0 or higher)
- **pnpm** (v8.0.0 or higher)

To install pnpm globally:
```bash
npm install -g pnpm
```

## 🛠️ Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ecommerce
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Environment Configuration

This project uses the DummyJSON API (https://dummyjson.com) and requires no additional environment variables. All API endpoints are configured in `/src/lib/api.ts`.

**(Optional)** If you need to customize API endpoints, create a `.env` file:
```env
VITE_API_BASE_URL=https://dummyjson.com
```

### 4. Run Development Server
```bash
pnpm run dev
```

The application will be available at `http://localhost:5173`

### 5. Build for Production
```bash
pnpm run build
```

### 6. Preview Production Build
```bash
pnpm run preview
```

## 🔐 Login Credentials

Use any of these test accounts from DummyJSON:

| Username | Password |
|----------|----------|
| emilys | emilyspass |
| michaelw | michaelwpass |
| sophiab | sophiabpass |

## 📁 Project Structure

```
ecommerce/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Shadcn-vue components (Button, Card, etc.)
│   │   ├── AppSidebar.vue  # Application sidebar navigation
│   │   ├── ReviewCarousel.vue
│   │   └── ReviewsDialog.vue
│   │
│   ├── composables/        # Reusable Vue composables
│   │   ├── useCategories.ts      # Category management
│   │   └── useCategoryColors.ts  # Category color persistence
│   │
│   ├── layouts/            # Layout components
│   │   ├── DashboardLayout.vue   # Main dashboard layout with sidebar
│   │   └── HeaderLayout.vue      # Header-only layout
│   │
│   ├── lib/                # Utility libraries
│   │   ├── api.ts          # API utilities and endpoints
│   │   ├── constants.ts    # App-wide constants
│   │   └── utils.ts        # Helper functions
│   │
│   ├── pages/              # Route pages
│   │   ├── login/          # Authentication page
│   │   └── products/       # Product management pages
│   │       ├── index.vue   # Products list with table
│   │       ├── details.vue # Single product details
│   │       └── new.vue     # Add/Edit product form
│   │
│   ├── router/             # Vue Router configuration
│   │   └── index.ts
│   │
│   ├── stores/             # Pinia state management
│   │   ├── auth.ts         # Authentication state
│   │   └── products.ts     # Products state and actions
│   │
│   ├── types/              # TypeScript type definitions
│   │   ├── product.ts
│   │   └── review.ts
│   │
│   ├── App.vue             # Root component
│   └── main.ts             # Application entry point
│
├── public/                 # Static assets
├── .env                    # Environment variables (optional)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🏗️ Architecture Overview

### **Layered Architecture**
```
┌─────────────────────────────────────┐
│         Components/Pages            │  ← Presentation Layer
├─────────────────────────────────────┤
│    Composables & Stores (Pinia)    │  ← Business Logic Layer
├─────────────────────────────────────┤
│       API Utilities (/lib/api)      │  ← Data Access Layer
├─────────────────────────────────────┤
│     External API (DummyJSON)       │  ← External Services
└─────────────────────────────────────┘
```

### **State Management**
- **Pinia** for global state management
- **Composables** for reusable stateful logic
- **LocalStorage** for authentication and preferences persistence

### **Routing**
- **Vue Router** with route guards
- **Lazy loading** for code splitting
- **Nested layouts** for different page types

### **API Integration**
- Centralized API utilities in `/src/lib/api.ts`
- Automatic authentication header injection
- Type-safe API calls with TypeScript generics

## ⚠️ Important Assumptions & API Behavior

### **DummyJSON API Limitations**

This application uses the DummyJSON API (https://dummyjson.com), which is a **fake REST API** for testing and prototyping. Please note the following important behaviors:

#### **1. Simulated CRUD Operations**
The API **simulates** Create, Update, and Delete operations but **does not persist changes** to the actual database. This means:

- ✅ **Create/Update/Delete requests return success responses**
- ❌ **Changes are NOT actually saved on the server**
- ⚠️ **Data resets on every fetch**

#### **2. Optimistic Updates**
To provide a realistic user experience, the application uses **optimistic updates**:

```javascript
// Example: Deleting a product
1. User clicks "Delete" → Product removed from UI immediately
2. API request sent → Returns success (simulated)
3. Store updated → Product removed from Pinia store
4. Next fetch → Product reappears (because it was never actually deleted)
```

**This is expected behavior** and demonstrates how the application would work with a real API.

#### **3. Data Consistency**
- **Products list** refreshes on every navigation
- **Filters, search, and sorting** work correctly (server-side)
- **Created/Updated products** may disappear after page refresh
- **Deleted products** will reappear after refresh

#### **4. Authentication**
- Login uses real JWT tokens from DummyJSON
- Tokens are stored in localStorage
- All product endpoints require authentication headers
- Session persists across page refreshes

### **Production Considerations**

When integrating with a **real backend API**, you should:

1. ✅ Replace API endpoints in `/src/lib/api.ts`
2. ✅ Update API response types in `/src/types/`
3. ✅ Remove optimistic updates if using server-side validation
4. ✅ Add proper error handling for network failures
5. ✅ Implement data caching strategies
6. ✅ Add request retry logic
7. ✅ Configure CORS properly

## 🎨 Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Next-generation frontend tooling
- **Pinia** - State management
- **Vue Router** - Official router
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn-vue** - Re-usable component library
- **Radix Vue** - Unstyled, accessible components
- **Lucide Vue** - Beautiful icon library
- **Vue Sonner** - Toast notifications

## 📝 Available Scripts

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview

# Type-check
pnpm run type-check

# Lint code
pnpm run lint

# Format code
pnpm run format
```

## 🔑 Key Features Explained

### **Authentication Flow**
1. User logs in with credentials
2. JWT token received and stored in localStorage
3. Token automatically attached to all API requests
4. Session restored on page refresh
5. Protected routes redirect to login if not authenticated

### **Product Management**
- **List View** - Paginated table with search, filters, and sorting
- **Detail View** - Full product information with reviews
- **Create/Edit** - Comprehensive form with validation
- **Delete** - Confirmation dialog with toast feedback

### **Category Colors**
- Each category is assigned a unique color on first view
- Colors persist in localStorage across sessions
- Consistent colors across all pages (list, details, forms)
- 18 predefined color schemes available

### **Responsive Design**
- Mobile-first approach
- Collapsible sidebar on mobile
- Touch-friendly interactions
- Optimized for all screen sizes

## 🐛 Known Issues

1. **Products reappear after deletion** - This is due to the DummyJSON API simulation (see Assumptions section)
2. **Created products don't persist** - Same API limitation
3. **Image uploads are simulated** - Files are selected but not actually uploaded
