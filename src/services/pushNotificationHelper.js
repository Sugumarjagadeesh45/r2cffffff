import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

// 🔹 Your Backend URL
const API_URL = 'http://10.136.59.126:5000/api'; 

export const getFCMToken = async () => {
  try {
    // 1. Check if token is already saved in storage
    let fcmToken = await AsyncStorage.getItem('fcmToken');

    if (!fcmToken) {
      // 2. Generate new token
      try {
        fcmToken = await messaging().getToken();
      } catch (error) {
        console.log('[FCM] ⚠️ Failed to fetch fresh token:', error);
      }
      
      if (fcmToken) {
        console.log('[FCM] 🆕 New Token Generated:', fcmToken);
        await AsyncStorage.setItem('fcmToken', fcmToken);
      }
    } else {
      console.log('[FCM] 💾 Token found in storage:', fcmToken);
    }

    // 3. Send Token to Backend
    if (fcmToken) {
      await registerTokenInBackend(fcmToken);
    }
    
  } catch (error) {
    console.error('[FCM] ❌ Error getting token:', error);
  }
};

// Helper function to call your API
const registerTokenInBackend = async (token) => {
  try {
    const userToken = await AsyncStorage.getItem('userToken'); 
    
    if (!userToken) {
      console.log('[FCM] ⚠️ No user logged in, skipping backend registration');
      return;
    }

    console.log('[FCM] 📤 Sending token to backend...');

    await axios.post(
      `${API_URL}/notifications/register-token`,
      { token: token },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}` 
        }
      }
    );
    
    console.log('[FCM] ✅ Token registered successfully in Backend!');
    
  } catch (error) {
    // We suppress the error log to avoid clutter if it's just a duplicate key error
    console.log('[FCM] ℹ️ Backend registration status:', error.response?.status || error.message);
  }
};

export const setupNotificationListeners = () => {
  // ✅ Foreground Message Handler ONLY
  // The background handler is now in index.js to prevent crashes
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('[FCM] 📡 Foreground Notification received:', remoteMessage);
    
    // Optional: You could trigger a local toast/banner here 
    // because heads-up notifications often don't show when app is in focus
  });

  return unsubscribe;
};




// import { getMessaging } from '@react-native-firebase/messaging';
// import { getApp } from '@react-native-firebase/app';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import API_URL from '../utiliti/config';
// import PushNotification from 'react-native-push-notification';
// import { Platform } from 'react-native';

// // Initialize modular messaging instance
// const messaging = getMessaging(getApp());

// // Function to get the FCM token and register it with the backend
// export const getFCMToken = async () => {
//   try {
//     let fcmToken = await AsyncStorage.getItem('fcmToken');
//     if (!fcmToken) {
//       const authStatus = await messaging.requestPermission();
//       const enabled =
//         authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//         authStatus === messaging.AuthorizationStatus.PROVISIONAL;

//       if (enabled) {
//         fcmToken = await messaging.getToken();
//         await AsyncStorage.setItem('fcmToken', fcmToken);
//         console.log('New FCM Token:', fcmToken);
//       }
//     }

//     if (fcmToken) {
//       await registerToken(fcmToken);
//     }
//   } catch (error) {
//     console.error('Error getting FCM token:', error);
//   }
// };

// // Function to register the FCM token with the backend
// export const registerToken = async (token) => {
//   try {
//     const authToken = await AsyncStorage.getItem('authToken');
//     if (!authToken) {
//       return;
//     }

//     await fetch(`${API_URL}/api/notifications/register-token`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${authToken}`,
//       },
//       body: JSON.stringify({ token }),
//     });
//   } catch (error) {
//     console.error('Error registering FCM token:', error);
//   }
// };

// // Function to set up notification listeners
// export const setupNotificationListeners = (navigation) => {
//   messaging.onTokenRefresh(async (newFcmToken) => {
//     console.log('FCM Token refreshed:', newFcmToken);
//     await AsyncStorage.setItem('fcmToken', newFcmToken);
//     await registerToken(newFcmToken);
//   });

//   messaging.onMessage(async (remoteMessage) => {
//     console.log('FCM Message received (foreground):');
//     console.log('  Notification:', remoteMessage.notification);
//     console.log('  Data:', remoteMessage.data);
//     console.log('  Sent Time:', remoteMessage.sentTime);

//     // Display a local notification for foreground messages
//     const notification = remoteMessage.notification;
//     const data = remoteMessage.data;

//     if (notification) {
//       PushNotification.localNotification({
//         /* Android Only Properties */
//         channelId: notification.android?.channelId || 'default', // Use backend provided channelId or fallback to 'default'
//         largeIcon: 'ic_launcher', // (optional) default: "ic_launcher"
//         smallIcon: 'ic_notification', // (optional) default: "ic_notification" with fallback for "ic_launcher"
        
//         /* iOS and Android properties */
//         title: notification.title, // (optional)
//         message: notification.body, // (required)
//         userInfo: data, // (optional) custom data object that will be passed to the notification callback functions.
//         playSound: notification.sound !== 'none', // (optional) default: true
//         soundName: notification.sound || 'default', // (optional) Sound to play (only Android)
//         // actions: ['Yes', 'No'], // (Android only) See PushNotification.configure on how to use this
//       });
//     }
//   });

//   messaging.onNotificationOpenedApp(async (remoteMessage) => {
//     console.log('FCM Notification opened app (background/quit):');
//     console.log('  Notification:', remoteMessage.notification);
//     console.log('  Data:', remoteMessage.data);
//     console.log('  Sent Time:', remoteMessage.sentTime);
//     handleNotificationNavigation(remoteMessage.data, navigation);
//   });

//   messaging
//     .getInitialNotification()
//     .then((remoteMessage) => {
//       if (remoteMessage) {
//         console.log('FCM Initial notification (app launched from quit state):');
//         console.log('  Notification:', remoteMessage.notification);
//         console.log('  Data:', remoteMessage.data);
//         console.log('  Sent Time:', remoteMessage.sentTime);
//         handleNotificationNavigation(remoteMessage.data, navigation);
//       }
//     });
// };

// export const handleNotificationNavigation = (data, navigation) => {
//   if (!data || !data.type) {
//     return;
//   }
//   console.log('handleNotificationNavigation - Data received:', data);

//   switch (data.type) {
//     case 'chat_message': // Use 'chat_message' type as per messag_screen.md
//       // MessageScreen now expects otherUserId, otherUserName, otherUserPhotoURL
//       // If these are directly in data, pass them. Otherwise, map senderId to otherUserId.
//       navigation.navigate('Chat', {
//         screen: 'MessageScreen', // Assuming 'ChatScreen' maps to 'MessageScreen'
//         params: {
//           otherUserId: data.otherUserId || data.senderId, // Prioritize otherUserId, fallback to senderId
//           user: { // Pass a partial user object if available, MessageScreen will fetch full if needed
//             _id: data.otherUserId || data.senderId,
//             name: data.otherUserName || 'Unknown User',
//             photoURL: data.otherUserPhotoURL || 'https://randomuser.me/api/portraits/men/1.jpg', // Default avatar
//             // isOnline: data.isOnline, // If backend sends this
//           },
//           // messageId: data.messageId, // No longer directly used by MessageScreen for fetching partner
//         },
//       });
//       break;
//     case 'FRIEND_REQUEST':
//       navigation.navigate('Friends', {
//         screen: 'FriendRequests',
//         params: {
//           senderId: data.senderId,
//         },
//       });
//       break;
//     case 'FRIEND_REQUEST_ACCEPTED':
//       navigation.navigate('Friends', {
//         screen: 'AllFriends',
//         params: {
//           acceptorId: data.acceptorId,
//         },
//       });
//       break;
//     case 'ADMIN_MESSAGE':
//     case 'ADMIN_BROADCAST':
//       navigation.navigate('Notifications', {
//         screen: 'AdminNotifications',
//       });
//       break;
//     default:
//       break;
//   }
// };

// // Background message handler must be outside the function, called once
// messaging.setBackgroundMessageHandler(async (remoteMessage) => {
//   console.log('FCM Message handled in the background:');
//   console.log('  Notification:', remoteMessage.notification);
//   console.log('  Data:', remoteMessage.data);
//   console.log('  Sent Time:', remoteMessage.sentTime);
// });