import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppRoutes from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';
import { fetchProfile } from './redux/authSlice';
import './index.css';

const App = () => {
  const dispatch = useDispatch();
  const { accessToken, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (accessToken && !user) {
      dispatch(fetchProfile());
    }
  }, [dispatch, accessToken, user]);

  return (
    <>
      <Toaster position="top-center" />
      <AppRoutes />
    </>
  );
};

export default App;
