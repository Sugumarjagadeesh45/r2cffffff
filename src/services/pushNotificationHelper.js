// import messaging from '@react-native-firebase/messaging';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';
// import { Platform } from 'react-native';
// import PushNotification from 'react-native-push-notification';

// const API_URL = 'http://10.136.59.126:5000/api'; 

// // Create notification channel (call this once in your app)
// PushNotification.createChannel(
//   {
//     channelId: 'chat_messages',
//     channelName: 'Chat Messages',
//     channelDescription: 'Notifications for new chat messages',
//     soundName: 'default',
//     importance: 4,
//     vibrate: true,
//   },
//   (created) => console.log(`Channel created: ${created}`)
// );

// export const getFCMToken = async () => {
//   try {
//     // 1. Check if token is already saved in storage
//     let fcmToken = await AsyncStorage.getItem('fcmToken');

//     if (!fcmToken) {
//       // 2. Generate new token
//       try {
//         fcmToken = await messaging().getToken();
//       } catch (error) {
//         console.log('[FCM] ⚠️ Failed to fetch fresh token:', error);
//       }
      
//       if (fcmToken) {
//         console.log('[FCM] 🆕 New Token Generated:', fcmToken);
//         await AsyncStorage.setItem('fcmToken', fcmToken);
//       }
//     } else {
//       console.log('[FCM] 💾 Token found in storage:', fcmToken);
//     }

//     // 3. Send Token to Backend
//     if (fcmToken) {
//       await registerTokenInBackend(fcmToken);
//     }
    
//   } catch (error) {
//     console.error('[FCM] ❌ Error getting token:', error);
//   }
// };

// // Helper function to call your API
// const registerTokenInBackend = async (token) => {
//   try {
//     const userToken = await AsyncStorage.getItem('authToken'); 
    
//     if (!userToken) {
//       console.log('[FCM] ⚠️ No user logged in, skipping backend registration');
//       return;
//     }

//     console.log('[FCM] 📤 Sending token to backend...');

//     await axios.post(
//       `${API_URL}/notifications/register-token`,
//       { token: token },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${userToken}` 
//         }
//       }
//     );
    
//     console.log('[FCM] ✅ Token registered successfully in Backend!');
    
//   } catch (error) {
//     // We suppress the error log to avoid clutter if it's just a duplicate key error
//     console.log('[FCM] ℹ️ Backend registration status:', error.response?.status || error.message);
//   }
// };

// export const setupNotificationListeners = () => {
//   // Handle foreground messages
//   const unsubscribe = messaging().onMessage(async remoteMessage => {
//     console.log('[FCM] 📡 Foreground Notification received:', remoteMessage);
    
//     // Manually show notification with sound and pop-up
//     PushNotification.localNotification({
//       channelId: 'chat_messages',
//       title: remoteMessage.notification.title,
//       message: remoteMessage.notification.body,
//       playSound: true,
//       soundName: 'default',
//       priority: 'high',
//       vibrate: true,
//       // Add these for better notification behavior
//       userInfo: remoteMessage.data,
//       actions: ['Reply', 'Mark as Read'],
//       largeIcon: remoteMessage.data?.otherUserPhotoURL || undefined,
//       bigText: remoteMessage.data?.text || remoteMessage.notification.body,
//       bigPictureUrl: remoteMessage.data?.attachment?.url || undefined,
//     });
//   });

//   // Handle background messages
//   messaging().setBackgroundMessageHandler(async remoteMessage => {
//     console.log('[FCM] 📡 Background Notification received:', remoteMessage);
//   });

//   return unsubscribe;
// };

// // Handle notification tap when app is in background
// export const setupNotificationTapHandler = (navigation) => {
//   // Check if app was opened from notification
//   messaging().getInitialNotification().then(remoteMessage => {
//     if (remoteMessage) {
//       console.log('[FCM] App opened from notification:', remoteMessage);
//       handleNotificationNavigation(remoteMessage.data, navigation);
//     }
//   });

//   // Handle notification when app is in background
//   messaging().onNotificationOpenedApp(remoteMessage => {
//     if (remoteMessage) {
//       console.log('[FCM] Notification opened app:', remoteMessage);
//       handleNotificationNavigation(remoteMessage.data, navigation);
//     }
//   });
// };

// // Navigate based on notification data
// const handleNotificationNavigation = (data, navigation) => {
//   if (!data || !navigation) return;
  
//   if (data.type === 'chat_message' && data.otherUserId) {
//     navigation.navigate('Message', {
//       user: { _id: data.otherUserId }
//     });
//   } else if (data.type === 'FRIEND_REQUEST') {
//     navigation.navigate('FriendRequests');
//   } else if (data.type === 'FRIEND_REQUEST_ACCEPTED') {
//     navigation.navigate('Friends');
//   }
// };






















































import messaging, { AuthorizationStatus } from '@react-native-firebase/messaging';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';
import PushNotification from 'react-native-push-notification';
import { getApp } from '@react-native-firebase/app';

const API_URL = 'http://10.136.59.126:5000/api'; 

// Create notification channel (call this once in your app)
PushNotification.createChannel(
  {
    channelId: 'chat_messages',
    channelName: 'Chat Messages',
    channelDescription: 'Notifications for new chat messages',
    soundName: 'default',
    importance: 4,
    vibrate: true,
  },
  (created) => console.log(`Channel created: ${created}`)
);

export const getFCMToken = async () => {
  try {
    // Check authorization status first
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log('[FCM] ⚠️ Notification permissions not granted');
      return null;
    }

    // 1. Check if token is already saved in storage
    let fcmToken = await AsyncStorage.getItem('fcmToken');

    if (!fcmToken) {
      // 2. Generate new token
      try {
        fcmToken = await messaging().getToken();
      } catch (error) {
        console.log('[FCM] ⚠️ Failed to fetch fresh token:', error);
        return null;
      }
      
      if (fcmToken) {
        console.log('[FCM] 🆕 New Token Generated:', fcmToken);
        await AsyncStorage.setItem('fcmToken', fcmToken);
      }
    } else {
      console.log('[FCM] 💾 Token found in storage:', fcmToken);
    }

    // 3. Send Token to Backend - Wait for user to be authenticated
    const userToken = await AsyncStorage.getItem('authToken');
    if (fcmToken && userToken) {
      await registerTokenInBackend(fcmToken);
    } else if (!userToken) {
      console.log('[FCM] ⚠️ User not authenticated, will register token after login');
      // Store token for later registration when user logs in
      if (fcmToken) {
        await AsyncStorage.setItem('pendingFcmToken', fcmToken);
      }
    }
    
    return fcmToken;
  } catch (error) {
    console.error('[FCM] ❌ Error getting token:', error);
    return null;
  }
};

// Helper function to call your API
const registerTokenInBackend = async (token) => {
  try {
    const userToken = await AsyncStorage.getItem('authToken'); 
    
    if (!userToken) {
      console.log('[FCM] ⚠️ No user logged in, skipping backend registration');
      return;
    }

    console.log('[FCM] 📤 Sending token to backend...');

    const response = await axios.post(
      `${API_URL}/notifications/register-token`,
      { token: token },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}` 
        },
        timeout: 5000, // Add timeout to prevent hanging
      }
    );
    
    console.log('[FCM] ✅ Token registered successfully in Backend!');
    
  } catch (error) {
    // Handle specific error cases
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log('[FCM] ⚠️ Backend registration error:', error.response.status, error.response.data);
      
      // If it's a 401 (unauthorized), clear the auth token
      if (error.response.status === 401) {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('userInfo');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.log('[FCM] ⚠️ No response from server:', error.message);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('[FCM] ⚠️ Request setup error:', error.message);
    }
  }
};

// Function to register pending FCM token after login
export const registerPendingFcmToken = async () => {
  try {
    const pendingToken = await AsyncStorage.getItem('pendingFcmToken');
    if (pendingToken) {
      console.log('[FCM] 🔄 Registering pending FCM token after login');
      await registerTokenInBackend(pendingToken);
      await AsyncStorage.removeItem('pendingFcmToken');
    }
  } catch (error) {
    console.error('[FCM] ❌ Error registering pending token:', error);
  }
};

export const setupNotificationListeners = () => {
  // Handle foreground messages
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('[FCM] 📡 Foreground Notification received:', remoteMessage);
    
    // Manually show notification with sound and pop-up
    PushNotification.localNotification({
      channelId: 'chat_messages',
      title: remoteMessage.notification.title,
      message: remoteMessage.notification.body,
      playSound: true,
      soundName: 'default',
      priority: 'high',
      vibrate: true,
      // Add these for better notification behavior
      userInfo: remoteMessage.data,
      actions: ['Reply', 'Mark as Read'],
      largeIcon: remoteMessage.data?.otherUserPhotoURL || undefined,
      bigText: remoteMessage.data?.text || remoteMessage.notification.body,
      bigPictureUrl: remoteMessage.data?.attachment?.url || undefined,
    });
  });

  // Handle background messages
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('[FCM] 📡 Background Notification received:', remoteMessage);
  });

  return unsubscribe;
};

// Handle notification tap when app is in background
export const setupNotificationTapHandler = (navigation) => {
  // Check if app was opened from notification
  messaging().getInitialNotification().then(remoteMessage => {
    if (remoteMessage) {
      console.log('[FCM] App opened from notification:', remoteMessage);
      handleNotificationNavigation(remoteMessage.data, navigation);
    }
  });

  // Handle notification when app is in background
  const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
    if (remoteMessage) {
      console.log('[FCM] Notification opened app:', remoteMessage);
      handleNotificationNavigation(remoteMessage.data, navigation);
    }
  });

  return unsubscribe;
};

// Navigate based on notification data
const handleNotificationNavigation = (data, navigation) => {
  if (!data || !navigation) return;
  
  if (data.type === 'chat_message' && data.otherUserId) {
    navigation.navigate('Message', {
      user: { _id: data.otherUserId }
    });
  } else if (data.type === 'FRIEND_REQUEST') {
    navigation.navigate('FriendRequests');
  } else if (data.type === 'FRIEND_REQUEST_ACCEPTED') {
    navigation.navigate('Friends');
  }
};



















































// import messaging from '@react-native-firebase/messaging';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';
// import { Platform } from 'react-native';
// import PushNotification from 'react-native-push-notification';

// const API_URL = 'http://10.136.59.126:5000/api'; 

// // Create notification channel (call this once in your app)
// PushNotification.createChannel(
//   {
//     channelId: 'chat_messages',
//     channelName: 'Chat Messages',
//     channelDescription: 'Notifications for new chat messages',
//     soundName: 'default',
//     importance: 4,
//     vibrate: true,
//   },
//   (created) => console.log(`Channel created: ${created}`)
// );

// export const getFCMToken = async () => {
  
//    try {
//     // 1. Check if token is already saved in storage
//     let fcmToken = await AsyncStorage.getItem('fcmToken');

//     if (!fcmToken) {
//       // 2. Generate new token
//       try {
//         fcmToken = await messaging().getToken();
//       } catch (error) {
//         console.log('[FCM] ⚠️ Failed to fetch fresh token:', error);
//       }
      
//       if (fcmToken) {
//         console.log('[FCM] 🆕 New Token Generated:', fcmToken);
//         await AsyncStorage.setItem('fcmToken', fcmToken);
//       }
//     } else {
//       console.log('[FCM] 💾 Token found in storage:', fcmToken);
//     }

//     // 3. Send Token to Backend
//     if (fcmToken) {
//       await registerTokenInBackend(fcmToken);
//     }
    
//   } catch (error) {
//     console.error('[FCM] ❌ Error getting token:', error);
//   }
// };

// // Helper function to call your API
// const registerTokenInBackend = async (token) => {
//   try {
//     const userToken = await AsyncStorage.getItem('userToken'); 
    
//     if (!userToken) {
//       console.log('[FCM] ⚠️ No user logged in, skipping backend registration');
//       return;
//     }

//     console.log('[FCM] 📤 Sending token to backend...');

//     await axios.post(
//       `${API_URL}/notifications/register-token`,
//       { token: token },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${userToken}` 
//         }
//       }
//     );
    
//     console.log('[FCM] ✅ Token registered successfully in Backend!');
    
//   } catch (error) {
//     // We suppress the error log to avoid clutter if it's just a duplicate key error
//     console.log('[FCM] ℹ️ Backend registration status:', error.response?.status || error.message);
//   }
// };

// export const setupNotificationListeners = () => {
//   // Handle foreground messages
//   const unsubscribe = messaging().onMessage(async remoteMessage => {
//     console.log('[FCM] 📡 Foreground Notification received:', remoteMessage);
    
//     // Manually show notification with sound and pop-up
//     PushNotification.localNotification({
//       channelId: 'chat_messages',
//       title: remoteMessage.notification.title,
//       message: remoteMessage.notification.body,
//       playSound: true,
//       soundName: 'default',
//       priority: 'high',
//       vibrate: true,
//       // Add these for better notification behavior
//       userInfo: remoteMessage.data,
//       actions: ['Reply', 'Mark as Read'],
//       largeIcon: remoteMessage.data?.otherUserPhotoURL || undefined,
//       bigText: remoteMessage.data?.text || remoteMessage.notification.body,
//       bigPictureUrl: remoteMessage.data?.attachment?.url || undefined,
//     });
//   });

//   return unsubscribe;
// };
