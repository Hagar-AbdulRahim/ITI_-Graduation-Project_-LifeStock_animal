import React from 'react'
import AppRoutes from './routes/AppRoutes'
import { Toaster } from 'react-hot-toast'
import './index.css'
import usePushNotifications from './hooks/usePushNotifications'

const App = () => {
  usePushNotifications()
  return (
    <>
      <Toaster position="top-center" />
      <AppRoutes />
    </>
  )
}

export default App