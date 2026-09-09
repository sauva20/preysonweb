# PREYSON MOTO COMPANY — Web Application Platform

> Official web platform, e-commerce storefront, and back-office management suite for **Preyson Moto Company** (`preysonmotocompany`).

---

## Project Overview

**Preyson Moto Company** is a commercial digital platform crafted to deliver a seamless shopping experience for motorcycle enthusiasts alongside a high-efficiency administration suite. 

The platform integrates a customer-facing storefront (catalog browsing, dynamic cart, checkout, order tracking, customer portal) with an internal enterprise back-office (Point of Sale / POS, inventory management, real-time order processing, marketing campaigns, discounts, reports, and activity logs).

### Project Type

**Solo Project**  
Designed, architected, and developed by **Prabu Alam Tian Try Suherman** — Lead Architect & Full-Stack Master.

This project is an independent commercial initiative for the brand **Preyson Moto Company**, engineered from concept to production to demonstrate high-standard web application architecture, robust real-time communication, and responsive UI/UX.

---

## Core System Architecture & Features

### 1. Customer Storefront
- **Dynamic Catalog & Filtering**: Fast product exploration with categorized navigation, sorting, and live search.
- **Product Details & Variant Selection**: Multi-angle product imagery, size/color variant matrix, live stock indicators, and specifications.
- **Cart & Smooth Checkout**: Persistent client-side cart, automated shipping/tax calculation, and secure checkout workflow.
- **Payment Gateway Integration**: Direct integration with Midtrans for automated payment settlement, snap tokens, and instant callbacks.
- **Order Tracking & Customer Portal**: Real-time status lookup, customer authentication (JWT session management, password recovery), and historical invoices.

### 2. Point of Sale (POS) & Retail Operations
- **High-Speed Cashier Terminal**: Fast item addition, barcode and QR code lookup, live tax/discount computation.
- **Receipt & Thermal Printing**: Built-in thermal printer output and invoice generation for physical store transactions.
- **Hybrid Multi-Channel Inventory**: Synchronized stock levels between in-store POS transactions and online e-commerce sales.

### 3. Administration & Business Intelligence
- **Real-Time Order Monitoring**: Real-time order dispatch and notifications powered by WebSockets (`Socket.IO`).
- **Product & Inventory Management**: Drag-and-drop sortable lists (`@dnd-kit`), SKU management, variant matrix, and automated low-stock warnings.
- **Marketing & Promotions**: Campaign banner scheduler and customizable discount vouchers/rules.
- **Analytics & Reporting**: Sales revenue breakdown, top-performing items, customer demographics, and exportable financial reports.
- **Security & Audit Logs**: Role-based access control, secure authentication guard, and comprehensive activity logging for administrative accountability.

---

## Evidence-Based Technology Stack

Every technology in this repository was selected and integrated to fulfill specific performance and architectural requirements:

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19**, **Vite** | Modern, component-driven UI with blazing-fast build times and HMR |
| **Routing** | **React Router v7** | Client-side routing with guarded admin layouts and customer portals |
| **Real-time Protocol** | **Socket.io-Client** | Instant bidirectional synchronization for live orders and order status alerts |
| **PWA Capabilities** | **Vite Plugin PWA** | Progressive Web App offline caching, service workers, and installability |
| **UI Components & UX** | **Lucide React**, **SweetAlert2**, **Dnd-kit** | Clean iconography, interactive modal alerts, and intuitive drag-and-drop reordering |
| **Identification & QR** | **qrcode.react**, **react-barcode** | Dynamic barcode and QR generation for order receipts and inventory labels |
| **Styling** | **Custom CSS (Modular & Responsive)** | Tailored styling system with responsive breakpoints and unified dark/light themes |
| **Backend Ecosystem** | **Node.js / Express**, **Prisma ORM**, **MySQL** | RESTful API architecture, relational database modeling, and transactional reliability |

---

## Repository Structure

```text
preysonweb/
├── public/                # Static assets, manifests, and icons
├── src/
│   ├── admin/             # Back-office administration suite
│   │   ├── pages/         # Dashboard, POS, Products, Orders, Campaign, etc.
│   │   ├── components/    # Admin navigation, headers, and modal handlers
│   │   └── AdminLayout.jsx# Protected layout wrapper for admin routes
│   ├── components/        # Reusable customer-facing UI components
│   ├── context/           # Global states (OrderContext, CartContext, AuthContext)
│   ├── pages/             # Customer pages (Catalog, ProductDetail, Cart, Checkout, Profile)
│   ├── utils/             # Helper utilities, formatters, and API clients
│   ├── App.jsx            # Application root route definitions
│   ├── main.jsx           # Application entry point
│   └── index.css          # Base design tokens and global styles
├── index.html             # HTML entry point with metadata
├── vite.config.js         # Vite & PWA configuration
└── package.json           # Dependencies and script definitions
```

---

## Getting Started

### Prerequisites
- **Node.js**: `v18.x` or higher
- **npm** or **yarn**
- Running instance of **preysonapi** backend service

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone https://github.com/your-repo/preysonweb.git
   cd preysonweb
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

---

## My Role

**Prabu Alam Tian Try Suherman**  
*Lead Architect & Full-Stack Master*

### Key Contributions on this Project:
- **System & Technical Architecture**: Engineered the complete decoupled frontend-backend communication pattern, state synchronization, and database interaction model.
- **Application Architecture**: Designed the modular component structure, React Context state management, and protected administrative routing.
- **UI/UX Direction & Design**: Created a bespoke, responsive aesthetic aligned with the automotive and motorcycle culture of **Preyson Moto Company**.
- **Frontend Engineering**: Developed the entire customer storefront and administration interface using React 19 and Vite.
- **Real-Time Integration**: Implemented bidirectional WebSocket messaging via Socket.IO for immediate order notifications in the admin dashboard.
- **POS & Hardware Workflow**: Engineered the Point of Sale interface, receipt layout generation, and barcode/QR rendering system.
- **Payment & Security Flow**: Integrated secure Midtrans payment flows, token verification, and role-based route protection.
- **Deployment & Optimization**: Configured production builds, PWA caching strategies, and asset minification.

---

## About the Creator

### Prabu Alam Tian Try Suherman
**Lead Architect & Full-Stack Master**  
*Founder of Qisa Studio, a digital product studio focused on website development, application development, and digitalization.*

Prabu focuses on architecting scalable, high-performance systems and executing complex end-to-end applications — from system analysis and architecture to UI/UX, development, database design, testing, deployment, and optimization.

**Areas of focus:**
- System Architecture
- Full-Stack Development
- Web Applications
- Digitalization
- UI/UX
- Digital Product Development
- Scalable System Design

---

## Built & Architected by

**Prabu Alam Tian Try Suherman**  
*Lead Architect & Full-Stack Master*  
*Founder — Qisa Studio*

> *Architecting scalable systems. Building high-performance digital products. Turning complex ideas into working applications.*
