import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Login } from './components/Login/Login';
import { MqttComponent } from './components/mqtt/MqttComponent';
import PrivateRoute from './components/PrivateRoute';
import { Register } from './components/Register/Register';
import { AdminPanel } from './components/AdminPanel/AdminPanel';
import { Navbar } from './components/Navbar/Navbar';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/mqtt" element={<PrivateRoute element={MqttComponent} />} />
        <Route path="/admin" element={<PrivateRoute element={AdminPanel} />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
