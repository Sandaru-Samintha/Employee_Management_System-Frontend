import './App.css'
import { Routes, Route, BrowserRouter } from "react-router-dom";
import LoginPage from './Pages/LoginPage/LoginPage';

import PopupMessage from './Components/PopupMessageComponent/PopupMessage.jsx';
import EmployeePage from './Pages/EmployeePage/EmployeePage.jsx';

function App() {
  return (
    <BrowserRouter>
      <PopupMessage/>
      <Routes>
        <Route path="/employee" element={<EmployeePage />} />
        <Route path="/" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
