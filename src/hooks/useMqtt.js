import { useState, useEffect } from "react";
import io from "socket.io-client";

// Función para calcular el estado de la válvula
const Valve = (abierto, cerrado) => {
  if (typeof abierto !== "boolean" || typeof cerrado !== "boolean") {
    return "estado desconocido";
  }
  const states = {
    "true|true": "estado inválido",
    "true|false": "Abierta",
    "false|true": "Cerrada",
    "false|false": "indeterminado",
  };
  return states[`${abierto}|${cerrado}`];
};



// Hook personalizado
const useMqtt = (token, eventName = "mqtt-message") => {
  const [data, setData] = useState({});
  const [pressureTrends,setPressureTrends] = useState({
    "San Jorge Norte": { PT_0801: [], PT_0802:[] },
    "San Jorge Sur": { PT_0901: [], PT_0902:[] },
  });
  const [temperatureTrends,setTemperatureTrends] = useState({
    "San Jorge Norte": { TT_0801:[] },
    "San Jorge Sur": { TT_0901:[] },
  });
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io("http://192.168.0.171:3000", {
      auth: { token },
    });

    // Manejo de conexión/desconexión
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    // Escuchar eventos del socket
    socket.on(eventName, (message) => {
      try {
        const { data: JsonMessage, data2: JsonMessage1 } = JSON.parse(message);

        // Validar si los datos existen
        if (!JsonMessage || !JsonMessage1) {
          console.warn("Mensajes MQTT incompletos:", message);
          return;
        }

        //Extraer y redondear valores
        const pt0801 = Math.floor((JsonMessage.PT_0801 || 0) * 10) / 10;
        const pt0802 = Math.floor((JsonMessage.PT_0802 || 0) * 10) / 10;
        const tt0801 = Math.floor((JsonMessage.TT_0801 || 0) * 10) / 10;
        const pt0901 = Math.floor((JsonMessage1.PT_0901 || 0) * 10) / 10;
        const pt0902 = Math.floor((JsonMessage1.PT_0902 || 0) * 10) / 10;
        const tt0901 = Math.floor((JsonMessage1.TT_0901 || 0) * 10) / 10;

        

        // Actualizar datos agrupados
        const groupedData = {
          "San Jorge Norte": [
            { id: 1, label: "PT_0801", value: pt0801 },
            { id: 2, label: "PT_0802", value: pt0802 },
            { id: 3, label: "TT_0801", value: tt0801 },
            { id: 4, label: "Estado", value: Valve(JsonMessage.ZSO_0801, JsonMessage.ZSC_0801) },
          ],
          "San Jorge Sur": [
            { id: 5, label: "PT_0901", value: pt0901 },
            { id: 6, label: "PT_0902", value: pt0902 },
            { id: 7, label: "TT_0901", value: tt0901 },
            { id: 8, label: "Estado", value: Valve(JsonMessage1.ZSO_0901, JsonMessage1.ZSC_0901) },
          ],
        };

        setData(groupedData);

        // Actualizar tendencias de presión y temperatura

        setPressureTrends((prev)=> ({
          'San Jorge Norte': {
            PT_0801: [...prev["San Jorge Norte"].PT_0801, pt0801].slice(-100),
            PT_0802: [...prev["San Jorge Norte"].PT_0802, pt0802].slice(-100),
          },
          "San Jorge Sur": {
            PT_0901: [...prev["San Jorge Sur"].PT_0901, pt0901].slice(-100),
            PT_0902: [...prev["San Jorge Sur"].PT_0902, pt0902].slice(-100),
          },
        }));

        setTemperatureTrends((prev) => ({
          "San Jorge Norte": { TT_0801: [...prev["San Jorge Norte"].TT_0801, tt0801].slice(-100) },
          "San Jorge Sur": { TT_0901: [...prev["San Jorge Sur"].TT_0901, tt0901].slice(-100) },
        }));

      } catch (error) {
        console.error("Error procesando mensaje MQTT:", error);
      }
    });

    // Limpiar el socket al desmontar
    return () => {
      socket.off(eventName);
      socket.disconnect();
    };
  }, [token, eventName]);

  return {  data, pressureTrends, temperatureTrends, connected };
};

export { useMqtt };
