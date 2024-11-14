import React, { useState, useEffect } from "react";
import axios from "axios";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });

  useEffect(() => {
    const checkSession = async () => {
      try {
        await axios.get("http://localhost:4000/verify", {
          withCredentials: true,
        });
        window.location.href = "/dashboard";
      } catch (err) {
        console.log("No active session");
      }
    };
    checkSession();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:4000/login",
        formData,
        { withCredentials: true }
      );
      console.log(response.data); // Check if response data is received
      if (response.data) {
        alert("Login successful");
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error("Error:", err); // Log the error for debugging
      alert("Login failed: " + (err.response?.data || "Server error"));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
      />
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
