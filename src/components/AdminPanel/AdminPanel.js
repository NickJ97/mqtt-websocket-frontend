import React, { useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';
import './AdminPanel.css';

const AdminPanel = () => {
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [error, setError] = useState('');
  const [isSuperUser, setIsSuperUser] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decodedToken = jwtDecode(token);
      if (decodedToken.roles && decodedToken.roles.includes('superuser')) {
        setIsSuperUser(true);
      } else {
        setError('You do not have permission to access this page');
      }
    }else{
      setError('no token found');
    }
  },[]);

  useEffect(() => {
    if(isSuperUser){
    const fetchPendingRegistrations = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://192.168.0.171:3000/registration/pending', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setPendingRegistrations(data);
      } catch (err) {
        setError('Failed to fetch pending registrations');
      }
    };

    fetchPendingRegistrations();
  }
 }, [isSuperUser]);

  const handleApprove = async (username) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://192.168.0.171:3000/user/approve/${username}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        }

      });

      if (!response.ok) {
        throw new Error('Failed to approve user');
      }

      setPendingRegistrations(pendingRegistrations.filter(user => user.username !== username));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeny = async (username) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://192.168.0.171:3000/user/deny/${username}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to deny user');
      }

      setPendingRegistrations(pendingRegistrations.filter(user => user.username !== username));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-panel-container">
      <h2>Pending Registrations</h2>
      {error && <p className="error">{error}</p>}
      <ul>
        {pendingRegistrations.map(user => (
          <li key={user.username}>
            {user.username}
            <button onClick={() => handleApprove(user.username)}>Approve</button>
            <button onClick={() => handleDeny(user.username)}>Deny</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export { AdminPanel };

