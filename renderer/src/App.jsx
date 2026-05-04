import React, { useState } from 'react';
import ClientsPage from './pages/ClientsPage';
import PaymentsPage from './pages/PaymentsPage';

export default function App() {
  const [route, setRoute] = useState('clients');

  return (
    <div>
      <header className='header'>👓 Takkar Optical Shop</header>
      <div className='container'>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button
              onClick={() => setRoute('clients')}
              className={`button ${route === 'clients' ? 'bg-blue-600 text-white' : ''}`}
            >
              Clients
            </button>
            <button
              onClick={() => setRoute('payments')}
              className={`button ${route === 'payments' ? 'bg-blue-600 text-white' : ''}`}
            >
              Payments
            </button>
          </div>
          {route === 'clients' ? <ClientsPage /> : <PaymentsPage />}
        </div>
      </div>
    </div>
  );
}
