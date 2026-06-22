# SIOMAI - Corporate React Native Application

A professional-grade React Native application built on top of **Expo (SDK 56)** using file-based routing with **Expo Router** and written entirely in **JavaScript (ES6+) and JSX**.

This repository is structured following corporate design patterns, separating business logic, state management, layouts, and reusable user interface elements.

---

## 📁 Repository Structure

```
/src
├── app/                  # Route layouts and screens (Expo Router Root)
│   ├── (app)/            # Protected route group (requires authentication)
│   │   ├── _layout.jsx   # Layout wrapper for authenticated screens
│   │   └── index.jsx     # Main Dashboard screen
│   ├── (auth)/           # Public / Authentication route group
│   │   ├── _layout.jsx   # Layout wrapper for authentication screens
│   │   └── login.jsx     # Login screen (Plain layout, fully functional)
│   └── _layout.jsx       # Global root layout (Auth provider & redirection router)
├── components/           # Reusable UI components
│   ├── Button.jsx        # Plain, customizable button component
│   └── Input.jsx         # Plain text input field with error handling
├── constants/            # Global application variables
│   └── Colors.js         # Theme color definitions (Light & Dark modes)
├── context/              # Global state contexts
│   └── AuthContext.js    # Authentication and session state provider
├── hooks/                # Custom React hooks
│   └── useAuth.js        # Easy-to-use hook to consume the AuthContext
└── services/             # API clients and business layer services
    └── authService.js    # Mock authentication API client
```

---

## 🔑 Authentication Credentials

The app features a fully working mock authentication client to simulate real-world API requests. To test logging in:

*   **Email**: `admin@corporate.com`
*   **Password**: `password123`

*Note: Validation errors will trigger on invalid email formatting, empty values, or incorrect credentials.*

---

## 🚀 Getting Started

### 1. Install Dependencies
Ensure you have all npm packages installed:
```bash
npm install
```

### 2. Start the App
Start the Expo development server:
```bash
npm start
```

Use the console commands to test the application on different platforms:
*   Press `a` to run on an **Android** emulator/device.
*   Press `i` to run on an **iOS** simulator/device.
*   Press `w` to run on a **Web** browser.

---

## 🛠 Coding Standard & Practices

*   **JavaScript/JSX Only**: Do not use TypeScript (`.ts`/`.tsx`). All frontend UI elements and screens must be written in JSX.
*   **Plain UI**: Styles are kept structured but plain for general layout and spacing. Decorative styling and themes can be added later.
*   **Separation of Concerns**: Keep components lightweight. Place API request mockups in `services/`, state providers in `context/`, and route definitions in `app/`.
*   **DRY Principles**: Utilize custom inputs (`Input.jsx`) and buttons (`Button.jsx`) to keep screen styling simple and avoid duplicating structural elements.
