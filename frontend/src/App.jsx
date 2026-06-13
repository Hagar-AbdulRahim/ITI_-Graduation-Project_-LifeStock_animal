import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';
import "./index.css";
const App = () => (
  <>
    <Toaster position="top-center" />
    <AppRoutes />
  </>
);

export default App;
