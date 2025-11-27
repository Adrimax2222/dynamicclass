'use client';

import { useEffect } from 'react';
import { getMessaging, getToken } from 'firebase/messaging';
import { useFirebaseApp, useFirestore } from '@/firebase';
import { useApp } from './use-app';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const VAPID_KEY = 'J2KEAsTGilA1Vr6Lpbcbo0C9JiTLv5E-HWz0PM-NtOQ';

export const useFcmToken = () => {
  const app = useFirebaseApp();
  const firestore = useFirestore();
  const { user } = useApp();

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !user) {
      return;
    }

    const messaging = getMessaging(app);

    const requestPermissionAndToken = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted.');
          
          const currentToken = await getToken(messaging, {
            vapidKey: VAPID_KEY,
          });

          if (currentToken) {
            console.log('FCM Token:', currentToken);
            
            // Save the token to a separate 'userTokens' collection
            const tokenDocRef = doc(firestore, 'userTokens', user.uid);
            await setDoc(tokenDocRef, {
              token: currentToken,
              updatedAt: serverTimestamp(),
            });

            console.log('FCM Token saved to Firestore in userTokens collection.');
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

    requestPermissionAndToken();

  }, [app, firestore, user]);
};
