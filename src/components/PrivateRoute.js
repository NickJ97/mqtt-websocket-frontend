import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ element: Component }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateAndRenewToken = async () => {
      const accessToken = sessionStorage.getItem("accessToken");
      const refreshToken = sessionStorage.getItem("refreshToken");

      if (!accessToken && !refreshToken) {
        // No tokens available
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        // Check if accessToken is valid
        if (accessToken) {
          const response = await fetch("http://192.168.0.171:3000/auth/check-token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (response.ok) {
            setIsAuthenticated(true);
          } else {
            throw new Error("Access token inválido");
          }
        } else {
          // If no accessToken, attempt to refresh
          await handleTokenRefresh(refreshToken);
        }
      } catch (error) {
        console.error("Error during token validation:", error);
        setIsAuthenticated(false);
        sessionStorage.clear();
      } finally {
        setLoading(false);
      }
    };

    const handleTokenRefresh = async (refreshToken) => {
      if (!refreshToken) throw new Error("No refresh token available");

      const response = await fetch("http://192.168.0.171:3000/auth/refresh-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem("accessToken", data.access_token);
        setIsAuthenticated(true);
      } else {
        throw new Error("Unable to refresh token");
      }
    };

    validateAndRenewToken();
  }, []);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return isAuthenticated ? <Component /> : <Navigate to="/login" />;
};

export default PrivateRoute;

