import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const refreshToken = sessionStorage.getItem("refreshToken");
  
    if (!refreshToken) {
      console.log("No se encontró el refresh token");
      return;
    }
  
    try {
      const response = await fetch("http://192.168.0.171:3000/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),  // Solo enviar el refresh_token
      });
  
      if (response.ok) {
        console.log("Sesión cerrada correctamente");
        sessionStorage.clear(); // Limpiar los datos de sesión
        navigate('/login')
      } else {
        console.error("Error al cerrar sesión");
      }
    } catch (error) {
      console.error("Error al realizar la solicitud:", error);
    }
  };
  

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <h1 className="logo">Mi Aplicación</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </nav>
  );
};

export { Navbar };
