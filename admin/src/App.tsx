import React from 'react';
import AppRoutes from './router/AppRoutes';

const App: React.FC = () => {
  return (
    <div>
      <h1 className="text-4xl font-bold text-purple-600">Admin Panel</h1>
      <AppRoutes />
    </div>
  );
};

export default App;
