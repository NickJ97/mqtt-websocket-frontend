import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import "./Pipeline.css"; // Estilos para el diseño

const Pipeline = () => {
  const [data, setData] = useState([]);

  useEffect(() => {


    // Conectar al servidor WebSocket con el token JWT en los encabezados
    const socket = io("http://192.168.0.171:3000");

    // Escuchar datos en tiempo real desde el backend
    socket.on("mqtt-message", (message) => {
      if (message) {
        const JsonMessage = JSON.parse(message).data;
        const JsonMessage1 = JSON.parse(message).data2;
        console.log(JsonMessage);
        console.log(JsonMessage1);
        const transformedData = [
          { id: 1, label: "PT_0801", value: JsonMessage.PT_0801 },
          { id: 2, label: "PT_0802", value: JsonMessage.PT_0802 },
          { id: 3, label: "TT_0801", value: JsonMessage.TT_0801 },
          { id: 4, label: "ZSO_0801", value: JsonMessage.ZSO_0801 ? "ON" : "OFF" },
          { id: 5, label: "ZSC_0801", value: JsonMessage.ZSC_0801 ? "ON" : "OFF" },
          { id: 6, label: "PT_0901", value: JsonMessage1.PT_0801 },
          { id: 7, label: "PT_0902", value: JsonMessage1.PT_0802 },
          { id: 8, label: "TT_0901", value: JsonMessage1.TT_0801 },
          { id: 9, label: "ZSO_0901", value: JsonMessage1.ZSO_0801 ? "ON" : "OFF" },
          { id: 10, label: "ZSC_0901", value: JsonMessage1.ZSC_0801 ? "ON" : "OFF" },
        ];
        setData(transformedData);
      }
    });

    return () => {
      socket.off("mqtt-message");
    };
  }, []);

  // Datos de ejemplo si no hay datos desde el backend
  const defaultData = [
    { id: 1, label: "PT_0801", value: 0 },
    { id: 2, label: "PT_0802", value: 0 },
    { id: 3, label: "TT_0801", value: 0 },
    { id: 4, label: "ZSO_0801", value: "OFF" },
    { id: 5, label: "ZSC_0801", value: "OFF" },
  ];
  

  const pipelineData = data.length > 0 ? data : defaultData;

  return (
    <div className="pipeline-container">
      <div className="pipeline">
        {pipelineData.map((point) => (
          <div key={point.id} className="data-point">
            <div className="data-values">
              <p>{point.label}: {point.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pipeline;
