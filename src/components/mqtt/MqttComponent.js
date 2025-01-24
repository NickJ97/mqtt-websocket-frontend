import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { useMqtt } from "../../hooks/useMqtt";
import "./MqttComponent.css"; // Asegúrate de importar el archivo CSS
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler, // Importa el plugin Filler
} from "chart.js";
import { useNavigate } from "react-router-dom";

// Registra las escalas, elementos y plugins necesarios
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler // Registra el plugin Filler
);

const MqttComponent = () => {
  const navigate = useNavigate();
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const token = sessionStorage.getItem("accessToken");
  const { data, pressureTrends, temperatureTrends } = useMqtt(token); // Datos y tendencias

  useEffect(() => {
    const validateToken = () => {
      if (!token) {
        navigate("/login"); // Redirige si no hay token
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split(".")[1])); // Decodifica el payload del token
        const currentTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos

        if (payload.exp && payload.exp > currentTime) {
          setIsTokenValid(true);
        } else {
          console.warn("Token expirado.");
          navigate("/login"); // Redirige si el token ha expirado
        }
      } catch (error) {
        console.error("Token inválido:", error);
        navigate("/login"); // Redirige si el token es inválido
      } finally {
        setLoading(false); // Deja de cargar independientemente del resultado
      }
    };

    validateToken();
  }, [token, navigate]);

  if (loading) {
    return <p>Validando sesión...</p>; // Muestra un mensaje mientras se valida el token
  }

  if (!isTokenValid) {
    return null; // Evita renderizar el componente si el token no es válido
  }

  const renderCombinedTrendChart = (trendData, groupName, isTemperatureTrend = false) => {
    if (!trendData || typeof trendData !== "object") {
      console.error(`trendData para ${groupName} no es un objeto válido:`, trendData);
      return <p>Datos de tendencia no disponibles para {groupName}</p>;
    }

    const datasets = Object.keys(trendData)
      .map((key) => {
        const dataset = trendData[key];

        if (!Array.isArray(dataset)) {
          console.error(`Dataset para ${key} en ${groupName} no es un array válido:`, dataset);
          return null;
        }

        return {
          label: `Tendencia ${key} - ${groupName}`,
          data: dataset,
          borderColor: key.includes("01") ? "rgba(75,192,192,1)" : "rgba(255,99,132,1)",
          backgroundColor: key.includes("01") ? "rgba(75,192,192,0.2)" : "rgba(255,99,132,0.2)",
          fill: false, // Activa el relleno para cada línea
          tension: 0.4,
        };
      })
      .filter(Boolean);

    if (datasets.length === 0) {
      return <p>No hay datos de tendencia disponibles para {groupName}</p>;
    }

    const chartData = {
      labels: Array.from({ length: Math.max(...datasets.map((d) => d.data.length)) }, (_, i) => i),
      datasets,
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        title: {
          display: true,
          text: isTemperatureTrend
            ? `Tendencia de Temperatura en ${groupName}`
            : `Tendencia combinada en ${groupName}`,
        },
        tooltip: {
          mode: "index",
          intersect: false,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Tiempo (Muestras)",
          },
        },
        y: {
          title: {
            display: true,
            text: isTemperatureTrend ? "Temperatura" : "Presión",
          },
          min: 0,
        },
      },
    };

    return <Line data={chartData} options={chartOptions} />;
  };

  return (
    <div className="pipeline-container">
      {Object.keys(data).map((groupName) => (
        <div key={groupName} className="group">
          <h3 className="group-title">{groupName}</h3>
          <div className="group-cards">
            {data[groupName].map((point) => (
              <div key={point.id} className="data-card">
                <div className="card-header">
                  <h4>{point.label}</h4>
                </div>
                <div className="card-body">
                  <p>
                    {point.label}: <strong>{point.value}</strong>
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="trend-card">
            {pressureTrends[groupName] && typeof pressureTrends[groupName] === "object"
              ? renderCombinedTrendChart(pressureTrends[groupName], groupName, false)
              : <p>No hay datos de tendencia disponibles para {groupName}</p>}
          </div>
          <div className="trend-card">
            {temperatureTrends[groupName] && typeof temperatureTrends[groupName] === "object"
              ? renderCombinedTrendChart(temperatureTrends[groupName], groupName, true)
              : <p>No hay datos de tendencia de temperatura disponibles para {groupName}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};

export { MqttComponent };
