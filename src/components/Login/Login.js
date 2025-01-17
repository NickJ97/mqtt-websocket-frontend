import React, { useState } from "react";
import "./Login.css"; // Estilos del componente
import logo from "./assets/images/logo.png"; // Imagen del logo
import footerLogo from "./assets/images/footer-logo.png"; // Imagen del footer
import { useNavigate } from "react-router-dom"; // Hook para redirigir

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // Estado de carga
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setMessage("Por favor, completa todos los campos.");
      return;
    }

    setLoading(true); // Activa el estado de carga
    setMessage(""); // Limpia mensajes previos

    try {
      const endpoint = "http://192.168.0.171:3000/auth/login";
      const requestData = { username, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const data = await response.json();
        const accessToken = data.access_token;
        const refreshToken = data.refresh_token;

        // Guardar el token en sessionStorage
        sessionStorage.setItem("accessToken", accessToken);
        sessionStorage.setItem("refreshToken", refreshToken);

        setMessage("Inicio de sesión exitoso.");
        navigate("/mqtt"); // Redirigir a /mqtt
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.message || "No se pudo iniciar sesión."}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false); // Desactiva el estado de carga
    }
  };

  const handleRegister = () => {
    navigate("/register"); // Redirigir a la página de registro
  };

  return (
    <div className="container">
      <div className="sideBar"></div>
      <div className="mainContent">
        <div className="logoContainer">
          <img src={logo} alt="Logo" className="logo" />
        </div>

        <div className="centeredContent">
          <form onSubmit={handleLogin} className="form">
            <h2 className="title">Bienvenido</h2>

            <div className="inputGroup">
              <label htmlFor="username">Username:</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input"
                required
              />
            </div>

            <div className="inputGroup">
              <label htmlFor="password">Contraseña:</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
              />
            </div>

            <div className="splitButton">
              <button type="button" className="leftButton" onClick={handleRegister} disabled={loading}>
                Registrarse
              </button>
              <button type="submit" className="rightButton" disabled={loading}>
                {loading ? "Cargando..." : "Ingresar"}
              </button>
            </div>

            {message && (
              <p className={`message ${message.includes("Error") ? "error" : "success"}`}>{message}</p>
            )}
          </form>
        </div>

        <div className="footerImageContainer">
          <img src={footerLogo} alt="Logo Footer" className="footerImage" />
        </div>
      </div>
      <div className="sideBar"></div>
    </div>
  );
};

export { Login };
