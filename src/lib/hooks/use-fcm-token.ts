'use client';

import { useEffect } from 'react';
import { getMessaging, getToken } from 'firebase/messaging';
import { useFirebaseApp, useFirestore } from '@/firebase';
import { useApp } from './use-app';
import { doc, updateDoc } from 'firebase/firestore';

const VAPID_KEY = 'YOUR_VAPID_KEY'; // IMPORTANT: Replace with your actual VAPID key from Firebase Console

export const useFcmToken = () => {
  const app = useFirebaseApp();
  const firestore = useFirestore();
  const { user } = useApp();

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !user) {
      return;
    }

    const messaging = getMessaging(app);

    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted.');
          // Get token
          const currentToken = await getToken(messaging, {
            vapidKey: VAPID_KEY,
          });

          if (currentToken) {
            console.log('FCM Token:', currentToken);
            // Save the token to Firestore
            const userDocRef = doc(firestore, 'users', user.uid);
            await updateDoc(userDocRef, {
              fcmToken: currentToken,
            });
            console.log('FCM Token saved to Firestore.');
          } else {
            console.log('No registration token available. Request permission to generate one.');
          }
        } else {
          console.log('Unable to get permission to notify.');
        }
      } catch (error) {
        console.error('An error occurred while requesting permission or getting token. ', error);
      }
    };

    requestPermission();

  }, [app, firestore, user]);
};
