import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import wallpaper from '../../Images/wallpaper/wallpaper.jpg';
import './LoginPage.css';
import axios from "axios";

import { toast } from "react-hot-toast";
import { showWarningToast } from "../../Components/PopupMessageComponent/PopupMessage";


function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

 // Handle login form submission
async function handleLoginSubmit(e) {
  e.preventDefault(); // Prevent default form submission

  // Basic validation
  if (!email || !password) {
    toast.error("Please enter both email and password");
    return;
  }

  try {
    const response = await axios.post(import.meta.env.VITE_API_URL + '/users/login', { 
      email, 
      password 
    });

    console.log(response.data);
    toast.success(response.data.message);

    // Store JWT token
    localStorage.setItem('token', response.data.token);
    
    // Store user information
    localStorage.setItem('userFirstName', response.data.firstName);
    localStorage.setItem('userLastName', response.data.lastName);
    localStorage.setItem('userRole', response.data.role);
    localStorage.setItem('userEmail', response.data.email);
    
    if (response.data.role === 'admin') {
      navigate('/employee'); // Redirect to admin dashboard
      return;
    }else{
      navigate('/employee'); // Redirect to user homepage
      return;
    }
    

  } catch (error) {
    if (error.response) {
      // Server responded with a status code outside 2xx
      console.log("Login error:", error.response.data.message);
      toast.error(error.response.data.message);
    }else if (error.request) {
      // Network error
      console.log("Network error:", error.message);
      showWarningToast("Network error: Please check your connection"); //  now works
    } else {
      // Something else happened
      console.log("Error:", error.message);
      toast.error("An unexpected error occurred");
    }
  }

 
  console.log("Logging in with:", { email, password }); // Optional: For debugging only
}


  return (
     <div className="min-h-screen w-screen flex items-center justify-center bg-cover bg-center overflow-hidden" style={{ backgroundImage: `url(${wallpaper})` }}>

      {/* ===== LOGIN CARD ===== */}
      <div className="glass-card active">
        <h2 className="text-2xl font-semibold mb-4 text-center text-white"> Welcome back</h2>
        <form className="flex flex-col gap-3" onSubmit={handleLoginSubmit}>
          <input  type="email"  placeholder="Enter your email"  value={email}  onChange={e => setEmail(e.target.value)}  required  className="w-full bg-white/30 placeholder-gray-700 border border-white/40 outline-none rounded-full py-2.5 px-4 text-sm"  />
          <input  type="password"  placeholder="Enter your password"  value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-white/30 placeholder-gray-700 border border-white/40 outline-none rounded-full py-2.5 px-4 text-sm" />
         
          <div className="text-right">
            <Link to="/" className="text-sm text-white underline"> Forgot Password?</Link>
          </div>
          <button  type="submit"   className="w-full py-2.5 rounded-full text-white font-medium bg-gradient-to-r from-[#A953BA] to-[#F68961] hover:opacity-90 transition">   Log in </button>
        </form>

        <div className="mt-4 space-y-3">
          <button type="button" className="w-full flex items-center gap-3 justify-center py-2.5 rounded-full bg-white/80 hover:bg-white transition text-gray-800 text-sm font-medium" >
            <img className="h-4 w-4" src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/login/googleFavicon.png" alt="Google"/> Continue with Google
          </button>

          <button type="button" className="w-full flex items-center gap-3 justify-center py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 transition text-white text-sm font-medium" >
            <img className="h-4 w-4" src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png" alt="Facebook" /> Continue with Facebook
          </button>
        </div>

        <p className="mt-4 text-center text-white text-sm">   Don't have an account?{" "}
          <Link to="/" className="underline font-medium"> Signup</Link>
        </p>
      </div>


    </div>
  );
}

export default LoginPage;