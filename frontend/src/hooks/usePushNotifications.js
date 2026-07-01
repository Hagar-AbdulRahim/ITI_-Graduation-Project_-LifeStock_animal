import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
};

const usePushNotifications = () => {
  const { isAuthenticated } = useSelector((s) => s.auth);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    const setup = async () => {
      try {
        // 1. سجل الـ Service Worker
        const reg = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ SW registered');

        // 2. لو الـ permission مش granted، اطلبه
        let permission = Notification.permission;
        if (permission === 'default') {
          permission = await Notification.requestPermission();
        }
        if (permission !== 'granted') return;

        // 3. اشترك في الـ push
        const subscription = await reg.pushManager.subscribe({
          userVisibleOnly:      true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        // 4. ابعت الـ subscription للباك
        await api.put('/api/users/me/push-subscription', { subscription });
        console.log('✅ Push subscription saved');
      } catch (err) {
        console.error('Push setup error:', err);
      }
    };

    setup();
  }, [isAuthenticated]);
};

export default usePushNotifications;