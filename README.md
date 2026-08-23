# Haazri Frontend

Modern, responsive web application for the **Haazri Attendance Management System**.

## 🚀 Tech Stack
- **Framework:** React 19
- **Build Tool:** Vite 5
- **Styling:** Tailwind CSS + PostCSS
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Icons & Charts:** Lucide React / Custom SVG UI

---

## 📋 Prerequisites
- **Node.js:** v18+ or v20+
- **npm** or **pnpm**

---

## 🛠️ Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/prathamnaik24/Haazri-frontend.git
   cd Haazri-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

   | Variable | Default Value | Description |
   | :--- | :--- | :--- |
   | `VITE_API_URL` | `http://localhost:5002/api` | Base URL of the Haazri backend API |

---

## 🏃 Development & Build Scripts

- **Start Development Server (with Hot Module Replacement):**
  ```bash
  npm run dev
  ```
  Opens at `http://localhost:5173`

- **Build for Production:**
  ```bash
  npm run build
  ```

- **Preview Production Build:**
  ```bash
  npm run preview
  ```

---

## 🔒 Security Rules
- **Never commit `.env`** to source control.
- Ensure all API endpoints communicate securely with the Haazri backend.
