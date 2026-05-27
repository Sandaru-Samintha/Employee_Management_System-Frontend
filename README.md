# Employee Management Frontend

A React + Vite frontend for managing employee records with role-based admin permissions.

## Overview

This application provides an employee dashboard with search, filtering, pagination, and admin-only CRUD actions. It relies on a backend API for authentication and employee data.

## Prerequisites

- Node.js v18 or newer
- npm (included with Node.js)
- A running backend API with employee management routes

## Setup

1. Clone or open this repository in your editor.
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root with the backend API URL:

```bash
VITE_API_URL=http://localhost:3000/api
```

4. Start the development server:

```bash
npm run dev
```

5. Open the URL shown in the terminal, usually:

```bash
http://localhost:5173
```

## Backend API Expectations

The frontend expects the backend to expose these routes:

- `POST /users/login` — login and receive a token
- `GET /employees/getemployees` — fetch employee list
- `POST /employees/saveemployee` — add a new employee
- `PUT /employees/updateemployee/:id` — update an employee
- `DELETE /employees/deleteemployee/:id` — delete an employee

## Available Scripts

- `npm run dev` — start the Vite development server
- `npm run build` — build the app for production
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint on the project

## Project Structure

- `src/main.jsx` — application entry point
- `src/App.jsx` — app layout and routing
- `src/Pages/LoginPage/LoginPage.jsx` — login page
- `src/Pages/EmployeePage/EmployeePage.jsx` — employee management page
- `src/Components/PopupMessageComponent/PopupMessage.jsx` — popup/toast helper

## Notes

- Authentication data is stored in `localStorage`.
- Admin users can create, edit, and delete employees.
- Non-admin users can view employees in read-only mode.

## Troubleshooting

- If the app cannot reach the backend, verify `VITE_API_URL` in `.env`.
- If ports conflict, use the Vite prompt to select another port or stop the running server.
"
