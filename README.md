Employee Management Frontend

A React + Vite frontend for managing employee records with role-based admin permissions.

## What it does

- Displays a list of employees fetched from a backend API.
- Shows total, active, and inactive employee counts.
- Allows admin users to:
  - add new employees
  - edit existing employees
  - delete employees
- Regular users can view employee details but cannot modify them.
- Uses ` + 'localStorage' + ` to store authentication data and user role.

## Built with

- React 19
- Vite
- Axios
- React Router DOM
- React Hot Toast
- React Icons

## Prerequisites

- Node.js v18+ or compatible version
- npm
- A running backend API with employee endpoints

## Environment setup

Create a .env file at the project root with the backend API URL, for example:


dcat VITE_API_URL=http://localhost:3000/api
```

The frontend expects the backend routes to include:

- `POST /users/login` for authentication
- `GET /employees/getemployees` to fetch employees
- `POST /employees/saveemployee` to create employees
- `PUT /employees/updateemployee/:id` to update employees
- `DELETE /employees/deleteemployee/:id` to remove employees

## Install dependencies

```bash
npm install
```

## Run locally

```bash
npm run dev
```

Then open the local Vite URL shown in the terminal, usually `http://localhost:5173`.

## Build for production

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## How it works

- `src/Pages/LoginPage/LoginPage.jsx` handles login and stores `token`, `userFirstName`, `userLastName`, `userRole`, and `userEmail` in `localStorage`.
- `src/Pages/EmployeePage/EmployeePage.jsx` fetches employees using `axios` with the stored Bearer token.
- The page checks `localStorage.userRole` to determine if the current user is an admin.
- Admins see enabled Add/Edit/Delete controls.
- Non-admin users see a read-only view with disabled actions.

## Notes

- Make sure the backend returns the `role` value as `admin` for admin users.
- If login fails, the app shows a toast error message.
- Logout clears stored user data and returns to the login page.

## Project structure

- `src/main.jsx` - app entry point
- `src/App.jsx` - main routing layout
- `src/Pages/LoginPage/LoginPage.jsx` - login screen
- `src/Pages/EmployeePage/EmployeePage.jsx` - employee management page
- `src/Components/PopupMessageComponent/PopupMessage.jsx` - reusable toast wrapper
`; fs.writeFileSync('README.md', content, 'utf8');"