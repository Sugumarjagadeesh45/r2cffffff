// import { useState, useEffect, useCallback, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   StatusBar,
//   Image,
//   TouchableOpacity,
//   Alert,
//   Modal,
//   Platform,
//   KeyboardAvoidingView,
//   ScrollView,
//   TextInput,
//   FlatList,
//   Animated,
//   Dimensions,
//   Keyboard,
//   ActivityIndicator
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import messaging from '@react-native-firebase/messaging';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import API_URL from './utiliti/config';
// import * as socket from './services/socket';
// import * as userService from './services/userService';
// import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

// const { width, height } = Dimensions.get('window');

// // Professional color palette
// const COLORS = {
//   primary: '#075E54', // WhatsApp green
//   primaryDark: '#054A44',
//   accent: '#128C7E',
//   secondary: '#34B7F1',
//   success: '#25D366', // WhatsApp green
//   danger: '#FF3B30',
//   warning: '#FF9500',
//   background: '#ECE5DD', // WhatsApp light background
//   backgroundLight: '#FFFFFF',
//   backgroundLighter: '#F1F3F5',
//   cardDark: '#FFFFFF',
//   textPrimary: '#111B21',
//   textSecondary: '#667781',
//   textTertiary: '#8696A0',
//   incomingBg: '#FFFFFF',
//   outgoingBg: '#DCF8C6', // WhatsApp light green
//   outgoingBgDark: '#005C4B', // WhatsApp dark green for text
//   border: '#E9EDEF',
//   shadow: 'rgba(0, 0, 0, 0.1)',
//   online: '#4FC3F7',
//   typing: '#075E54',
//   readReceipts: '#53BDEB', // Blue for read receipts
// };

// const EMOJIS = [
//   ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇'],
//   ['🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚'],
//   ['😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩'],
//   ['🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣'],
//   ['😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬'],
//   ['😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔'],
//   ['🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦'],
//   ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔'],
//   ['👍', '👎', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✌️', '🤞'],
//   ['🤟', '🤘', '👌', '🤏', '✊', '👊', '🤛', '🤜', '💪', '🦵'],
// ];

// const MessageScreen = () => {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const { user: initialUser, otherUserId: paramOtherUserId, senderId: paramSenderId } = route.params || {};

//   const [socketStatus, setSocketStatus] = useState('disconnected');
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [fetchingUser, setFetchingUser] = useState(true);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [otherUser, setOtherUser] = useState(null);
//   const [moreMenuVisible, setMoreMenuVisible] = useState(false);
//   const [isTyping, setIsTyping] = useState(false);
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//   const [inputText, setInputText] = useState('');
//   const [keyboardHeight, setKeyboardHeight] = useState(0);
//   const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
//   const [selectedAttachment, setSelectedAttachment] = useState(null);
//   const [attachmentModalVisible, setAttachmentModalVisible] = useState(false);
//   const typingTimeoutRef = useRef(null);
//   const flatListRef = useRef(null);
//   const inputRef = useRef(null);

//   const [conversationMetadata, setConversationMetadata] = useState({
//     isPinned: false,
//     isBlocked: false,
//     customRingtone: '',
//     isFavorite: false,
//   });

//   const [lastSeen, setLastSeen] = useState('2:30 PM');

//   // Debug route params
//   useEffect(() => {
//     console.log('MessageScreen params:', route.params);
//   }, []);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       const status = socket.getSocketStatus();
//       console.log('[MessageScreen] Socket status:', status);
//       if (typeof status === 'object') {
//         setSocketStatus(status.connected ? 'connected' : 'disconnected');
//       } else {
//         setSocketStatus(status);
//       }
//     }, 5000);

//     return () => clearInterval(interval);
//   }, []);

//   // Fix the useEffect for socket listeners
//   useEffect(() => {
//     console.log('[MessageScreen] 🚀 Setting up socket listeners');
    
//     let isMounted = true;
//     let messageHandler = null;

//     const initializeSocket = async () => {
//       try {
//         await socket.initSocket();
        
//         if (!isMounted) return;
        
//         messageHandler = (newMessage) => {
//           if (!isMounted) return;
          
//           console.log('\n[MessageScreen] 📨 RECEIVED MESSAGE');
//           console.log('[MessageScreen] Message ID:', newMessage._id);
//           console.log('[MessageScreen] From:', newMessage.sender?._id);
          
//           const messageUserId = newMessage.sender._id || newMessage.sender.id;
//           const otherUserId = otherUser?._id || otherUser?.id;
          
//           // Ignore messages not from current chat partner
//           if (messageUserId !== otherUserId) {
//             console.log('[MessageScreen] ⚠️ Ignoring message from different user');
//             return;
//           }
          
//           // Check if this is a duplicate (based on message ID)
//           setMessages(prev => {
//             const exists = prev.find(msg => msg._id === newMessage._id);
//             if (exists) {
//               console.log('[MessageScreen] ⚠️ Message already exists, ignoring');
//               return prev;
//             }
            
//             const formattedMessage = {
//               _id: newMessage._id,
//               text: newMessage.text,
//               createdAt: new Date(newMessage.createdAt),
//               user: {
//                 _id: newMessage.sender._id,
//                 name: newMessage.sender.name,
//                 avatar: newMessage.sender.avatar || newMessage.sender.photoURL,
//               },
//               status: newMessage.status,
//               attachment: newMessage.attachment,
//             };
            
//             console.log('[MessageScreen] ✅ Adding new message');
//             return [...prev, formattedMessage];
//           });
//         };
        
//         // Register handler
//         socket.onReceiveMessage(messageHandler);
        
//         // Add status update listener
//         const statusHandler = (updatedMessage) => {
//           console.log('[MessageScreen] 📊 Status update:', updatedMessage._id);
//           setMessages(prev =>
//             prev.map(msg =>
//               msg._id === updatedMessage._id ? { 
//                 ...msg, 
//                 status: updatedMessage.status,
//                 ...(updatedMessage.deliveredAt && { deliveredAt: updatedMessage.deliveredAt }),
//                 ...(updatedMessage.readAt && { readAt: updatedMessage.readAt })
//               } : msg
//             )
//           );
//         };
        
//         socket.on('messageStatusUpdate', statusHandler);
        
//       } catch (error) {
//         console.error('[MessageScreen] ❌ Socket init error:', error);
//       }
//     };

//     initializeSocket();

//     // Cleanup function
//     return () => {
//       console.log('[MessageScreen] 🧹 Cleaning up socket listeners');
//       isMounted = false;
//       if (messageHandler) {
//         socket.offReceiveMessage(messageHandler);
//       }
//     };
//   }, [otherUser?._id]);

//   // Effect to load otherUser data
//   useEffect(() => {
//     const loadOtherUser = async () => {
//       try {
//         console.log('Loading other user...');
//         console.log('Params:', { initialUser, paramOtherUserId, paramSenderId });

//         if (initialUser) {
//           console.log('Initial user object:', initialUser);
          
//           if (initialUser._id || initialUser.id) {
//             console.log('Setting otherUser from initialUser');
            
//             const standardizedUser = {
//               ...initialUser,
//               _id: initialUser._id || initialUser.id,
//               id: initialUser.id || initialUser._id,
//               // Add professional title if not present
//               profession: initialUser.profession || initialUser.job || 'Software Developer',
//             };
            
//             console.log('Standardized user:', standardizedUser);
//             setOtherUser(standardizedUser);
//             setFetchingUser(false);
//             return;
//           }
//         }

//         let targetUserId = null;
        
//         if (paramOtherUserId) {
//           targetUserId = paramOtherUserId;
//         } else if (paramSenderId) {
//           targetUserId = paramSenderId;
//         }

//         if (!targetUserId) {
//           console.error('No valid user ID found from any parameter');
//           Alert.alert('Chat Error', 'Unable to identify chat partner. Please try again.');
//           navigation.goBack();
//           return;
//         }

//         console.log('Fetching user with ID:', targetUserId);
        
//         const token = await AsyncStorage.getItem('authToken');
//         if (!token) {
//           Alert.alert('Authentication Error', 'Please login again.');
//           navigation.navigate('Login');
//           return;
//         }

//         const response = await fetch(`${API_URL}/api/user/profile/${targetUserId}`, {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         });

//         if (response.ok) {
//           const data = await response.json();
//           if (data.success && data.data) {
//             console.log('User data fetched:', data.data);
//             // Add profession if not present
//             const userData = {
//               ...data.data,
//               profession: data.data.profession || data.data.job || 'Software Developer',
//             };
//             setOtherUser(userData);
//           } else {
//             Alert.alert('Error', 'User not found.');
//             navigation.goBack();
//           }
//         } else {
//           Alert.alert('Error', 'Failed to load user data.');
//           navigation.goBack();
//         }
//       } catch (error) {
//         console.error('Error loading other user:', error);
//         Alert.alert('Error', 'Failed to load chat.');
//         navigation.goBack();
//       } finally {
//         setFetchingUser(false);
//       }
//     };

//     loadOtherUser();
//   }, [initialUser, paramOtherUserId, paramSenderId]);

//   // Load current user
//   useEffect(() => {
//     const loadCurrentUser = async () => {
//       try {
//         const userInfoStr = await AsyncStorage.getItem('userInfo');
//         if (userInfoStr) {
//           const userInfo = JSON.parse(userInfoStr);
//           setCurrentUser(userInfo);
//         }
//       } catch (error) {
//         console.error('Error loading current user:', error);
//       }
//     };

//     loadCurrentUser();
//   }, []);

//   // Load messages once otherUser is loaded
//   useEffect(() => {
//     if (!otherUser || (!otherUser._id && !otherUser.id)) return;

//     const loadMessages = async () => {
//       try {
//         const token = await AsyncStorage.getItem('authToken');
//         const currentUserInfoStr = await AsyncStorage.getItem('userInfo');
//         const currentUserInfo = JSON.parse(currentUserInfoStr || '{}');
        
//         const otherUserId = otherUser._id || otherUser.id;
//         const currentUserId = currentUserInfo._id || currentUserInfo.id;

//         console.log(`Fetching messages between ${currentUserId} and ${otherUserId}`);

//         const response = await fetch(`${API_URL}/api/messages/${otherUserId}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         const data = await response.json();
//         if (data.success && data.data) {
//           const formattedMessages = data.data.map(msg => ({
//             _id: msg._id,
//             text: msg.text,
//             createdAt: new Date(msg.createdAt),
//             user: {
//               _id: msg.sender._id || msg.sender.id,
//               name: msg.sender.name,
//               avatar: msg.sender.avatar || msg.sender.photoURL || 'https://randomuser.me/api/portraits/men/1.jpg',
//             },
//             status: msg.status,
//             attachment: msg.attachment,
//           }));

//           setMessages(formattedMessages.reverse());
//         }
//       } catch (error) {
//         console.error('Error loading messages:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadMessages();

//     // Setup socket listeners
//     const messageHandler = (newMessage) => {
//       console.log('New message received:', newMessage);
      
//       const formattedMessage = {
//         _id: newMessage._id,
//         text: newMessage.text,
//         createdAt: new Date(newMessage.createdAt),
//         user: {
//           _id: newMessage.sender._id || newMessage.sender.id,
//           name: newMessage.sender.name,
//           avatar: newMessage.sender.avatar || newMessage.sender.photoURL || 'https://randomuser.me/api/portraits/men/1.jpg',
//         },
//         status: newMessage.status,
//         attachment: newMessage.attachment,
//       };

//       setMessages(prev => {
//         const filtered = prev.filter(msg => 
//           !(msg.status === 'pending' && msg.text === formattedMessage.text)
//         );
//         return [...filtered, formattedMessage];
//       });
//     };

//     socket.onReceiveMessage(messageHandler);

//     return () => {
//       socket.offReceiveMessage(messageHandler);
//     };
//   }, [otherUser]);

//   // Handle keyboard visibility
//   useEffect(() => {
//     const keyboardDidShowListener = Keyboard.addListener(
//       'keyboardDidShow',
//       (e) => {
//         setKeyboardHeight(e.endCoordinates.height);
//         setIsKeyboardVisible(true);
//         setShowEmojiPicker(false);
//       }
//     );
    
//     const keyboardDidHideListener = Keyboard.addListener(
//       'keyboardDidHide',
//       () => {
//         setKeyboardHeight(0);
//         setIsKeyboardVisible(false);
//       }
//     );

//     return () => {
//       keyboardDidShowListener.remove();
//       keyboardDidHideListener.remove();
//     };
//   }, []);

//   // Handle typing indicator
//   const handleInputTextChanged = useCallback((text) => {
//     setInputText(text);
//     const otherUserId = otherUser?._id || otherUser?.id;
    
//     if (otherUserId) {
//       if (text.length > 0) {
//         socket.emit('typing', { recipientId: otherUserId });
//         if (typingTimeoutRef.current) {
//           clearTimeout(typingTimeoutRef.current);
//         }
//         typingTimeoutRef.current = setTimeout(() => {
//           socket.emit('stopTyping', { recipientId: otherUserId });
//         }, 3000);
//       } else {
//         socket.emit('stopTyping', { recipientId: otherUserId });
//         if (typingTimeoutRef.current) {
//           clearTimeout(typingTimeoutRef.current);
//         }
//       }
//     }
//   }, [otherUser]);

//   // Typing status listener
//   useEffect(() => {
//     const otherUserId = otherUser?._id || otherUser?.id;
    
//     if (otherUserId) {
//       const typingStatusHandler = ({ senderId, isTyping: status }) => {
//         if (senderId === otherUserId) {
//           setIsTyping(status);
//         }
//       };
//       socket.on('typingStatus', typingStatusHandler);

//       return () => {
//         socket.off('typingStatus', typingStatusHandler);
//       };
//     }
//   }, [otherUser]);

//   const handleSend = () => {
//     const otherUserId = otherUser._id || otherUser.id;
//     const currentUserId = currentUser?._id || currentUser?.id;
    
//     if (!otherUserId || !currentUserId || (!inputText.trim() && !selectedAttachment)) {
//       return;
//     }

//     // Generate a temporary ID for optimistic update
//     const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
//     const newMessage = {
//       _id: tempId,
//       text: inputText.trim() || '',
//       createdAt: new Date(),
//       user: { 
//         _id: currentUserId,
//         name: currentUser?.name || 'You'
//       },
//       status: 'pending',
//       attachment: selectedAttachment,
//     };

//     console.log('[MessageScreen] Adding optimistic message with temp ID:', tempId);
//     setMessages(prev => [...prev, newMessage]);
    
//     // Send via socket
//     const success = socket.sendMessage(otherUserId, inputText.trim(), selectedAttachment);
    
//     if (success) {
//       console.log('[MessageScreen] ✅ Message sent via socket');
//     } else {
//       console.error('[MessageScreen] ❌ Socket send failed');
//       // Update status to failed
//       setMessages(prev =>
//         prev.map(msg =>
//           msg._id === tempId ? { ...msg, status: 'failed' } : msg
//         )
//       );
//     }
    
//     setInputText('');
//     setSelectedAttachment(null);
//     setShowEmojiPicker(false);
//   };

//   // HTTP fallback function
//   const sendViaHttpApi = async (recipientId, text, attachment) => {
//     try {
//       const token = await AsyncStorage.getItem('authToken');
//       const response = await fetch(`${API_URL}/api/messages/send`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           recipientId,
//           text,
//           attachment
//         }),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         console.log('[MessageScreen] HTTP API send success:', data);
//       } else {
//         console.error('[MessageScreen] HTTP API send failed:', response.status);
//       }
//     } catch (error) {
//       console.error('[MessageScreen] HTTP API send error:', error);
//     }
//   };

//   // Handle emoji selection
//   const handleEmojiSelect = (emoji) => {
//     setInputText(prev => prev + emoji);
//   };

//   // Handle attachment selection
//   const handleAttachment = () => {
//     setAttachmentModalVisible(true);
//   };

//   const selectImage = () => {
//     const options = {
//       mediaType: 'photo',
//       quality: 0.8,
//     };
    
//     launchImageLibrary(options, (response) => {
//       if (response.assets && response.assets[0]) {
//         setSelectedAttachment({
//           type: 'image',
//           uri: response.assets[0].uri,
//           name: response.assets[0].fileName,
//         });
//         setAttachmentModalVisible(false);
//       }
//     });
//   };

//   const selectCamera = () => {
//     const options = {
//       mediaType: 'photo',
//       quality: 0.8,
//     };
    
//     launchCamera(options, (response) => {
//       if (response.assets && response.assets[0]) {
//         setSelectedAttachment({
//           type: 'image',
//           uri: response.assets[0].uri,
//           name: response.assets[0].fileName,
//         });
//         setAttachmentModalVisible(false);
//       }
//     });
//   };

//   // Loading state
//   if (fetchingUser || !otherUser) {
//     return (
//       <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
//         <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={{ color: COLORS.textPrimary, marginTop: 20 }}>Loading chat...</Text>
//       </SafeAreaView>
//     );
//   }

//   // Main render
//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
//       {/* Header */}
//       <View style={styles.header}>
//         <View style={styles.headerContent}>
//           <TouchableOpacity 
//             onPress={() => navigation.goBack()} 
//             style={styles.backButton}
//           >
//             <Icon name="arrow-back" size={24} color={COLORS.backgroundLight} />
//           </TouchableOpacity>
          
//           <TouchableOpacity style={styles.userInfoContainer}>
//             <View style={styles.avatarContainer}>
//               <Image 
//                 source={{ uri: otherUser.photoURL || otherUser.avatar || 'https://randomuser.me/api/portraits/men/1.jpg' }} 
//                 style={styles.avatar}
//               />
//               {otherUser.isOnline && <View style={styles.onlineIndicator} />}
//             </View>
//             <View style={styles.userInfo}>
//               <Text style={styles.userName}>{otherUser.name || 'Unknown User'}</Text>
//               <View style={styles.statusContainer}>
//                 {isTyping ? (
//                   <View style={styles.typingContainer}>
//                     <View style={styles.typingDot} />
//                     <View style={[styles.typingDot, styles.typingDotMiddle]} />
//                     <View style={styles.typingDot} />
//                     <Text style={styles.typingText}>typing...</Text>
//                   </View>
//                 ) : (
//                   <Text style={styles.statusText}>
//                     {otherUser.isOnline ? 'Online' : `last seen ${lastSeen}`}
//                   </Text>
//                 )}
//               </View>
//             </View>
//           </TouchableOpacity>
          
//           <View style={styles.headerActions}>
//             <TouchableOpacity 
//               style={styles.headerActionButton}
//               onPress={() => Alert.alert('Video Call', 'Video call feature coming soon!')}
//             >
//               <Icon name="videocam" size={24} color={COLORS.backgroundLight} />
//             </TouchableOpacity>
            
//             <TouchableOpacity 
//               style={styles.headerActionButton}
//               onPress={() => Alert.alert('Voice Call', 'Voice call feature coming soon!')}
//             >
//               <Icon name="call" size={22} color={COLORS.backgroundLight} />
//             </TouchableOpacity>
            
//             <TouchableOpacity 
//               style={styles.headerActionButton}
//               onPress={() => setMoreMenuVisible(true)}
//             >
//               <Icon name="more-vert" size={24} color={COLORS.backgroundLight} />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>

//       {/* Chat Messages */}
//       <FlatList
//         ref={flatListRef}
//         data={messages}
//         renderItem={({ item }) => {
//           const messageUserId = item.user._id || item.user.id;
//           const currentUserId = currentUser?._id || currentUser?.id;
//           const isOutgoing = messageUserId === currentUserId;
          
//           return (
//             <View style={[
//               styles.messageItem,
//               isOutgoing ? styles.messageItemOutgoing : styles.messageItemIncoming
//             ]}>
//               <View style={[
//                 styles.messageBubble,
//                 isOutgoing ? styles.outgoingBubble : styles.incomingBubble
//               ]}>
//                 {item.attachment && (
//                   <View style={styles.attachmentContainer}>
//                     {item.attachment.type === 'image' ? (
//                       <Image 
//                         source={{ uri: item.attachment.uri }} 
//                         style={styles.attachmentImage}
//                       />
//                     ) : (
//                       <View style={styles.documentContainer}>
//                         <Icon name="insert-drive-file" size={24} color={COLORS.textSecondary} />
//                         <Text style={styles.documentName}>{item.attachment.name}</Text>
//                       </View>
//                     )}
//                   </View>
//                 )}
//                 {item.text && (
//                   <Text style={[
//                     styles.messageText,
//                     isOutgoing ? styles.outgoingMessageText : styles.incomingMessageText
//                   ]}>
//                     {item.text}
//                   </Text>
//                 )}
//                 <View style={styles.messageTimeContainer}>
//                   <Text style={[
//                     styles.messageTime,
//                     isOutgoing ? styles.outgoingMessageTime : styles.incomingMessageTime
//                   ]}>
//                     {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                   </Text>
//                   {isOutgoing && (
//                     <View style={styles.statusContainer}>
//                       {item.status === 'sent' && (
//                         <Icon name="check" size={16} color={COLORS.textTertiary} />
//                       )}
//                       {item.status === 'delivered' && (
//                         <Icon name="done-all" size={16} color={COLORS.textTertiary} />
//                       )}
//                       {item.status === 'read' && (
//                         <Icon name="done-all" size={16} color={COLORS.readReceipts} />
//                       )}
//                       {item.status === 'pending' && (
//                         <Icon name="schedule" size={16} color={COLORS.textTertiary} />
//                       )}
//                       {item.status === 'failed' && (
//                         <Icon name="error" size={16} color={COLORS.danger} />
//                       )}
//                     </View>
//                   )}
//                 </View>
//               </View>
//             </View>
//           );
//         }}
//         keyExtractor={(item) => item._id ? item._id.toString() : item.id ? item.id.toString() : Math.random().toString()}
//         contentContainerStyle={styles.messagesList}
//         inverted={false}
//         showsVerticalScrollIndicator={false}
//       />

//       {/* Attachment Modal */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={attachmentModalVisible}
//         onRequestClose={() => setAttachmentModalVisible(false)}
//       >
//         <TouchableOpacity 
//           style={styles.modalOverlay} 
//           activeOpacity={1} 
//           onPress={() => setAttachmentModalVisible(false)}
//         >
//           <View style={styles.attachmentModalContainer}>
//             <View style={styles.attachmentModalHandle} />
//             <Text style={styles.attachmentModalTitle}>Share</Text>
            
//             <View style={styles.attachmentOptions}>
//               <TouchableOpacity style={styles.attachmentOption} onPress={selectCamera}>
//                 <View style={styles.attachmentIconContainer}>
//                   <Icon name="photo-camera" size={28} color={COLORS.primary} />
//                 </View>
//                 <Text style={styles.attachmentOptionText}>Camera</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity style={styles.attachmentOption} onPress={selectImage}>
//                 <View style={styles.attachmentIconContainer}>
//                   <Icon name="image" size={28} color={COLORS.primary} />
//                 </View>
//                 <Text style={styles.attachmentOptionText}>Gallery</Text>
//               </TouchableOpacity>
//             </View>
            
//             <TouchableOpacity 
//               style={styles.cancelButton}
//               onPress={() => setAttachmentModalVisible(false)}
//             >
//               <Text style={styles.cancelButtonText}>Cancel</Text>
//             </TouchableOpacity>
//           </View>
//         </TouchableOpacity>
//       </Modal>

//       {/* Emoji Picker */}
//       {showEmojiPicker && (
//         <View style={styles.emojiPickerContainer}>
//           <ScrollView 
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={styles.emojiScrollView}
//           >
//             {EMOJIS.map((row, rowIndex) => (
//               <View key={rowIndex} style={styles.emojiRow}>
//                 {row.map((emoji, emojiIndex) => (
//                   <TouchableOpacity
//                     key={emojiIndex}
//                     style={styles.emojiItem}
//                     onPress={() => handleEmojiSelect(emoji)}
//                   >
//                     <Text style={styles.emojiText}>{emoji}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             ))}
//           </ScrollView>
//         </View>
//       )}

//       {/* Selected Attachment Preview */}
//       {selectedAttachment && (
//         <View style={styles.selectedAttachmentContainer}>
//           {selectedAttachment.type === 'image' ? (
//             <View style={styles.selectedImageContainer}>
//               <Image 
//                 source={{ uri: selectedAttachment.uri }} 
//                 style={styles.selectedImage}
//               />
//               <TouchableOpacity 
//                 style={styles.removeAttachmentButton}
//                 onPress={() => setSelectedAttachment(null)}
//               >
//                 <Icon name="close" size={18} color={COLORS.textPrimary} />
//               </TouchableOpacity>
//             </View>
//           ) : (
//             <View style={styles.selectedDocumentContainer}>
//               <Icon name="insert-drive-file" size={24} color={COLORS.textSecondary} />
//               <Text style={styles.selectedDocumentName} numberOfLines={1}>{selectedAttachment.name}</Text>
//               <TouchableOpacity 
//                 style={styles.removeAttachmentButton}
//                 onPress={() => setSelectedAttachment(null)}
//               >
//                 <Icon name="close" size={18} color={COLORS.textPrimary} />
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>
//       )}

//       {/* Input Area */}
//       <View style={[
//         styles.inputContainer,
//         { marginBottom: showEmojiPicker ? 0 : keyboardHeight }
//       ]}>
//         <View style={styles.inputWrapper}>
//           <TouchableOpacity 
//             style={styles.emojiButton}
//             onPress={() => setShowEmojiPicker(!showEmojiPicker)}
//           >
//             <Icon 
//               name={showEmojiPicker ? "keyboard" : "insert-emoticon"} 
//               size={24} 
//               color={COLORS.textTertiary} 
//             />
//           </TouchableOpacity>

//           <TouchableOpacity 
//             style={styles.attachmentButton}
//             onPress={handleAttachment}
//           >
//             <Icon name="attach-file" size={24} color={COLORS.textTertiary} />
//           </TouchableOpacity>

//           <View style={styles.textInputContainer}>
//             <TextInput
//               ref={inputRef}
//               style={styles.textInput}
//               value={inputText}
//               onChangeText={handleInputTextChanged}
//               placeholder="Type a message..."
//               placeholderTextColor={COLORS.textTertiary}
//               multiline
//             />
//           </View>

//           <TouchableOpacity 
//             style={[
//               styles.sendButton,
//               (!inputText.trim() && !selectedAttachment) && styles.sendButtonDisabled
//             ]}
//             onPress={handleSend}
//             disabled={!inputText.trim() && !selectedAttachment}
//           >
//             <Icon name="send" size={20} color="#FFFFFF" />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* More Options Modal */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={moreMenuVisible}
//         onRequestClose={() => setMoreMenuVisible(false)}
//       >
//         <TouchableOpacity 
//           style={styles.modalOverlay} 
//           activeOpacity={1} 
//           onPress={() => setMoreMenuVisible(false)}
//         >
//           <View style={styles.moreMenuContainer}>
//             <View style={styles.moreMenuHandle} />
//             <Text style={styles.moreMenuTitle}>More Options</Text>
            
//             <View style={styles.moreMenuContent}>
//               <TouchableOpacity style={styles.menuOption}>
//                 <Icon name="info" size={24} color={COLORS.textSecondary} />
//                 <Text style={styles.menuOptionText}>View Contact</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity style={styles.menuOption}>
//                 <Icon name="search" size={24} color={COLORS.textSecondary} />
//                 <Text style={styles.menuOptionText}>Search</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity style={styles.menuOption}>
//                 <Icon name="volume-off" size={24} color={COLORS.textSecondary} />
//                 <Text style={styles.menuOptionText}>Mute Notifications</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity style={styles.menuOption}>
//                 <Icon name="wallpaper" size={24} color={COLORS.textSecondary} />
//                 <Text style={styles.menuOptionText}>Wallpaper</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity style={styles.menuOption}>
//                 <Icon name="lock" size={24} color={COLORS.textSecondary} />
//                 <Text style={styles.menuOptionText}>Encryption</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity style={[styles.menuOption, styles.dangerOption]}>
//                 <Icon name="block" size={24} color={COLORS.danger} />
//                 <Text style={[styles.menuOptionText, styles.dangerText]}>Block</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity style={[styles.menuOption, styles.dangerOption]}>
//                 <Icon name="delete" size={24} color={COLORS.danger} />
//                 <Text style={[styles.menuOptionText, styles.dangerText]}>Delete Chat</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </TouchableOpacity>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//   },
//   header: {
//     backgroundColor: COLORS.primary,
//     shadowColor: COLORS.shadow,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 4,
//     zIndex: 10,
//   },
//   headerContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     height: 60,
//   },
//   backButton: {
//     padding: 6,
//     marginRight: 8,
//   },
//   userInfoContainer: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   avatarContainer: {
//     position: 'relative',
//     marginRight: 12,
//   },
//   avatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//   },
//   onlineIndicator: {
//     position: 'absolute',
//     bottom: 0,
//     right: 0,
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     backgroundColor: COLORS.online,
//     borderWidth: 2,
//     borderColor: COLORS.primary,
//   },
//   userInfo: {
//     flex: 1,
//   },
//   userName: {
//     color: COLORS.backgroundLight,
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   statusContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 2,
//   },
//   typingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   typingDot: {
//     width: 4,
//     height: 4,
//     borderRadius: 2,
//     backgroundColor: COLORS.backgroundLight,
//     marginHorizontal: 1,
//   },
//   typingDotMiddle: {
//     opacity: 0.7,
//   },
//   typingText: {
//     color: COLORS.backgroundLight,
//     fontSize: 12,
//     marginLeft: 6,
//     fontStyle: 'italic',
//   },
//   statusText: {
//     color: 'rgba(255, 255, 255, 0.8)',
//     fontSize: 13,
//   },
//   headerActions: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   headerActionButton: {
//     padding: 8,
//     marginLeft: 8,
//   },
//   messagesList: {
//     paddingHorizontal: 8,
//     paddingVertical: 8,
//     paddingBottom: 10,
//   },
//   messageItem: {
//     marginVertical: 2,
//     maxWidth: '80%',
//   },
//   messageItemOutgoing: {
//     alignSelf: 'flex-end',
//   },
//   messageItemIncoming: {
//     alignSelf: 'flex-start',
//   },
//   messageBubble: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 18,
//     shadowColor: COLORS.shadow,
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   outgoingBubble: {
//     backgroundColor: COLORS.outgoingBg,
//     borderBottomRightRadius: 4,
//   },
//   incomingBubble: {
//     backgroundColor: COLORS.incomingBg,
//     borderBottomLeftRadius: 4,
//   },
//   messageText: {
//     fontSize: 16,
//     lineHeight: 20,
//   },
//   outgoingMessageText: {
//     color: COLORS.textPrimary,
//   },
//   incomingMessageText: {
//     color: COLORS.textPrimary,
//   },
//   messageTimeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//     marginTop: 4,
//   },
//   messageTime: {
//     fontSize: 11,
//   },
//   outgoingMessageTime: {
//     color: COLORS.textTertiary,
//   },
//   incomingMessageTime: {
//     color: COLORS.textTertiary,
//   },
//   statusContainer: {
//     marginLeft: 4,
//   },
//   attachmentContainer: {
//     marginBottom: 8,
//   },
//   attachmentImage: {
//     width: 200,
//     height: 200,
//     borderRadius: 8,
//   },
//   documentContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 12,
//     backgroundColor: 'rgba(0, 0, 0, 0.05)',
//     borderRadius: 8,
//   },
//   documentName: {
//     marginLeft: 8,
//     fontSize: 14,
//     color: COLORS.textPrimary,
//   },
//   inputContainer: {
//     backgroundColor: COLORS.backgroundLight,
//     borderTopWidth: 1,
//     borderTopColor: COLORS.border,
//     paddingHorizontal: 8,
//     paddingVertical: 8,
//   },
//   inputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     minHeight: 50,
//   },
//   emojiButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 20,
//   },
//   attachmentButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 20,
//     transform: [{ rotate: '-45deg' }],
//   },
//   textInputContainer: {
//     flex: 1,
//     marginHorizontal: 8,
//     backgroundColor: COLORS.backgroundLighter,
//     borderRadius: 24,
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     maxHeight: 120,
//     minHeight: 40,
//     justifyContent: 'center',
//   },
//   textInput: {
//     fontSize: 16,
//     color: COLORS.textPrimary,
//     paddingVertical: 6,
//     maxHeight: 100,
//     minHeight: 24,
//     textAlignVertical: 'center',
//   },
//   sendButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: COLORS.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   sendButtonDisabled: {
//     backgroundColor: COLORS.backgroundLighter,
//   },
//   emojiPickerContainer: {
//     height: 250,
//     backgroundColor: COLORS.backgroundLight,
//     borderTopWidth: 1,
//     borderTopColor: COLORS.border,
//   },
//   emojiScrollView: {
//     flex: 1,
//     paddingHorizontal: 8,
//     paddingVertical: 12,
//   },
//   emojiRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 8,
//   },
//   emojiItem: {
//     width: 36,
//     height: 36,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 8,
//   },
//   emojiText: {
//     fontSize: 24,
//   },
//   selectedAttachmentContainer: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderTopWidth: 1,
//     borderTopColor: COLORS.border,
//   },
//   selectedImageContainer: {
//     position: 'relative',
//     alignSelf: 'flex-start',
//   },
//   selectedImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 8,
//   },
//   selectedDocumentContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 12,
//     backgroundColor: COLORS.backgroundLighter,
//     borderRadius: 8,
//   },
//   selectedDocumentName: {
//     flex: 1,
//     marginLeft: 8,
//     fontSize: 14,
//     color: COLORS.textPrimary,
//   },
//   removeAttachmentButton: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     backgroundColor: 'rgba(0, 0, 0, 0.2)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: 8,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.4)',
//     justifyContent: 'flex-end',
//   },
//   attachmentModalContainer: {
//     backgroundColor: COLORS.backgroundLight,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     paddingBottom: 30,
//   },
//   attachmentModalHandle: {
//     width: 40,
//     height: 5,
//     backgroundColor: COLORS.textTertiary,
//     borderRadius: 3,
//     alignSelf: 'center',
//     marginTop: 10,
//     marginBottom: 15,
//   },
//   attachmentModalTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   attachmentOptions: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginBottom: 20,
//   },
//   attachmentOption: {
//     alignItems: 'center',
//     paddingVertical: 10,
//   },
//   attachmentIconContainer: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: COLORS.backgroundLighter,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   attachmentOptionText: {
//     fontSize: 14,
//     color: COLORS.textPrimary,
//   },
//   cancelButton: {
//     paddingVertical: 12,
//     alignItems: 'center',
//     borderTopWidth: 1,
//     borderTopColor: COLORS.border,
//   },
//   cancelButtonText: {
//     fontSize: 18,
//     color: COLORS.danger,
//     fontWeight: '500',
//   },
//   moreMenuContainer: {
//     backgroundColor: COLORS.backgroundLight,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     paddingBottom: 30,
//   },
//   moreMenuHandle: {
//     width: 40,
//     height: 5,
//     backgroundColor: COLORS.textTertiary,
//     borderRadius: 3,
//     alignSelf: 'center',
//     marginTop: 10,
//     marginBottom: 15,
//   },
//   moreMenuTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   moreMenuContent: {
//     paddingHorizontal: 20,
//   },
//   menuOption: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.border,
//   },
//   menuOptionText: {
//     fontSize: 16,
//     color: COLORS.textPrimary,
//     marginLeft: 15,
//   },
//   dangerOption: {
//     // No additional styles needed
//   },
//   dangerText: {
//     color: COLORS.danger,
//   },
// });

// export default MessageScreen;


























































































import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  FlatList,
  Dimensions,
  Keyboard,
  ActivityIndicator,
  ImageBackground
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Added for more modern icons
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

// Import your existing utilities
import API_URL from './utiliti/config';
import * as socket from './services/socket';

const { width } = Dimensions.get('window');

// Professional WhatsApp/Telegram Style Palette
const COLORS = {
  primary: '#007AFF', // Modern Blue (iMessage style)
  primaryDark: '#0056b3',
  background: '#EFEFF4', // Chat background gray
  headerBg: '#FFFFFF',
  textPrimary: '#000000',
  textSecondary: '#8E8E93',
  textTime: '#8E8E93',
  
  // Message Bubbles
  outgoingBubble: '#007AFF', // Blue for sender
  outgoingText: '#FFFFFF',
  incomingBubble: '#FFFFFF', // White for receiver
  incomingText: '#000000',
  
  inputBg: '#FFFFFF',
  border: '#E5E5EA',
  danger: '#FF3B30',
  success: '#34C759',
  
  // Ticks
  tickSent: '#E5E5EA',
  tickRead: '#FF3B30', // RED as requested
};

const EMOJIS = [
  ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇'],
  ['🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚'],
  ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔'],
  ['👍', '👎', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✌️', '🤞'],
];

const MessageScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user: initialUser, otherUserId: paramOtherUserId, senderId: paramSenderId } = route.params || {};

  // --- STATE MANAGEMENT ---
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [inputText, setInputText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [attachmentModalVisible, setAttachmentModalVisible] = useState(false);
  
  const typingTimeoutRef = useRef(null);
  const flatListRef = useRef(null);
  const inputRef = useRef(null);
  const [lastSeen, setLastSeen] = useState('2:30 PM'); // Dynamic in real app

  // --- SOCKET CONNECTION ---
  useEffect(() => {
    console.log('[MessageScreen] 🚀 Setting up socket listeners');
    let isMounted = true;
    let messageHandler = null;

    const initializeSocket = async () => {
      try {
        await socket.initSocket();
        if (!isMounted) return;
        
        messageHandler = (newMessage) => {
          if (!isMounted) return;
          const messageUserId = newMessage.sender._id || newMessage.sender.id;
          const otherUserId = otherUser?._id || otherUser?.id;
          
          if (messageUserId !== otherUserId) return;
          
          setMessages(prev => {
            const exists = prev.find(msg => msg._id === newMessage._id);
            if (exists) return prev;
            
            const formattedMessage = {
              _id: newMessage._id,
              text: newMessage.text,
              createdAt: new Date(newMessage.createdAt),
              user: {
                _id: newMessage.sender._id,
                name: newMessage.sender.name,
                avatar: newMessage.sender.avatar,
              },
              status: newMessage.status,
              attachment: newMessage.attachment,
            };
            return [...prev, formattedMessage]; // Append to end (FlatList not inverted here)
          });
        };
        
        socket.onReceiveMessage(messageHandler);
        
        socket.on('messageStatusUpdate', (updatedMessage) => {
          setMessages(prev =>
            prev.map(msg =>
              msg._id === updatedMessage._id ? { 
                ...msg, 
                status: updatedMessage.status 
              } : msg
            )
          );
        });

      } catch (error) {
        console.error('Socket error:', error);
      }
    };

    initializeSocket();

    return () => {
      isMounted = false;
      if (messageHandler) socket.offReceiveMessage(messageHandler);
    };
  }, [otherUser?._id]);

  // --- DATA LOADING ---
  useEffect(() => {
    const loadData = async () => {
        // 1. Load Current User
        const userInfoStr = await AsyncStorage.getItem('userInfo');
        if (userInfoStr) setCurrentUser(JSON.parse(userInfoStr));

        // 2. Load Other User
        let targetId = paramOtherUserId || paramSenderId || (initialUser?._id || initialUser?.id);
        
        if (initialUser && (initialUser._id || initialUser.id)) {
            setOtherUser({
                ...initialUser,
                _id: initialUser._id || initialUser.id
            });
            setFetchingUser(false);
        } else if (targetId) {
            try {
                const token = await AsyncStorage.getItem('authToken');
                const response = await fetch(`${API_URL}/api/user/profile/${targetId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) setOtherUser(data.data);
            } catch (e) {
                console.error(e);
            } finally {
                setFetchingUser(false);
            }
        }
    };
    loadData();
  }, [initialUser, paramOtherUserId, paramSenderId]);

  // --- LOAD MESSAGES ---
  useEffect(() => {
    if (!otherUser) return;
    const loadMessages = async () => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            const otherId = otherUser._id || otherUser.id;
            const response = await fetch(`${API_URL}/api/messages/${otherId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success && data.data) {
                const formatted = data.data.map(msg => ({
                    _id: msg._id,
                    text: msg.text,
                    createdAt: new Date(msg.createdAt),
                    user: {
                        _id: msg.sender._id || msg.sender.id,
                        name: msg.sender.name,
                        avatar: msg.sender.avatar
                    },
                    status: msg.status,
                    attachment: msg.attachment
                }));
                setMessages(formatted.reverse()); // Use reverse if using inverted list, else normal
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    loadMessages();
  }, [otherUser]);

  // --- KEYBOARD HANDLING ---
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setShowEmojiPicker(false);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  // --- HANDLERS ---
  const handleInputTextChanged = (text) => {
    setInputText(text);
    const otherId = otherUser?._id || otherUser?.id;
    if (otherId) {
        socket.emit('typing', { recipientId: otherId });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stopTyping', { recipientId: otherId });
        }, 3000);
    }
  };

  const handleSend = () => {
    const otherId = otherUser?._id || otherUser?.id;
    const currentId = currentUser?._id || currentUser?.id;
    
    if (!otherId || !currentId || (!inputText.trim() && !selectedAttachment)) return;

    const tempId = `temp_${Date.now()}`;
    const newMessage = {
        _id: tempId,
        text: inputText.trim(),
        createdAt: new Date(),
        user: { _id: currentId, name: currentUser.name },
        status: 'pending',
        attachment: selectedAttachment,
    };

    setMessages(prev => [...prev, newMessage]);
    socket.sendMessage(otherId, inputText.trim(), selectedAttachment);
    
    setInputText('');
    setSelectedAttachment(null);
    setShowEmojiPicker(false);
    
    // Scroll to bottom
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleEmojiSelect = (emoji) => setInputText(prev => prev + emoji);
  
  const selectImage = (type) => {
    const options = { mediaType: 'photo', quality: 0.8 };
    const callback = (res) => {
        if (res.assets?.[0]) {
            setSelectedAttachment({ type: 'image', uri: res.assets[0].uri, name: res.assets[0].fileName });
            setAttachmentModalVisible(false);
        }
    };
    type === 'camera' ? launchCamera(options, callback) : launchImageLibrary(options, callback);
  };

  // --- RENDER HELPERS ---
  const renderTicks = (status, isOutgoing) => {
    if (!isOutgoing) return null;
    
    // Logic: 1 tick = sent, 2 ticks gray = delivered, 2 ticks red = read
    if (status === 'pending') return <Icon name="access-time" size={14} color="#FFF" style={{marginLeft: 4}} />;
    if (status === 'sent') return <Icon name="check" size={16} color="#FFF" style={{marginLeft: 4}} />;
    if (status === 'delivered') return <Icon name="done-all" size={16} color="rgba(255,255,255,0.7)" style={{marginLeft: 4}} />;
    if (status === 'read') return <Icon name="done-all" size={16} color={COLORS.tickRead} style={{marginLeft: 4}} />; // RED TICKS
    
    // Default fallback
    return <Icon name="check" size={16} color="#FFF" style={{marginLeft: 4}} />;
  };

  if (fetchingUser || !otherUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.headerBg} />
      
      {/* --- PROFESSIONAL HEADER --- */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
            <Image 
                source={{ uri: otherUser.photoURL || otherUser.avatar || 'https://via.placeholder.com/150' }} 
                style={styles.headerAvatar} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerInfo} activeOpacity={0.7} onPress={() => setMoreMenuVisible(true)}>
            <Text style={styles.headerName} numberOfLines={1}>{otherUser.name}</Text>
            {isTyping ? (
                 <Text style={[styles.headerStatus, { color: COLORS.primary }]}>Typing...</Text>
            ) : (
                 <Text style={styles.headerStatus}>
                   {otherUser.isOnline ? 'Online' : `Last seen ${lastSeen}`}
                 </Text>
            )}
          </TouchableOpacity>

          <View style={styles.headerIcons}>
             <TouchableOpacity style={styles.iconBtn} onPress={() => Alert.alert('Video Call')}>
                <Ionicons name="videocam-outline" size={26} color={COLORS.primary} />
             </TouchableOpacity>
             <TouchableOpacity style={styles.iconBtn} onPress={() => Alert.alert('Voice Call')}>
                <Ionicons name="call-outline" size={24} color={COLORS.primary} />
             </TouchableOpacity>
             <TouchableOpacity style={styles.iconBtn} onPress={() => setMoreMenuVisible(true)}>
                <Ionicons name="ellipsis-vertical" size={22} color={COLORS.textPrimary} />
             </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* --- CHAT BACKGROUND & LIST --- */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
          {/* Optional: Add a subtle background image here via ImageBackground */}
          <FlatList
            ref={flatListRef}
            data={messages}
            // Note: Standard chat lists are usually inverted, but your logic uses normal order. 
            // If new messages appear at bottom, keep inverted={false}
            inverted={false} 
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            keyExtractor={item => item._id.toString()}
            renderItem={({ item }) => {
                const messageUserId = item.user._id || item.user.id;
                const currentUserId = currentUser?._id || currentUser?.id;
                const isOutgoing = messageUserId === currentUserId;

                return (
                    <View style={[
                        styles.msgRow, 
                        isOutgoing ? styles.msgRowRight : styles.msgRowLeft
                    ]}>
                        <View style={[
                            styles.bubble, 
                            isOutgoing ? styles.bubbleRight : styles.bubbleLeft
                        ]}>
                            {/* Attachment Preview */}
                            {item.attachment && (
                                <View style={styles.msgAttachment}>
                                    {item.attachment.type === 'image' ? (
                                        <Image source={{ uri: item.attachment.uri }} style={styles.msgImage} />
                                    ) : (
                                        <View style={styles.fileContainer}>
                                            <Icon name="insert-drive-file" size={24} color={isOutgoing ? '#FFF' : '#555'} />
                                            <Text style={[styles.msgText, {color: isOutgoing ? '#FFF' : '#000'}]}>File</Text>
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* Message Text */}
                            {item.text ? (
                                <Text style={[
                                    styles.msgText, 
                                    isOutgoing ? styles.textRight : styles.textLeft
                                ]}>
                                    {item.text}
                                </Text>
                            ) : null}

                            {/* Time & Ticks */}
                            <View style={styles.metaContainer}>
                                <Text style={[
                                    styles.timeText, 
                                    isOutgoing ? styles.timeRight : styles.timeLeft
                                ]}>
                                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                                {renderTicks(item.status, isOutgoing)}
                            </View>
                        </View>
                    </View>
                );
            }}
          />

          {/* --- INPUT AREA --- */}
          <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
             
             {/* Selected Attachment Preview in Input */}
             {selectedAttachment && (
                <View style={styles.inputAttachmentPreview}>
                    <Icon name="image" size={20} color={COLORS.primary} />
                    <Text style={{flex:1, marginHorizontal: 10}} numberOfLines={1}>Attached Image</Text>
                    <TouchableOpacity onPress={() => setSelectedAttachment(null)}>
                        <Icon name="close" size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                </View>
             )}

             <View style={styles.inputRow}>
                <View style={styles.inputFieldContainer}>
                    <TouchableOpacity onPress={() => setShowEmojiPicker(!showEmojiPicker)} style={styles.iconButtonLeft}>
                        <Icon name="emoji-emotions" size={26} color={COLORS.textSecondary} />
                    </TouchableOpacity>

                    <TextInput
                        ref={inputRef}
                        style={styles.textInput}
                        value={inputText}
                        onChangeText={handleInputTextChanged}
                        placeholder="Message"
                        placeholderTextColor="#999"
                        multiline
                    />

                    <TouchableOpacity onPress={() => setAttachmentModalVisible(true)} style={styles.iconButtonRight}>
                        <Icon name="attach-file" size={24} color={COLORS.textSecondary} style={{transform: [{rotate: '45deg'}]}} />
                    </TouchableOpacity>
                    
                    {!inputText && (
                         <TouchableOpacity onPress={selectImage.bind(null, 'camera')} style={styles.iconButtonRight}>
                            <Icon name="camera-alt" size={24} color={COLORS.textSecondary} />
                         </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity 
                    style={styles.sendBtnCircle} 
                    onPress={handleSend}
                    disabled={!inputText.trim() && !selectedAttachment}
                >
                    {inputText.trim() || selectedAttachment ? (
                         <Icon name="send" size={22} color="#FFF" style={{marginLeft: 2}} />
                    ) : (
                         <Icon name="mic" size={24} color="#FFF" /> 
                    )}
                </TouchableOpacity>
             </View>
             
             {/* Emoji Picker View */}
             {showEmojiPicker && (
                <View style={{ height: 250, backgroundColor: '#F2F2F7' }}>
                    <ScrollView contentContainerStyle={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', padding: 10}}>
                        {EMOJIS.flat().map((emoji, i) => (
                            <TouchableOpacity key={i} onPress={() => handleEmojiSelect(emoji)} style={{padding: 10}}>
                                <Text style={{fontSize: 28}}>{emoji}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
             )}
          </View>
      </KeyboardAvoidingView>

      {/* --- ATTACHMENT MODAL --- */}
      <Modal transparent visible={attachmentModalVisible} animationType="slide" onRequestClose={() => setAttachmentModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setAttachmentModalVisible(false)}>
           <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Share Content</Text>
              <View style={styles.modalGrid}>
                  <TouchableOpacity style={styles.modalItem} onPress={() => selectImage('camera')}>
                      <View style={[styles.modalIcon, {backgroundColor: '#E3F2FD'}]}>
                         <Icon name="photo-camera" size={28} color="#2196F3" />
                      </View>
                      <Text style={styles.modalLabel}>Camera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalItem} onPress={() => selectImage('gallery')}>
                      <View style={[styles.modalIcon, {backgroundColor: '#F3E5F5'}]}>
                         <Icon name="photo-library" size={28} color="#9C27B0" />
                      </View>
                      <Text style={styles.modalLabel}>Gallery</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalItem}>
                      <View style={[styles.modalIcon, {backgroundColor: '#E8F5E9'}]}>
                         <Icon name="insert-drive-file" size={28} color="#4CAF50" />
                      </View>
                      <Text style={styles.modalLabel}>Document</Text>
                  </TouchableOpacity>
              </View>
           </View>
        </TouchableOpacity>
      </Modal>

      {/* --- MORE MENU MODAL --- */}
      <Modal transparent visible={moreMenuVisible} animationType="fade" onRequestClose={() => setMoreMenuVisible(false)}>
         <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setMoreMenuVisible(false)}>
            <View style={styles.menuContainer}>
               <TouchableOpacity style={styles.menuItem}><Text>View Contact</Text></TouchableOpacity>
               <TouchableOpacity style={styles.menuItem}><Text>Search</Text></TouchableOpacity>
               <TouchableOpacity style={styles.menuItem}><Text>Wallpaper</Text></TouchableOpacity>
               <TouchableOpacity style={styles.menuItem}><Text style={{color: 'red'}}>Block User</Text></TouchableOpacity>
            </View>
         </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // --- HEADER STYLES ---
  header: {
    backgroundColor: COLORS.headerBg,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    paddingHorizontal: 10,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginLeft: 5,
    backgroundColor: '#ddd',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerStatus: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 8,
    marginLeft: 5,
  },

  // --- MESSAGES STYLES ---
  listContent: {
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  msgRow: {
    marginVertical: 2,
    flexDirection: 'row',
    width: '100%',
  },
  msgRowLeft: {
    justifyContent: 'flex-start',
  },
  msgRowRight: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    elevation: 1,
  },
  bubbleLeft: {
    backgroundColor: COLORS.incomingBubble,
    borderTopLeftRadius: 0,
    marginLeft: 5,
  },
  bubbleRight: {
    backgroundColor: COLORS.outgoingBubble,
    borderTopRightRadius: 0,
    marginRight: 5,
  },
  msgText: {
    fontSize: 16,
    lineHeight: 22,
  },
  textLeft: {
    color: COLORS.incomingText,
  },
  textRight: {
    color: COLORS.outgoingText,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 2,
  },
  timeText: {
    fontSize: 10,
  },
  timeLeft: {
    color: '#8E8E93',
  },
  timeRight: {
    color: 'rgba(255,255,255,0.7)',
  },
  msgImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 5,
  },

  // --- INPUT STYLES ---
  inputContainer: {
    backgroundColor: '#F6F6F6',
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 5,
  },
  inputFieldContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    minHeight: 45,
    paddingHorizontal: 5,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#000',
  },
  iconButtonLeft: {
    padding: 8,
  },
  iconButtonRight: {
    padding: 8,
  },
  sendBtnCircle: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    marginBottom: 0, 
  },
  inputAttachmentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 10,
    marginBottom: 5,
    marginHorizontal: 5,
  },

  // --- MODAL STYLES ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  modalItem: {
    alignItems: 'center',
  },
  modalIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalLabel: {
    fontSize: 14,
    color: '#333',
  },
  menuOverlay: {
      flex: 1,
      backgroundColor: 'transparent',
  },
  menuContainer: {
      position: 'absolute',
      top: 60,
      right: 10,
      backgroundColor: '#FFF',
      borderRadius: 8,
      padding: 5,
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      width: 180,
  },
  menuItem: {
      padding: 12,
  }
});

export default MessageScreen;


// import { useState, useEffect, useCallback, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   StatusBar,
//   Image,
//   TouchableOpacity,
//   Alert,
//   Modal,
//   Platform,
//   KeyboardAvoidingView,
//   ScrollView,
//   TextInput,
//   FlatList,
//   Animated,
//   Dimensions,
//   Keyboard,
//   ActivityIndicator
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import FontAwesome from 'react-native-vector-icons/FontAwesome';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import { useRoute, useNavigation } from '@react-navigation/native';

// import messaging from '@react-native-firebase/messaging';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import API_URL from './utiliti/config';
// import * as socket from './services/socket';
// import * as userService from './services/userService';
// import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

// const { width, height } = Dimensions.get('window');

// // Professional WhatsApp-inspired color palette
// const COLORS = {
//   primary: '#0084ff', // WhatsApp blue
//   primaryDark: '#0073e6',
//   accent: '#25D366', // WhatsApp green
//   secondary: '#8E8E93',
//   success: '#34C759',
//   danger: '#FF3B30',
//   warning: '#FF9500',
//   background: '#0C151E', // Dark background like WhatsApp dark mode
//   backgroundLight: '#1F2C35', // Chat background dark
//   backgroundLighter: '#2A3943', // Input background
//   cardDark: '#1F2C35',
//   textPrimary: '#FFFFFF',
//   textSecondary: '#A0A0A0',
//   textTertiary: '#6B7C85',
//   incomingBg: '#2A3943', // Received messages
//   outgoingBg: '#005C4B', // Sent messages (WhatsApp green-dark)
//   border: '#1F2C35',
//   shadow: 'rgba(0, 0, 0, 0.3)',
//   online: '#25D366',
//   typing: '#25D366',
//   messageTime: '#8696A0',
//   tickBlue: '#53BDEB',
//   tickGray: '#667781',
// };

// const EMOJIS = [
//   ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇'],
//   ['🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚'],
//   ['😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩'],
//   ['🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣'],
//   ['😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬'],
//   ['😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔'],
//   ['🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦'],
//   ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔'],
//   ['👍', '👎', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✌️', '🤞'],
//   ['🤟', '🤘', '👌', '🤏', '✊', '👊', '🤛', '🤜', '💪', '🦵'],
// ];

// const MessageScreen = () => {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const { user: initialUser, otherUserId: paramOtherUserId, senderId: paramSenderId } = route.params || {};

//   const [socketStatus, setSocketStatus] = useState('disconnected');
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [fetchingUser, setFetchingUser] = useState(true);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [otherUser, setOtherUser] = useState(null);
//   const [moreMenuVisible, setMoreMenuVisible] = useState(false);
//   const [isTyping, setIsTyping] = useState(false);
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//   const [inputText, setInputText] = useState('');
//   const [keyboardHeight, setKeyboardHeight] = useState(0);
//   const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
//   const [selectedAttachment, setSelectedAttachment] = useState(null);
//   const [attachmentModalVisible, setAttachmentModalVisible] = useState(false);
//   const typingTimeoutRef = useRef(null);
//   const flatListRef = useRef(null);
//   const inputRef = useRef(null);

//   const [lastSeen, setLastSeen] = useState('2:30 PM');
//   const [isOnline, setIsOnline] = useState(true);

//   // Typing animation dots
//   const [dotAnimations] = useState([
//     new Animated.Value(0),
//     new Animated.Value(0),
//     new Animated.Value(0),
//   ]);

//   useEffect(() => {
//     if (isTyping) {
//       Animated.loop(
//         Animated.sequence([
//           Animated.stagger(200, [
//             Animated.timing(dotAnimations[0], {
//               toValue: 1,
//               duration: 300,
//               useNativeDriver: true,
//             }),
//             Animated.timing(dotAnimations[1], {
//               toValue: 1,
//               duration: 300,
//               useNativeDriver: true,
//             }),
//             Animated.timing(dotAnimations[2], {
//               toValue: 1,
//               duration: 300,
//               useNativeDriver: true,
//             }),
//           ]),
//           Animated.stagger(200, [
//             Animated.timing(dotAnimations[0], {
//               toValue: 0,
//               duration: 300,
//               useNativeDriver: true,
//             }),
//             Animated.timing(dotAnimations[1], {
//               toValue: 0,
//               duration: 300,
//               useNativeDriver: true,
//             }),
//             Animated.timing(dotAnimations[2], {
//               toValue: 0,
//               duration: 300,
//               useNativeDriver: true,
//             }),
//           ]),
//         ])
//       ).start();
//     } else {
//       dotAnimations.forEach(dot => dot.setValue(0));
//     }
//   }, [isTyping]);

//   // Debug route params
//   useEffect(() => {
//     console.log('MessageScreen params:', route.params);
//   }, []);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       const status = socket.getSocketStatus();
//       console.log('[MessageScreen] Socket status:', status);
//       if (typeof status === 'object') {
//         setSocketStatus(status.connected ? 'connected' : 'disconnected');
//       } else {
//         setSocketStatus(status);
//       }
//     }, 5000);

//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     console.log('[MessageScreen] 🚀 Setting up socket listeners');
    
//     let isMounted = true;
//     let messageHandler = null;

//     const initializeSocket = async () => {
//       try {
//         await socket.initSocket();
        
//         if (!isMounted) return;
        
//         messageHandler = (newMessage) => {
//           if (!isMounted) return;
          
//           console.log('\n[MessageScreen] 📨 RECEIVED MESSAGE');
//           console.log('[MessageScreen] Message ID:', newMessage._id);
//           console.log('[MessageScreen] From:', newMessage.sender?._id);
          
//           const messageUserId = newMessage.sender._id || newMessage.sender.id;
//           const otherUserId = otherUser?._id || otherUser?.id;
          
//           // Ignore messages not from current chat partner
//           if (messageUserId !== otherUserId) {
//             console.log('[MessageScreen] ⚠️ Ignoring message from different user');
//             return;
//           }
          
//           // Check if this is a duplicate (based on message ID)
//           setMessages(prev => {
//             const exists = prev.find(msg => msg._id === newMessage._id);
//             if (exists) {
//               console.log('[MessageScreen] ⚠️ Message already exists, ignoring');
//               return prev;
//             }
            
//             const formattedMessage = {
//               _id: newMessage._id,
//               text: newMessage.text,
//               createdAt: new Date(newMessage.createdAt),
//               user: {
//                 _id: newMessage.sender._id,
//                 name: newMessage.sender.name,
//                 avatar: newMessage.sender.avatar || newMessage.sender.photoURL,
//               },
//               status: newMessage.status,
//               attachment: newMessage.attachment,
//             };
            
//             console.log('[MessageScreen] ✅ Adding new message');
//             return [...prev, formattedMessage];
//           });
//         };
        
//         socket.onReceiveMessage(messageHandler);
        
//         const statusHandler = (updatedMessage) => {
//           console.log('[MessageScreen] 📊 Status update:', updatedMessage._id);
//           setMessages(prev =>
//             prev.map(msg =>
//               msg._id === updatedMessage._id ? { 
//                 ...msg, 
//                 status: updatedMessage.status,
//                 ...(updatedMessage.deliveredAt && { deliveredAt: updatedMessage.deliveredAt }),
//                 ...(updatedMessage.readAt && { readAt: updatedMessage.readAt })
//               } : msg
//             )
//           );
//         };
        
//         socket.on('messageStatusUpdate', statusHandler);
        
//       } catch (error) {
//         console.error('[MessageScreen] ❌ Socket init error:', error);
//       }
//     };

//     initializeSocket();

//     return () => {
//       console.log('[MessageScreen] 🧹 Cleaning up socket listeners');
//       isMounted = false;
//       if (messageHandler) {
//         socket.offReceiveMessage(messageHandler);
//       }
//     };
//   }, [otherUser?._id]);

//   useEffect(() => {
//     const loadOtherUser = async () => {
//       try {
//         console.log('Loading other user...');
//         console.log('Params:', { initialUser, paramOtherUserId, paramSenderId });

//         if (initialUser) {
//           console.log('Initial user object:', initialUser);
          
//           if (initialUser._id || initialUser.id) {
//             console.log('Setting otherUser from initialUser');
            
//             const standardizedUser = {
//               ...initialUser,
//               _id: initialUser._id || initialUser.id,
//               id: initialUser.id || initialUser._id,
//               profession: initialUser.profession || initialUser.job || 'Software Developer',
//               lastSeen: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//             };
            
//             console.log('Standardized user:', standardizedUser);
//             setOtherUser(standardizedUser);
//             setFetchingUser(false);
//             return;
//           }
//         }

//         let targetUserId = null;
        
//         if (paramOtherUserId) {
//           targetUserId = paramOtherUserId;
//         } else if (paramSenderId) {
//           targetUserId = paramSenderId;
//         }

//         if (!targetUserId) {
//           console.error('No valid user ID found from any parameter');
//           Alert.alert('Chat Error', 'Unable to identify chat partner. Please try again.');
//           navigation.goBack();
//           return;
//         }

//         console.log('Fetching user with ID:', targetUserId);
        
//         const token = await AsyncStorage.getItem('authToken');
//         if (!token) {
//           Alert.alert('Authentication Error', 'Please login again.');
//           navigation.navigate('Login');
//           return;
//         }

//         const response = await fetch(`${API_URL}/api/user/profile/${targetUserId}`, {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         });

//         if (response.ok) {
//           const data = await response.json();
//           if (data.success && data.data) {
//             console.log('User data fetched:', data.data);
//             const userData = {
//               ...data.data,
//               profession: data.data.profession || data.data.job || 'Software Developer',
//               lastSeen: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//             };
//             setOtherUser(userData);
//           } else {
//             Alert.alert('Error', 'User not found.');
//             navigation.goBack();
//           }
//         } else {
//           Alert.alert('Error', 'Failed to load user data.');
//           navigation.goBack();
//         }
//       } catch (error) {
//         console.error('Error loading other user:', error);
//         Alert.alert('Error', 'Failed to load chat.');
//         navigation.goBack();
//       } finally {
//         setFetchingUser(false);
//       }
//     };

//     loadOtherUser();
//   }, [initialUser, paramOtherUserId, paramSenderId]);

//   useEffect(() => {
//     const loadCurrentUser = async () => {
//       try {
//         const userInfoStr = await AsyncStorage.getItem('userInfo');
//         if (userInfoStr) {
//           const userInfo = JSON.parse(userInfoStr);
//           setCurrentUser(userInfo);
//         }
//       } catch (error) {
//         console.error('Error loading current user:', error);
//       }
//     };

//     loadCurrentUser();
//   }, []);

//   useEffect(() => {
//     if (!otherUser || (!otherUser._id && !otherUser.id)) return;

//     const loadMessages = async () => {
//       try {
//         const token = await AsyncStorage.getItem('authToken');
//         const currentUserInfoStr = await AsyncStorage.getItem('userInfo');
//         const currentUserInfo = JSON.parse(currentUserInfoStr || '{}');
        
//         const otherUserId = otherUser._id || otherUser.id;
//         const currentUserId = currentUserInfo._id || currentUserInfo.id;

//         console.log(`Fetching messages between ${currentUserId} and ${otherUserId}`);

//         const response = await fetch(`${API_URL}/api/messages/${otherUserId}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         const data = await response.json();
//         if (data.success && data.data) {
//           const formattedMessages = data.data.map(msg => ({
//             _id: msg._id,
//             text: msg.text,
//             createdAt: new Date(msg.createdAt),
//             user: {
//               _id: msg.sender._id || msg.sender.id,
//               name: msg.sender.name,
//               avatar: msg.sender.avatar || msg.sender.photoURL || 'https://randomuser.me/api/portraits/men/1.jpg',
//             },
//             status: msg.status,
//             attachment: msg.attachment,
//           }));

//           setMessages(formattedMessages.reverse());
//         }
//       } catch (error) {
//         console.error('Error loading messages:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadMessages();

//     const messageHandler = (newMessage) => {
//       console.log('New message received:', newMessage);
      
//       const formattedMessage = {
//         _id: newMessage._id,
//         text: newMessage.text,
//         createdAt: new Date(newMessage.createdAt),
//         user: {
//           _id: newMessage.sender._id || newMessage.sender.id,
//           name: newMessage.sender.name,
//           avatar: newMessage.sender.avatar || newMessage.sender.photoURL || 'https://randomuser.me/api/portraits/men/1.jpg',
//         },
//         status: newMessage.status,
//         attachment: newMessage.attachment,
//       };

//       setMessages(prev => {
//         const filtered = prev.filter(msg => 
//           !(msg.status === 'pending' && msg.text === formattedMessage.text)
//         );
//         return [...filtered, formattedMessage];
//       });
//     };

//     socket.onReceiveMessage(messageHandler);

//     return () => {
//       socket.offReceiveMessage(messageHandler);
//     };
//   }, [otherUser]);

//   useEffect(() => {
//     const keyboardDidShowListener = Keyboard.addListener(
//       'keyboardDidShow',
//       (e) => {
//         setKeyboardHeight(e.endCoordinates.height);
//         setIsKeyboardVisible(true);
//         setShowEmojiPicker(false);
//       }
//     );
    
//     const keyboardDidHideListener = Keyboard.addListener(
//       'keyboardDidHide',
//       () => {
//         setKeyboardHeight(0);
//         setIsKeyboardVisible(false);
//       }
//     );

//     return () => {
//       keyboardDidShowListener.remove();
//       keyboardDidHideListener.remove();
//     };
//   }, []);

//   const handleInputTextChanged = useCallback((text) => {
//     setInputText(text);
//     const otherUserId = otherUser?._id || otherUser?.id;
    
//     if (otherUserId) {
//       if (text.length > 0) {
//         socket.emit('typing', { recipientId: otherUserId });
//         if (typingTimeoutRef.current) {
//           clearTimeout(typingTimeoutRef.current);
//         }
//         typingTimeoutRef.current = setTimeout(() => {
//           socket.emit('stopTyping', { recipientId: otherUserId });
//         }, 3000);
//       } else {
//         socket.emit('stopTyping', { recipientId: otherUserId });
//         if (typingTimeoutRef.current) {
//           clearTimeout(typingTimeoutRef.current);
//         }
//       }
//     }
//   }, [otherUser]);

//   useEffect(() => {
//     const otherUserId = otherUser?._id || otherUser?.id;
    
//     if (otherUserId) {
//       const typingStatusHandler = ({ senderId, isTyping: status }) => {
//         if (senderId === otherUserId) {
//           setIsTyping(status);
//         }
//       };
//       socket.on('typingStatus', typingStatusHandler);

//       return () => {
//         socket.off('typingStatus', typingStatusHandler);
//       };
//     }
//   }, [otherUser]);

//   const handleSend = () => {
//     const otherUserId = otherUser._id || otherUser.id;
//     const currentUserId = currentUser?._id || currentUser?.id;
    
//     if (!otherUserId || !currentUserId || (!inputText.trim() && !selectedAttachment)) {
//       return;
//     }

//     const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
//     const newMessage = {
//       _id: tempId,
//       text: inputText.trim() || '',
//       createdAt: new Date(),
//       user: { 
//         _id: currentUserId,
//         name: currentUser?.name || 'You'
//       },
//       status: 'pending',
//       attachment: selectedAttachment,
//     };

//     console.log('[MessageScreen] Adding optimistic message with temp ID:', tempId);
//     setMessages(prev => [...prev, newMessage]);
    
//     const success = socket.sendMessage(otherUserId, inputText.trim(), selectedAttachment);
    
//     if (success) {
//       console.log('[MessageScreen] ✅ Message sent via socket');
//     } else {
//       console.error('[MessageScreen] ❌ Socket send failed');
//       setMessages(prev =>
//         prev.map(msg =>
//           msg._id === tempId ? { ...msg, status: 'failed' } : msg
//         )
//       );
//     }
    
//     setInputText('');
//     setSelectedAttachment(null);
//     setShowEmojiPicker(false);
//   };

//   const handleEmojiSelect = (emoji) => {
//     setInputText(prev => prev + emoji);
//   };

//   const handleAttachment = () => {
//     setAttachmentModalVisible(true);
//   };

//   const selectImage = () => {
//     const options = {
//       mediaType: 'photo',
//       quality: 0.8,
//     };
    
//     launchImageLibrary(options, (response) => {
//       if (response.assets && response.assets[0]) {
//         setSelectedAttachment({
//           type: 'image',
//           uri: response.assets[0].uri,
//           name: response.assets[0].fileName,
//         });
//         setAttachmentModalVisible(false);
//       }
//     });
//   };

//   const selectCamera = () => {
//     const options = {
//       mediaType: 'photo',
//       quality: 0.8,
//     };
    
//     launchCamera(options, (response) => {
//       if (response.assets && response.assets[0]) {
//         setSelectedAttachment({
//           type: 'image',
//           uri: response.assets[0].uri,
//           name: response.assets[0].fileName,
//         });
//         setAttachmentModalVisible(false);
//       }
//     });
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'sent':
//         return <Icon name="done" size={16} color={COLORS.tickGray} />;
//       case 'delivered':
//         return <Icon name="done-all" size={16} color={COLORS.tickGray} />;
//       case 'read':
//         return <Icon name="done-all" size={16} color={COLORS.tickBlue} />;
//       case 'failed':
//         return <Icon name="error" size={16} color={COLORS.danger} />;
//       default:
//         return <Icon name="schedule" size={16} color={COLORS.tickGray} />;
//     }
//   };

//   // Loading state
//   if (fetchingUser || !otherUser) {
//     return (
//       <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
//         <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={{ color: COLORS.textPrimary, marginTop: 20 }}>Loading chat...</Text>
//       </SafeAreaView>
//     );
//   }

//   // Main render
//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
//       {/* Professional Header */}
//       <View style={styles.header}>
//         <View style={styles.headerContent}>
//           {/* Back Button */}
//           <TouchableOpacity 
//             onPress={() => navigation.goBack()} 
//             style={styles.backButton}
//           >
//             <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
//           </TouchableOpacity>
          
//           {/* User Info */}
//           <TouchableOpacity style={styles.userInfoContainer}>
//             <View style={styles.avatarContainer}>
//               <Image 
//                 source={{ uri: otherUser.photoURL || otherUser.avatar || 'https://randomuser.me/api/portraits/men/1.jpg' }} 
//                 style={styles.avatar}
//               />
//               {isOnline && <View style={styles.onlineIndicator} />}
//             </View>
//             <View style={styles.userInfo}>
//               <Text style={styles.userName} numberOfLines={1}>
//                 {otherUser.name || 'Unknown User'}
//               </Text>
//               <View style={styles.statusRow}>
//                 {isTyping ? (
//                   <View style={styles.typingContainer}>
//                     <Animated.View style={[
//                       styles.typingDot,
//                       { opacity: dotAnimations[0] }
//                     ]} />
//                     <Animated.View style={[
//                       styles.typingDot,
//                       { opacity: dotAnimations[1] }
//                     ]} />
//                     <Animated.View style={[
//                       styles.typingDot,
//                       { opacity: dotAnimations[2] }
//                     ]} />
//                     <Text style={styles.typingText}>typing...</Text>
//                   </View>
//                 ) : (
//                   <>
//                     <View style={[styles.statusDot, isOnline && styles.statusDotOnline]} />
//                     <Text style={styles.statusText}>
//                       {isOnline ? 'Online' : `Last seen today at ${otherUser.lastSeen || lastSeen}`}
//                     </Text>
//                   </>
//                 )}
//               </View>
//             </View>
//           </TouchableOpacity>
          
//           {/* Header Actions */}
//           <View style={styles.headerActions}>
//             <TouchableOpacity 
//               style={styles.headerActionButton}
//               onPress={() => Alert.alert('Video Call', 'Video call feature coming soon!')}
//             >
//               <Ionicons name="videocam" size={24} color={COLORS.textPrimary} />
//             </TouchableOpacity>
            
//             <TouchableOpacity 
//               style={styles.headerActionButton}
//               onPress={() => Alert.alert('Voice Call', 'Voice call feature coming soon!')}
//             >
//               <Ionicons name="call" size={22} color={COLORS.textPrimary} />
//             </TouchableOpacity>
            
//             <TouchableOpacity 
//               style={styles.headerActionButton}
//               onPress={() => setMoreMenuVisible(true)}
//             >
//               <Ionicons name="ellipsis-vertical" size={22} color={COLORS.textPrimary} />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>

//       {/* Chat Messages */}
//       <FlatList
//         ref={flatListRef}
//         data={messages}
//         renderItem={({ item }) => {
//           const messageUserId = item.user._id || item.user.id;
//           const currentUserId = currentUser?._id || currentUser?.id;
//           const isOutgoing = messageUserId === currentUserId;
          
//           return (
//             <View style={[
//               styles.messageItem,
//               isOutgoing ? styles.messageItemOutgoing : styles.messageItemIncoming
//             ]}>
//               {!isOutgoing && (
//                 <Image 
//                   source={{ uri: otherUser.photoURL || otherUser.avatar || 'https://randomuser.me/api/portraits/men/1.jpg' }} 
//                   style={styles.senderAvatar}
//                 />
//               )}
//               <View style={[
//                 styles.messageBubble,
//                 isOutgoing ? styles.outgoingBubble : styles.incomingBubble,
//                 isOutgoing && styles.outgoingBubbleShadow
//               ]}>
//                 {item.attachment && (
//                   <View style={styles.attachmentContainer}>
//                     {item.attachment.type === 'image' ? (
//                       <Image 
//                         source={{ uri: item.attachment.uri }} 
//                         style={styles.attachmentImage}
//                       />
//                     ) : (
//                       <View style={styles.documentContainer}>
//                         <Icon name="insert-drive-file" size={28} color={COLORS.textPrimary} />
//                         <Text style={styles.documentName} numberOfLines={1}>
//                           {item.attachment.name}
//                         </Text>
//                       </View>
//                     )}
//                   </View>
//                 )}
//                 {item.text && (
//                   <Text style={[
//                     styles.messageText,
//                     isOutgoing ? styles.outgoingMessageText : styles.incomingMessageText
//                   ]}>
//                     {item.text}
//                   </Text>
//                 )}
//                 <View style={styles.messageTimeContainer}>
//                   <Text style={[
//                     styles.messageTime,
//                     isOutgoing ? styles.outgoingMessageTime : styles.incomingMessageTime
//                   ]}>
//                     {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                   </Text>
//                   {isOutgoing && (
//                     <View style={styles.statusContainer}>
//                       {getStatusIcon(item.status)}
//                     </View>
//                   )}
//                 </View>
//               </View>
//             </View>
//           );
//         }}
//         keyExtractor={(item) => item._id ? item._id.toString() : item.id ? item.id.toString() : Math.random().toString()}
//         contentContainerStyle={styles.messagesList}
//         inverted={false}
//         showsVerticalScrollIndicator={false}
//       />

//       {/* Selected Attachment Preview */}
//       {selectedAttachment && (
//         <View style={styles.selectedAttachmentContainer}>
//           {selectedAttachment.type === 'image' ? (
//             <View style={styles.selectedImageContainer}>
//               <Image 
//                 source={{ uri: selectedAttachment.uri }} 
//                 style={styles.selectedImage}
//               />
//               <TouchableOpacity 
//                 style={styles.removeAttachmentButton}
//                 onPress={() => setSelectedAttachment(null)}
//               >
//                 <Ionicons name="close-circle" size={24} color={COLORS.danger} />
//               </TouchableOpacity>
//             </View>
//           ) : (
//             <View style={styles.selectedDocumentContainer}>
//               <Icon name="insert-drive-file" size={24} color={COLORS.textPrimary} />
//               <Text style={styles.selectedDocumentName} numberOfLines={1}>
//                 {selectedAttachment.name}
//               </Text>
//               <TouchableOpacity 
//                 style={styles.removeAttachmentButton}
//                 onPress={() => setSelectedAttachment(null)}
//               >
//                 <Ionicons name="close-circle" size={24} color={COLORS.danger} />
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>
//       )}

//       {/* Input Area */}
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
//         style={[
//           styles.inputContainer,
//           { marginBottom: showEmojiPicker ? 0 : keyboardHeight }
//         ]}
//       >
//         {showEmojiPicker && (
//           <View style={styles.emojiPickerContainer}>
//             <ScrollView 
//               showsVerticalScrollIndicator={false}
//               contentContainerStyle={styles.emojiScrollView}
//             >
//               {EMOJIS.map((row, rowIndex) => (
//                 <View key={rowIndex} style={styles.emojiRow}>
//                   {row.map((emoji, emojiIndex) => (
//                     <TouchableOpacity
//                       key={emojiIndex}
//                       style={styles.emojiItem}
//                       onPress={() => handleEmojiSelect(emoji)}
//                     >
//                       <Text style={styles.emojiText}>{emoji}</Text>
//                     </TouchableOpacity>
//                   ))}
//                 </View>
//               ))}
//             </ScrollView>
//             <TouchableOpacity 
//               style={styles.emojiPickerClose}
//               onPress={() => setShowEmojiPicker(false)}
//             >
//               <Ionicons name="chevron-down" size={24} color={COLORS.textSecondary} />
//             </TouchableOpacity>
//           </View>
//         )}
        
//         <View style={styles.inputWrapper}>
//           <TouchableOpacity 
//             style={styles.emojiButton}
//             onPress={() => {
//               setShowEmojiPicker(!showEmojiPicker);
//               if (!showEmojiPicker) {
//                 Keyboard.dismiss();
//               }
//             }}
//           >
//             <Ionicons 
//               name={showEmojiPicker ? "keyboard" : "happy-outline"} 
//               size={26} 
//               color={showEmojiPicker ? COLORS.primary : COLORS.textTertiary} 
//             />
//           </TouchableOpacity>

//           <View style={styles.textInputContainer}>
//             <TextInput
//               ref={inputRef}
//               style={styles.textInput}
//               value={inputText}
//               onChangeText={handleInputTextChanged}
//               placeholder="Message"
//               placeholderTextColor={COLORS.textTertiary}
//               multiline
//               maxLength={1000}
//             />
//           </View>

//           {!inputText.trim() ? (
//             <View style={styles.rightButtons}>
//               <TouchableOpacity 
//                 style={styles.attachmentButton}
//                 onPress={handleAttachment}
//               >
//                 <Ionicons name="attach" size={24} color={COLORS.textTertiary} />
//               </TouchableOpacity>
//               <TouchableOpacity 
//                 style={styles.cameraButton}
//                 onPress={selectCamera}
//               >
//                 <Ionicons name="camera-outline" size={24} color={COLORS.textTertiary} />
//               </TouchableOpacity>
//             </View>
//           ) : (
//             <TouchableOpacity 
//               style={styles.sendButton}
//               onPress={handleSend}
//               disabled={!inputText.trim() && !selectedAttachment}
//             >
//               <Ionicons name="send" size={20} color={COLORS.textPrimary} />
//             </TouchableOpacity>
//           )}
//         </View>
//       </KeyboardAvoidingView>

//       {/* Attachment Modal */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={attachmentModalVisible}
//         onRequestClose={() => setAttachmentModalVisible(false)}
//       >
//         <TouchableOpacity 
//           style={styles.modalOverlay} 
//           activeOpacity={1} 
//           onPress={() => setAttachmentModalVisible(false)}
//         >
//           <View style={styles.attachmentModalContainer}>
//             <View style={styles.attachmentModalHandle} />
//             <Text style={styles.attachmentModalTitle}>Share Media</Text>
            
//             <View style={styles.attachmentOptions}>
//               <TouchableOpacity style={styles.attachmentOption} onPress={selectCamera}>
//                 <View style={[styles.attachmentIconContainer, { backgroundColor: COLORS.primary + '15' }]}>
//                   <Ionicons name="camera" size={32} color={COLORS.primary} />
//                 </View>
//                 <Text style={styles.attachmentOptionText}>Camera</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity style={styles.attachmentOption} onPress={selectImage}>
//                 <View style={[styles.attachmentIconContainer, { backgroundColor: COLORS.success + '15' }]}>
//                   <Ionicons name="image" size={32} color={COLORS.success} />
//                 </View>
//                 <Text style={styles.attachmentOptionText}>Gallery</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity style={styles.attachmentOption} onPress={() => {
//                 Alert.alert('Coming Soon', 'Document sharing feature coming soon!');
//                 setAttachmentModalVisible(false);
//               }}>
//                 <View style={[styles.attachmentIconContainer, { backgroundColor: COLORS.warning + '15' }]}>
//                   <Ionicons name="document" size={32} color={COLORS.warning} />
//                 </View>
//                 <Text style={styles.attachmentOptionText}>Document</Text>
//               </TouchableOpacity>
//             </View>
            
//             <TouchableOpacity 
//               style={styles.cancelButton}
//               onPress={() => setAttachmentModalVisible(false)}
//             >
//               <Text style={styles.cancelButtonText}>Cancel</Text>
//             </TouchableOpacity>
//           </View>
//         </TouchableOpacity>
//       </Modal>

//       {/* More Options Modal */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={moreMenuVisible}
//         onRequestClose={() => setMoreMenuVisible(false)}
//       >
//         <TouchableOpacity 
//           style={styles.modalOverlay} 
//           activeOpacity={1} 
//           onPress={() => setMoreMenuVisible(false)}
//         >
//           <View style={styles.moreMenuContainer}>
//             <View style={styles.moreMenuHandle} />
//             <Text style={styles.moreMenuTitle}>Options</Text>
            
//             <View style={styles.moreMenuContent}>
//               <TouchableOpacity style={styles.menuOption}>
//                 <View style={[styles.menuIcon, { backgroundColor: COLORS.primary + '15' }]}>
//                   <Ionicons name="person-outline" size={22} color={COLORS.primary} />
//                 </View>
//                 <Text style={styles.menuOptionText}>View Contact</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity style={styles.menuOption}>
//                 <View style={[styles.menuIcon, { backgroundColor: COLORS.success + '15' }]}>
//                   <Ionicons name="notifications-off-outline" size={22} color={COLORS.success} />
//                 </View>
//                 <Text style={styles.menuOptionText}>Mute Notifications</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity style={styles.menuOption}>
//                 <View style={[styles.menuIcon, { backgroundColor: COLORS.warning + '15' }]}>
//                   <Ionicons name="search-outline" size={22} color={COLORS.warning} />
//                 </View>
//                 <Text style={styles.menuOptionText}>Search</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity style={styles.menuOption}>
//                 <View style={[styles.menuIcon, { backgroundColor: '#6C63FF15' }]}>
//                   <Ionicons name="wallpaper-outline" size={22} color="#6C63FF" />
//                 </View>
//                 <Text style={styles.menuOptionText}>Wallpaper</Text>
//               </TouchableOpacity>
              
//               <View style={styles.divider} />
              
//               <TouchableOpacity style={[styles.menuOption, styles.dangerOption]}>
//                 <View style={[styles.menuIcon, { backgroundColor: COLORS.danger + '15' }]}>
//                   <Ionicons name="ban-outline" size={22} color={COLORS.danger} />
//                 </View>
//                 <Text style={[styles.menuOptionText, styles.dangerText]}>Block Contact</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity style={[styles.menuOption, styles.dangerOption]}>
//                 <View style={[styles.menuIcon, { backgroundColor: COLORS.danger + '15' }]}>
//                   <Ionicons name="trash-outline" size={22} color={COLORS.danger} />
//                 </View>
//                 <Text style={[styles.menuOptionText, styles.dangerText]}>Delete Chat</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </TouchableOpacity>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.backgroundLight,
//   },
//   header: {
//     backgroundColor: COLORS.background,
//     borderBottomWidth: 0.5,
//     borderBottomColor: COLORS.border,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//     zIndex: 10,
//   },
//   headerContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     height: 60,
//   },
//   backButton: {
//     padding: 8,
//     marginRight: 8,
//   },
//   userInfoContainer: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   avatarContainer: {
//     position: 'relative',
//     marginRight: 12,
//   },
//   avatar: {
//     width: 42,
//     height: 42,
//     borderRadius: 21,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//   },
//   onlineIndicator: {
//     position: 'absolute',
//     bottom: 0,
//     right: 0,
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     backgroundColor: COLORS.online,
//     borderWidth: 2,
//     borderColor: COLORS.background,
//   },
//   userInfo: {
//     flex: 1,
//   },
//   userName: {
//     color: COLORS.textPrimary,
//     fontSize: 18,
//     fontWeight: '600',
//     marginBottom: 2,
//   },
//   statusRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   statusDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: COLORS.textTertiary,
//     marginRight: 6,
//   },
//   statusDotOnline: {
//     backgroundColor: COLORS.online,
//   },
//   statusText: {
//     color: COLORS.textTertiary,
//     fontSize: 13,
//     fontWeight: '400',
//   },
//   typingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   typingDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     backgroundColor: COLORS.typing,
//     marginHorizontal: 1.5,
//   },
//   typingText: {
//     color: COLORS.typing,
//     fontSize: 13,
//     marginLeft: 8,
//     fontWeight: '500',
//     fontStyle: 'italic',
//   },
//   headerActions: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   headerActionButton: {
//     padding: 10,
//     marginLeft: 4,
//   },
//   messagesList: {
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     paddingBottom: 20,
//   },
//   messageItem: {
//     marginVertical: 6,
//     maxWidth: '80%',
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//   },
//   messageItemOutgoing: {
//     alignSelf: 'flex-end',
//   },
//   messageItemIncoming: {
//     alignSelf: 'flex-start',
//   },
//   senderAvatar: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     marginRight: 8,
//     marginBottom: 4,
//   },
//   messageBubble: {
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     borderRadius: 18,
//     maxWidth: '100%',
//   },
//   outgoingBubble: {
//     backgroundColor: COLORS.outgoingBg,
//     borderBottomRightRadius: 4,
//   },
//   incomingBubble: {
//     backgroundColor: COLORS.incomingBg,
//     borderBottomLeftRadius: 4,
//   },
//   outgoingBubbleShadow: {
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   messageText: {
//     fontSize: 16,
//     lineHeight: 22,
//     letterSpacing: 0.2,
//   },
//   outgoingMessageText: {
//     color: COLORS.textPrimary,
//   },
//   incomingMessageText: {
//     color: COLORS.textPrimary,
//   },
//   messageTimeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//     marginTop: 4,
//   },
//   messageTime: {
//     fontSize: 11,
//     letterSpacing: 0.3,
//   },
//   outgoingMessageTime: {
//     color: 'rgba(255, 255, 255, 0.7)',
//   },
//   incomingMessageTime: {
//     color: COLORS.messageTime,
//   },
//   statusContainer: {
//     marginLeft: 4,
//   },
//   attachmentContainer: {
//     marginBottom: 8,
//     borderRadius: 12,
//     overflow: 'hidden',
//   },
//   attachmentImage: {
//     width: 240,
//     height: 240,
//     borderRadius: 12,
//   },
//   documentContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     backgroundColor: 'rgba(255, 255, 255, 0.1)',
//     borderRadius: 12,
//     maxWidth: 240,
//   },
//   documentName: {
//     marginLeft: 12,
//     fontSize: 14,
//     color: COLORS.textPrimary,
//     flex: 1,
//     fontWeight: '500',
//   },
//   inputContainer: {
//     backgroundColor: COLORS.background,
//     borderTopWidth: 0.5,
//     borderTopColor: COLORS.border,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//   },
//   inputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     minHeight: 52,
//   },
//   emojiButton: {
//     width: 44,
//     height: 44,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 22,
//     marginRight: 6,
//   },
//   textInputContainer: {
//     flex: 1,
//     backgroundColor: COLORS.backgroundLighter,
//     borderRadius: 24,
//     paddingHorizontal: 18,
//     paddingVertical: 10,
//     maxHeight: 120,
//     minHeight: 44,
//     justifyContent: 'center',
//   },
//   textInput: {
//     fontSize: 16,
//     color: COLORS.textPrimary,
//     paddingVertical: 2,
//     maxHeight: 100,
//     minHeight: 20,
//     textAlignVertical: 'center',
//     includeFontPadding: false,
//   },
//   rightButtons: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginLeft: 6,
//   },
//   attachmentButton: {
//     width: 44,
//     height: 44,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 22,
//   },
//   cameraButton: {
//     width: 44,
//     height: 44,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 22,
//     marginLeft: 2,
//   },
//   sendButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: COLORS.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: 6,
//   },
//   sendButtonDisabled: {
//     backgroundColor: COLORS.backgroundLighter,
//   },
//   emojiPickerContainer: {
//     backgroundColor: COLORS.background,
//     borderTopWidth: 0.5,
//     borderTopColor: COLORS.border,
//     paddingBottom: 8,
//   },
//   emojiScrollView: {
//     flex: 1,
//     paddingHorizontal: 12,
//     paddingVertical: 16,
//     paddingBottom: 8,
//   },
//   emojiRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//   },
//   emojiItem: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 8,
//   },
//   emojiText: {
//     fontSize: 26,
//   },
//   emojiPickerClose: {
//     padding: 8,
//     alignItems: 'center',
//     borderTopWidth: 0.5,
//     borderTopColor: COLORS.border,
//   },
//   selectedAttachmentContainer: {
//     backgroundColor: COLORS.background,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderTopWidth: 0.5,
//     borderTopColor: COLORS.border,
//   },
//   selectedImageContainer: {
//     position: 'relative',
//     alignSelf: 'flex-start',
//   },
//   selectedImage: {
//     width: 120,
//     height: 120,
//     borderRadius: 12,
//   },
//   selectedDocumentContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 14,
//     backgroundColor: COLORS.backgroundLighter,
//     borderRadius: 12,
//   },
//   selectedDocumentName: {
//     flex: 1,
//     marginLeft: 12,
//     fontSize: 14,
//     color: COLORS.textPrimary,
//     fontWeight: '500',
//   },
//   removeAttachmentButton: {
//     width: 32,
//     height: 32,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: 12,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'flex-end',
//   },
//   attachmentModalContainer: {
//     backgroundColor: COLORS.background,
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     paddingBottom: Platform.OS === 'ios' ? 40 : 30,
//   },
//   attachmentModalHandle: {
//     width: 40,
//     height: 5,
//     backgroundColor: COLORS.textTertiary,
//     borderRadius: 3,
//     alignSelf: 'center',
//     marginTop: 12,
//     marginBottom: 20,
//   },
//   attachmentModalTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//     marginBottom: 30,
//     textAlign: 'center',
//   },
//   attachmentOptions: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginBottom: 30,
//     paddingHorizontal: 20,
//   },
//   attachmentOption: {
//     alignItems: 'center',
//     paddingVertical: 10,
//     flex: 1,
//   },
//   attachmentIconContainer: {
//     width: 68,
//     height: 68,
//     borderRadius: 34,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   attachmentOptionText: {
//     fontSize: 14,
//     color: COLORS.textSecondary,
//     fontWeight: '500',
//   },
//   cancelButton: {
//     paddingVertical: 16,
//     alignItems: 'center',
//     borderTopWidth: 0.5,
//     borderTopColor: COLORS.border,
//     marginHorizontal: 20,
//   },
//   cancelButtonText: {
//     fontSize: 18,
//     color: COLORS.primary,
//     fontWeight: '600',
//   },
//   moreMenuContainer: {
//     backgroundColor: COLORS.background,
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     paddingBottom: Platform.OS === 'ios' ? 40 : 30,
//     maxHeight: '80%',
//   },
//   moreMenuHandle: {
//     width: 40,
//     height: 5,
//     backgroundColor: COLORS.textTertiary,
//     borderRadius: 3,
//     alignSelf: 'center',
//     marginTop: 12,
//     marginBottom: 20,
//   },
//   moreMenuTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   moreMenuContent: {
//     paddingHorizontal: 20,
//   },
//   menuOption: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 16,
//     borderBottomWidth: 0.5,
//     borderBottomColor: COLORS.border,
//   },
//   menuIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 16,
//   },
//   menuOptionText: {
//     fontSize: 17,
//     color: COLORS.textPrimary,
//     fontWeight: '500',
//     flex: 1,
//   },
//   divider: {
//     height: 0.5,
//     backgroundColor: COLORS.border,
//     marginVertical: 8,
//   },
//   dangerOption: {
//     // No additional styles needed
//   },
//   dangerText: {
//     color: COLORS.danger,
//   },
// });

// export default MessageScreen;











// import { useState, useEffect, useCallback, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   StatusBar,
//   Image,
//   TouchableOpacity,
//   Alert,
//   Modal,
//   Platform,
//   KeyboardAvoidingView,
//   ScrollView,
//   TextInput,
//   FlatList,
//   Animated,
//   Dimensions,
//   Keyboard,
//   ActivityIndicator
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import { useRoute, useNavigation } from '@react-navigation/native';

// import messaging from '@react-native-firebase/messaging';


// import AsyncStorage from '@react-native-async-storage/async-storage';
// import API_URL from './utiliti/config';
// import * as socket from './services/socket';
// import * as userService from './services/userService';
// import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

// const { width, height } = Dimensions.get('window');

// // Professional color palette
// const COLORS = {
//   primary: '#0A5DFF',
//   primaryDark: '#0047CC',
//   accent: '#0A5DFF',
//   secondary: '#6C63FF',
//   success: '#00C896',
//   danger: '#FF3B30',
//   warning: '#FF9500',
//   background: '#F8F9FA',
//   backgroundLight: '#FFFFFF',
//   backgroundLighter: '#F1F3F5',
//   cardDark: '#FFFFFF',
//   textPrimary: '#1C1C1E',
//   textSecondary: '#8E8E93',
//   textTertiary: '#C7C7CC',
//   incomingBg: '#E5E5EA',
//   outgoingBg: '#0A5DFF',
//   border: '#E5E5EA',
//   shadow: 'rgba(0, 0, 0, 0.1)',
//   online: '#34C759',
//   typing: '#0A5DFF',
// };

// const EMOJIS = [
//   ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇'],
//   ['🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚'],
//   ['😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩'],
//   ['🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣'],
//   ['😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬'],
//   ['😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔'],
//   ['🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦'],
//   ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔'],
//   ['👍', '👎', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✌️', '🤞'],
//   ['🤟', '🤘', '👌', '🤏', '✊', '👊', '🤛', '🤜', '💪', '🦵'],
// ];

// const MessageScreen = () => {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const { user: initialUser, otherUserId: paramOtherUserId, senderId: paramSenderId } = route.params || {};



//   const [socketStatus, setSocketStatus] = useState('disconnected');



//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [fetchingUser, setFetchingUser] = useState(true);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [otherUser, setOtherUser] = useState(null);
//   const [moreMenuVisible, setMoreMenuVisible] = useState(false);
//   const [isTyping, setIsTyping] = useState(false);
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//   const [inputText, setInputText] = useState('');
//   const [keyboardHeight, setKeyboardHeight] = useState(0);
//   const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
//   const [selectedAttachment, setSelectedAttachment] = useState(null);
//   const [attachmentModalVisible, setAttachmentModalVisible] = useState(false);
//   const typingTimeoutRef = useRef(null);
//   const flatListRef = useRef(null);
//   const inputRef = useRef(null);

//   const [conversationMetadata, setConversationMetadata] = useState({
//     isPinned: false,
//     isBlocked: false,
//     customRingtone: '',
//     isFavorite: false,
//   });

//   const [lastSeen, setLastSeen] = useState('2:30 PM');

//   // Debug route params
//   useEffect(() => {
//     console.log('MessageScreen params:', route.params);
//   }, []);


// useEffect(() => {
//   const interval = setInterval(() => {
//     const status = socket.getSocketStatus();
//     console.log('[MessageScreen] Socket status:', status);
//     if (typeof status === 'object') {
//       setSocketStatus(status.connected ? 'connected' : 'disconnected');
//     } else {
//       setSocketStatus(status);
//     }
//   }, 5000);

//   return () => clearInterval(interval);
// }, []);



// // In MessageScreen.js, update the useEffect for socket
// // Fix the useEffect for socket listeners
// useEffect(() => {
//   console.log('[MessageScreen] 🚀 Setting up socket listeners');
  
//   let isMounted = true;
//   let messageHandler = null;

//   const initializeSocket = async () => {
//     try {
//       await socket.initSocket();
      
//       if (!isMounted) return;
      
//       messageHandler = (newMessage) => {
//         if (!isMounted) return;
        
//         console.log('\n[MessageScreen] 📨 RECEIVED MESSAGE');
//         console.log('[MessageScreen] Message ID:', newMessage._id);
//         console.log('[MessageScreen] From:', newMessage.sender?._id);
        
//         const messageUserId = newMessage.sender._id || newMessage.sender.id;
//         const otherUserId = otherUser?._id || otherUser?.id;
        
//         // Ignore messages not from current chat partner
//         if (messageUserId !== otherUserId) {
//           console.log('[MessageScreen] ⚠️ Ignoring message from different user');
//           return;
//         }
        
//         // Check if this is a duplicate (based on message ID)
//         setMessages(prev => {
//           const exists = prev.find(msg => msg._id === newMessage._id);
//           if (exists) {
//             console.log('[MessageScreen] ⚠️ Message already exists, ignoring');
//             return prev;
//           }
          
//           const formattedMessage = {
//             _id: newMessage._id,
//             text: newMessage.text,
//             createdAt: new Date(newMessage.createdAt),
//             user: {
//               _id: newMessage.sender._id,
//               name: newMessage.sender.name,
//               avatar: newMessage.sender.avatar || newMessage.sender.photoURL,
//             },
//             status: newMessage.status,
//             attachment: newMessage.attachment,
//           };
          
//           console.log('[MessageScreen] ✅ Adding new message');
//           return [...prev, formattedMessage];
//         });
//       };
      
//       // Register handler
//       socket.onReceiveMessage(messageHandler);
      
//       // Add status update listener
//       const statusHandler = (updatedMessage) => {
//         console.log('[MessageScreen] 📊 Status update:', updatedMessage._id);
//         setMessages(prev =>
//           prev.map(msg =>
//             msg._id === updatedMessage._id ? { 
//               ...msg, 
//               status: updatedMessage.status,
//               ...(updatedMessage.deliveredAt && { deliveredAt: updatedMessage.deliveredAt }),
//               ...(updatedMessage.readAt && { readAt: updatedMessage.readAt })
//             } : msg
//           )
//         );
//       };
      
//       socket.on('messageStatusUpdate', statusHandler);
      
//     } catch (error) {
//       console.error('[MessageScreen] ❌ Socket init error:', error);
//     }
//   };

//   initializeSocket();

//   // Cleanup function
//   return () => {
//     console.log('[MessageScreen] 🧹 Cleaning up socket listeners');
//     isMounted = false;
//     if (messageHandler) {
//       socket.offReceiveMessage(messageHandler);
//     }
//   };
// }, [otherUser?._id]); // Only depend on otherUser._id, not the entire object




//   // Effect to load otherUser data
//   useEffect(() => {
//     const loadOtherUser = async () => {
//       try {
//         console.log('Loading other user...');
//         console.log('Params:', { initialUser, paramOtherUserId, paramSenderId });

//         if (initialUser) {
//           console.log('Initial user object:', initialUser);
          
//           if (initialUser._id || initialUser.id) {
//             console.log('Setting otherUser from initialUser');
            
//             const standardizedUser = {
//               ...initialUser,
//               _id: initialUser._id || initialUser.id,
//               id: initialUser.id || initialUser._id,
//               // Add professional title if not present
//               profession: initialUser.profession || initialUser.job || 'Software Developer',
//             };
            
//             console.log('Standardized user:', standardizedUser);
//             setOtherUser(standardizedUser);
//             setFetchingUser(false);
//             return;
//           }
//         }

//         let targetUserId = null;
        
//         if (paramOtherUserId) {
//           targetUserId = paramOtherUserId;
//         } else if (paramSenderId) {
//           targetUserId = paramSenderId;
//         }

//         if (!targetUserId) {
//           console.error('No valid user ID found from any parameter');
//           Alert.alert('Chat Error', 'Unable to identify chat partner. Please try again.');
//           navigation.goBack();
//           return;
//         }

//         console.log('Fetching user with ID:', targetUserId);
        
//         const token = await AsyncStorage.getItem('authToken');
//         if (!token) {
//           Alert.alert('Authentication Error', 'Please login again.');
//           navigation.navigate('Login');
//           return;
//         }

//         const response = await fetch(`${API_URL}/api/user/profile/${targetUserId}`, {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         });

//         if (response.ok) {
//           const data = await response.json();
//           if (data.success && data.data) {
//             console.log('User data fetched:', data.data);
//             // Add profession if not present
//             const userData = {
//               ...data.data,
//               profession: data.data.profession || data.data.job || 'Software Developer',
//             };
//             setOtherUser(userData);
//           } else {
//             Alert.alert('Error', 'User not found.');
//             navigation.goBack();
//           }
//         } else {
//           Alert.alert('Error', 'Failed to load user data.');
//           navigation.goBack();
//         }
//       } catch (error) {
//         console.error('Error loading other user:', error);
//         Alert.alert('Error', 'Failed to load chat.');
//         navigation.goBack();
//       } finally {
//         setFetchingUser(false);
//       }
//     };

//     loadOtherUser();
//   }, [initialUser, paramOtherUserId, paramSenderId]);

//   // Load current user
//   useEffect(() => {
//     const loadCurrentUser = async () => {
//       try {
//         const userInfoStr = await AsyncStorage.getItem('userInfo');
//         if (userInfoStr) {
//           const userInfo = JSON.parse(userInfoStr);
//           setCurrentUser(userInfo);
//         }
//       } catch (error) {
//         console.error('Error loading current user:', error);
//       }
//     };

//     loadCurrentUser();
//   }, []);

//   // Load messages once otherUser is loaded
//   useEffect(() => {
//     if (!otherUser || (!otherUser._id && !otherUser.id)) return;

//     const loadMessages = async () => {
//       try {
//         const token = await AsyncStorage.getItem('authToken');
//         const currentUserInfoStr = await AsyncStorage.getItem('userInfo');
//         const currentUserInfo = JSON.parse(currentUserInfoStr || '{}');
        
//         const otherUserId = otherUser._id || otherUser.id;
//         const currentUserId = currentUserInfo._id || currentUserInfo.id;

//         console.log(`Fetching messages between ${currentUserId} and ${otherUserId}`);

//         const response = await fetch(`${API_URL}/api/messages/${otherUserId}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         const data = await response.json();
//         if (data.success && data.data) {
//           const formattedMessages = data.data.map(msg => ({
//             _id: msg._id,
//             text: msg.text,
//             createdAt: new Date(msg.createdAt),
//             user: {
//               _id: msg.sender._id || msg.sender.id,
//               name: msg.sender.name,
//               avatar: msg.sender.avatar || msg.sender.photoURL || 'https://randomuser.me/api/portraits/men/1.jpg',
//             },
//             status: msg.status,
//             attachment: msg.attachment,
//           }));

//           setMessages(formattedMessages.reverse());
//         }
//       } catch (error) {
//         console.error('Error loading messages:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadMessages();

//     // Setup socket listeners
//     const messageHandler = (newMessage) => {
//       console.log('New message received:', newMessage);
      
//       const formattedMessage = {
//         _id: newMessage._id,
//         text: newMessage.text,
//         createdAt: new Date(newMessage.createdAt),
//         user: {
//           _id: newMessage.sender._id || newMessage.sender.id,
//           name: newMessage.sender.name,
//           avatar: newMessage.sender.avatar || newMessage.sender.photoURL || 'https://randomuser.me/api/portraits/men/1.jpg',
//         },
//         status: newMessage.status,
//         attachment: newMessage.attachment,
//       };

//       setMessages(prev => {
//         const filtered = prev.filter(msg => 
//           !(msg.status === 'pending' && msg.text === formattedMessage.text)
//         );
//         return [...filtered, formattedMessage];
//       });
//     };

//     socket.onReceiveMessage(messageHandler);

//     return () => {
//       socket.offReceiveMessage(messageHandler);
//     };
//   }, [otherUser]);

//   // Handle keyboard visibility
//   useEffect(() => {
//     const keyboardDidShowListener = Keyboard.addListener(
//       'keyboardDidShow',
//       (e) => {
//         setKeyboardHeight(e.endCoordinates.height);
//         setIsKeyboardVisible(true);
//         setShowEmojiPicker(false);
//       }
//     );
    
//     const keyboardDidHideListener = Keyboard.addListener(
//       'keyboardDidHide',
//       () => {
//         setKeyboardHeight(0);
//         setIsKeyboardVisible(false);
//       }
//     );

//     return () => {
//       keyboardDidShowListener.remove();
//       keyboardDidHideListener.remove();
//     };
//   }, []);



// // useEffect(() => {
// //   const handleNotificationOpen = (notification) => {
// //     if (notification.data?.type === 'chat_message' && 
// //         notification.data?.otherUserId !== otherUser?._id) {
// //       // Navigate to the sender's chat if not already there
// //       navigation.replace('Message', {
// //         user: { _id: notification.data.otherUserId }
// //       });
// //     }
// //   };

// //   // Check if app was opened from notification
// //   messaging().getInitialNotification().then(remoteMessage => {
// //     if (remoteMessage) {
// //       handleNotificationOpen(remoteMessage);
// //     }
// //   });

// //   // Handle notification when app is in background
// //   const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
// //     if (remoteMessage) {
// //       handleNotificationOpen(remoteMessage);
// //     }
// //   });

// //   return unsubscribe;
// // }, [navigation, otherUser?._id]);




//   // Handle typing indicator
//   const handleInputTextChanged = useCallback((text) => {
//     setInputText(text);
//     const otherUserId = otherUser?._id || otherUser?.id;
    
//     if (otherUserId) {
//       if (text.length > 0) {
//         socket.emit('typing', { recipientId: otherUserId });
//         if (typingTimeoutRef.current) {
//           clearTimeout(typingTimeoutRef.current);
//         }
//         typingTimeoutRef.current = setTimeout(() => {
//           socket.emit('stopTyping', { recipientId: otherUserId });
//         }, 3000);
//       } else {
//         socket.emit('stopTyping', { recipientId: otherUserId });
//         if (typingTimeoutRef.current) {
//           clearTimeout(typingTimeoutRef.current);
//         }
//       }
//     }
//   }, [otherUser]);

//   // Typing status listener
//   useEffect(() => {
//     const otherUserId = otherUser?._id || otherUser?.id;
    
//     if (otherUserId) {
//       const typingStatusHandler = ({ senderId, isTyping: status }) => {
//         if (senderId === otherUserId) {
//           setIsTyping(status);
//         }
//       };
//       socket.on('typingStatus', typingStatusHandler);

//       return () => {
//         socket.off('typingStatus', typingStatusHandler);
//       };
//     }
//   }, [otherUser]);



//   const handleSend = () => {
//   const otherUserId = otherUser._id || otherUser.id;
//   const currentUserId = currentUser?._id || currentUser?.id;
  
//   if (!otherUserId || !currentUserId || (!inputText.trim() && !selectedAttachment)) {
//     return;
//   }

//   // Generate a temporary ID for optimistic update
//   const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
//   const newMessage = {
//     _id: tempId,
//     text: inputText.trim() || '',
//     createdAt: new Date(),
//     user: { 
//       _id: currentUserId,
//       name: currentUser?.name || 'You'
//     },
//     status: 'pending',
//     attachment: selectedAttachment,
//   };

//   console.log('[MessageScreen] Adding optimistic message with temp ID:', tempId);
//   setMessages(prev => [...prev, newMessage]);
  
//   // Send via socket
//   const success = socket.sendMessage(otherUserId, inputText.trim(), selectedAttachment);
  
//   if (success) {
//     console.log('[MessageScreen] ✅ Message sent via socket');
//   } else {
//     console.error('[MessageScreen] ❌ Socket send failed');
//     // Update status to failed
//     setMessages(prev =>
//       prev.map(msg =>
//         msg._id === tempId ? { ...msg, status: 'failed' } : msg
//       )
//     );
//   }
  
//   setInputText('');
//   setSelectedAttachment(null);
//   setShowEmojiPicker(false);
// };

// // HTTP fallback function
// const sendViaHttpApi = async (recipientId, text, attachment) => {
//   try {
//     const token = await AsyncStorage.getItem('authToken');
//     const response = await fetch(`${API_URL}/api/messages/send`, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         recipientId,
//         text,
//         attachment
//       }),
//     });

//     if (response.ok) {
//       const data = await response.json();
//       console.log('[MessageScreen] HTTP API send success:', data);
//     } else {
//       console.error('[MessageScreen] HTTP API send failed:', response.status);
//     }
//   } catch (error) {
//     console.error('[MessageScreen] HTTP API send error:', error);
//   }
// };

//   // Handle emoji selection
//   const handleEmojiSelect = (emoji) => {
//     setInputText(prev => prev + emoji);
//   };

//   // Handle attachment selection
//   const handleAttachment = () => {
//     setAttachmentModalVisible(true);
//   };

//   const selectImage = () => {
//     const options = {
//       mediaType: 'photo',
//       quality: 0.8,
//     };
    
//     launchImageLibrary(options, (response) => {
//       if (response.assets && response.assets[0]) {
//         setSelectedAttachment({
//           type: 'image',
//           uri: response.assets[0].uri,
//           name: response.assets[0].fileName,
//         });
//         setAttachmentModalVisible(false);
//       }
//     });
//   };

//   const selectCamera = () => {
//     const options = {
//       mediaType: 'photo',
//       quality: 0.8,
//     };
    
//     launchCamera(options, (response) => {
//       if (response.assets && response.assets[0]) {
//         setSelectedAttachment({
//           type: 'image',
//           uri: response.assets[0].uri,
//           name: response.assets[0].fileName,
//         });
//         setAttachmentModalVisible(false);
//       }
//     });
//   };

//   // Loading state
//   if (fetchingUser || !otherUser) {
//     return (
//       <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
//         <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={{ color: COLORS.textPrimary, marginTop: 20 }}>Loading chat...</Text>
//       </SafeAreaView>
//     );
//   }

//   // Main render
//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
//       {/* Header */}
//       <View style={styles.header}>
//         <View style={styles.headerContent}>
//           <TouchableOpacity 
//             onPress={() => navigation.goBack()} 
//             style={styles.backButton}
//           >
//             <Icon name="arrow-back" size={26} color={COLORS.textPrimary} />
//           </TouchableOpacity>
          
//           <TouchableOpacity style={styles.userInfoContainer}>
//             <View style={styles.avatarContainer}>
//               <Image 
//                 source={{ uri: otherUser.photoURL || otherUser.avatar || 'https://randomuser.me/api/portraits/men/1.jpg' }} 
//                 style={styles.avatar}
//               />
//               {otherUser.isOnline && <View style={styles.onlineIndicator} />}
//             </View>
//             <View style={styles.userInfo}>
//               <Text style={styles.userName}>{otherUser.name || 'Unknown User'}</Text>
//               <Text style={styles.userProfession}>{otherUser.profession || 'Software Developer'}</Text>
//               <View style={styles.statusContainer}>
//                 {isTyping ? (
//                   <View style={styles.typingContainer}>
//                     <View style={styles.typingDot} />
//                     <View style={[styles.typingDot, styles.typingDotMiddle]} />
//                     <View style={styles.typingDot} />
//                     <Text style={styles.typingText}>Typing...</Text>
//                   </View>
//                 ) : (
//                   <Text style={styles.statusText}>
//                     {otherUser.isOnline ? 'Online' : `Last seen ${lastSeen}`}
//                   </Text>
//                 )}
//               </View>
//             </View>
//           </TouchableOpacity>
          
//           <View style={styles.headerActions}>
//             <TouchableOpacity 
//               style={styles.headerActionButton}
//               onPress={() => Alert.alert('Video Call', 'Video call feature coming soon!')}
//             >
//               <Icon name="videocam" size={24} color={COLORS.textPrimary} />
//             </TouchableOpacity>
            
//             <TouchableOpacity 
//               style={styles.headerActionButton}
//               onPress={() => Alert.alert('Voice Call', 'Voice call feature coming soon!')}
//             >
//               <Icon name="call" size={22} color={COLORS.textPrimary} />
//             </TouchableOpacity>
            
//             <TouchableOpacity 
//               style={styles.headerActionButton}
//               onPress={() => setMoreMenuVisible(true)}
//             >
//               <Icon name="more-vert" size={24} color={COLORS.textPrimary} />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>

//       {/* Chat Messages */}
//       <FlatList
//         ref={flatListRef}
//         data={messages}
//         renderItem={({ item }) => {
//           const messageUserId = item.user._id || item.user.id;
//           const currentUserId = currentUser?._id || currentUser?.id;
//           const isOutgoing = messageUserId === currentUserId;
          
//           return (
//             <View style={[
//               styles.messageItem,
//               isOutgoing ? styles.messageItemOutgoing : styles.messageItemIncoming
//             ]}>
//               <View style={[
//                 styles.messageBubble,
//                 isOutgoing ? styles.outgoingBubble : styles.incomingBubble
//               ]}>
//                 {item.attachment && (
//                   <View style={styles.attachmentContainer}>
//                     {item.attachment.type === 'image' ? (
//                       <Image 
//                         source={{ uri: item.attachment.uri }} 
//                         style={styles.attachmentImage}
//                       />
//                     ) : (
//                       <View style={styles.documentContainer}>
//                         <Icon name="insert-drive-file" size={24} color={COLORS.textSecondary} />
//                         <Text style={styles.documentName}>{item.attachment.name}</Text>
//                       </View>
//                     )}
//                   </View>
//                 )}
//                 {item.text && (
//                   <Text style={[
//                     styles.messageText,
//                     isOutgoing ? styles.outgoingMessageText : styles.incomingMessageText
//                   ]}>
//                     {item.text}
//                   </Text>
//                 )}
//                 <View style={styles.messageTimeContainer}>
//                   <Text style={[
//                     styles.messageTime,
//                     isOutgoing ? styles.outgoingMessageTime : styles.incomingMessageTime
//                   ]}>
//                     {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                   </Text>
//                   {isOutgoing && (
//                     <Icon 
//                       name={item.status === 'read' ? "done-all" : "done"} 
//                       size={16} 
//                       color={item.status === 'read' ? COLORS.success : COLORS.textTertiary} 
//                       style={styles.statusIcon}
//                     />
//                   )}
//                 </View>
//               </View>
//             </View>
//           );
//         }}
//         keyExtractor={(item) => item._id ? item._id.toString() : item.id ? item.id.toString() : Math.random().toString()}
//         contentContainerStyle={styles.messagesList}
//         inverted={false}
//         showsVerticalScrollIndicator={false}
//       />

//       {/* Attachment Modal */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={attachmentModalVisible}
//         onRequestClose={() => setAttachmentModalVisible(false)}
//       >
//         <TouchableOpacity 
//           style={styles.modalOverlay} 
//           activeOpacity={1} 
//           onPress={() => setAttachmentModalVisible(false)}
//         >
//           <View style={styles.attachmentModalContainer}>
//             <View style={styles.attachmentModalHandle} />
//             <Text style={styles.attachmentModalTitle}>Share</Text>
            
//             <View style={styles.attachmentOptions}>
//               <TouchableOpacity style={styles.attachmentOption} onPress={selectCamera}>
//                 <View style={styles.attachmentIconContainer}>
//                   <Icon name="photo-camera" size={28} color={COLORS.primary} />
//                 </View>
//                 <Text style={styles.attachmentOptionText}>Camera</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity style={styles.attachmentOption} onPress={selectImage}>
//                 <View style={styles.attachmentIconContainer}>
//                   <Icon name="image" size={28} color={COLORS.primary} />
//                 </View>
//                 <Text style={styles.attachmentOptionText}>Gallery</Text>
//               </TouchableOpacity>
//             </View>
            
//             <TouchableOpacity 
//               style={styles.cancelButton}
//               onPress={() => setAttachmentModalVisible(false)}
//             >
//               <Text style={styles.cancelButtonText}>Cancel</Text>
//             </TouchableOpacity>
//           </View>
//         </TouchableOpacity>
//       </Modal>

//       {/* Emoji Picker */}
//       {showEmojiPicker && (
//         <View style={styles.emojiPickerContainer}>
//           <ScrollView 
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={styles.emojiScrollView}
//           >
//             {EMOJIS.map((row, rowIndex) => (
//               <View key={rowIndex} style={styles.emojiRow}>
//                 {row.map((emoji, emojiIndex) => (
//                   <TouchableOpacity
//                     key={emojiIndex}
//                     style={styles.emojiItem}
//                     onPress={() => handleEmojiSelect(emoji)}
//                   >
//                     <Text style={styles.emojiText}>{emoji}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             ))}
//           </ScrollView>
//         </View>
//       )}

//       {/* Selected Attachment Preview */}
//       {selectedAttachment && (
//         <View style={styles.selectedAttachmentContainer}>
//           {selectedAttachment.type === 'image' ? (
//             <View style={styles.selectedImageContainer}>
//               <Image 
//                 source={{ uri: selectedAttachment.uri }} 
//                 style={styles.selectedImage}
//               />
//               <TouchableOpacity 
//                 style={styles.removeAttachmentButton}
//                 onPress={() => setSelectedAttachment(null)}
//               >
//                 <Icon name="close" size={18} color={COLORS.textPrimary} />
//               </TouchableOpacity>
//             </View>
//           ) : (
//             <View style={styles.selectedDocumentContainer}>
//               <Icon name="insert-drive-file" size={24} color={COLORS.textSecondary} />
//               <Text style={styles.selectedDocumentName} numberOfLines={1}>{selectedAttachment.name}</Text>
//               <TouchableOpacity 
//                 style={styles.removeAttachmentButton}
//                 onPress={() => setSelectedAttachment(null)}
//               >
//                 <Icon name="close" size={18} color={COLORS.textPrimary} />
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>
//       )}

//       {/* Input Area */}
//       <View style={[
//         styles.inputContainer,
//         { marginBottom: showEmojiPicker ? 0 : keyboardHeight }
//       ]}>
//         <View style={styles.inputWrapper}>
//           <TouchableOpacity 
//             style={styles.emojiButton}
//             onPress={() => setShowEmojiPicker(!showEmojiPicker)}
//           >
//             <Icon 
//               name={showEmojiPicker ? "keyboard" : "insert-emoticon"} 
//               size={24} 
//               color={showEmojiPicker ? COLORS.primary : COLORS.textTertiary} 
//             />
//           </TouchableOpacity>

//           <TouchableOpacity 
//             style={styles.attachmentButton}
//             onPress={handleAttachment}
//           >
//             <Icon name="attach-file" size={24} color={COLORS.textTertiary} />
//           </TouchableOpacity>

//           <View style={styles.textInputContainer}>
//             <TextInput
//               ref={inputRef}
//               style={styles.textInput}
//               value={inputText}
//               onChangeText={handleInputTextChanged}
//               placeholder="Type a message..."
//               placeholderTextColor={COLORS.textTertiary}
//               multiline
//             />
//           </View>

//           <TouchableOpacity 
//             style={[
//               styles.sendButton,
//               (!inputText.trim() && !selectedAttachment) && styles.sendButtonDisabled
//             ]}
//             onPress={handleSend}
//             disabled={!inputText.trim() && !selectedAttachment}
//           >
//             <Icon name="send" size={20} color="#FFFFFF" />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* More Options Modal */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={moreMenuVisible}
//         onRequestClose={() => setMoreMenuVisible(false)}
//       >
//         <TouchableOpacity 
//           style={styles.modalOverlay} 
//           activeOpacity={1} 
//           onPress={() => setMoreMenuVisible(false)}
//         >
//           <View style={styles.moreMenuContainer}>
//             <View style={styles.moreMenuHandle} />
//             <Text style={styles.moreMenuTitle}>More Options</Text>
            
//             <View style={styles.moreMenuContent}>
//               <TouchableOpacity style={styles.menuOption}>
//                 <Icon name="info" size={24} color={COLORS.textSecondary} />
//                 <Text style={styles.menuOptionText}>View Contact</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity style={styles.menuOption}>
//                 <Icon name="search" size={24} color={COLORS.textSecondary} />
//                 <Text style={styles.menuOptionText}>Search</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity style={styles.menuOption}>
//                 <Icon name="volume-off" size={24} color={COLORS.textSecondary} />
//                 <Text style={styles.menuOptionText}>Mute Notifications</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity style={styles.menuOption}>
//                 <Icon name="wallpaper" size={24} color={COLORS.textSecondary} />
//                 <Text style={styles.menuOptionText}>Wallpaper</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity style={styles.menuOption}>
//                 <Icon name="lock" size={24} color={COLORS.textSecondary} />
//                 <Text style={styles.menuOptionText}>Encryption</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity style={[styles.menuOption, styles.dangerOption]}>
//                 <Icon name="block" size={24} color={COLORS.danger} />
//                 <Text style={[styles.menuOptionText, styles.dangerText]}>Block</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity style={[styles.menuOption, styles.dangerOption]}>
//                 <Icon name="delete" size={24} color={COLORS.danger} />
//                 <Text style={[styles.menuOptionText, styles.dangerText]}>Delete Chat</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </TouchableOpacity>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//   },
//   header: {
//     backgroundColor: COLORS.backgroundLight,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.border,
//     shadowColor: COLORS.shadow,
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 3,
//     zIndex: 10,
//   },
//   headerContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     height: 70,
//   },
//   backButton: {
//     padding: 4,
//     marginRight: 12,
//   },
//   userInfoContainer: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   avatarContainer: {
//     position: 'relative',
//     marginRight: 12,
//   },
//   avatar: {
//     width: 46,
//     height: 46,
//     borderRadius: 23,
//   },
//   onlineIndicator: {
//     position: 'absolute',
//     bottom: 0,
//     right: 0,
//     width: 14,
//     height: 14,
//     borderRadius: 7,
//     backgroundColor: COLORS.online,
//     borderWidth: 2,
//     borderColor: COLORS.backgroundLight,
//   },
//   userInfo: {
//     flex: 1,
//   },
//   userName: {
//     color: COLORS.textPrimary,
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   userProfession: {
//     color: COLORS.textSecondary,
//     fontSize: 14,
//     marginTop: 1,
//   },
//   statusContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 2,
//   },
//   typingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   typingDot: {
//     width: 5,
//     height: 5,
//     borderRadius: 3,
//     backgroundColor: COLORS.typing,
//     marginHorizontal: 1,
//   },
//   typingDotMiddle: {
//     opacity: 0.7,
//   },
//   typingText: {
//     color: COLORS.typing,
//     fontSize: 12,
//     marginLeft: 6,
//     fontStyle: 'italic',
//   },
//   statusText: {
//     color: COLORS.textSecondary,
//     fontSize: 13,
//   },
//   headerActions: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   headerActionButton: {
//     padding: 8,
//     marginLeft: 8,
//   },
//   messagesList: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     paddingBottom: 10,
//   },
//   messageItem: {
//     marginVertical: 4,
//     maxWidth: '80%',
//   },
//   messageItemOutgoing: {
//     alignSelf: 'flex-end',
//   },
//   messageItemIncoming: {
//     alignSelf: 'flex-start',
//   },
//   messageBubble: {
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 20,
//     shadowColor: COLORS.shadow,
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   outgoingBubble: {
//     backgroundColor: COLORS.outgoingBg,
//     borderBottomRightRadius: 4,
//   },
//   incomingBubble: {
//     backgroundColor: COLORS.incomingBg,
//     borderBottomLeftRadius: 4,
//   },
//   messageText: {
//     fontSize: 16,
//     lineHeight: 20,
//   },
//   outgoingMessageText: {
//     color: COLORS.backgroundLight,
//   },
//   incomingMessageText: {
//     color: COLORS.textPrimary,
//   },
//   messageTimeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//     marginTop: 4,
//   },
//   messageTime: {
//     fontSize: 11,
//   },
//   outgoingMessageTime: {
//     color: 'rgba(255, 255, 255, 0.7)',
//   },
//   incomingMessageTime: {
//     color: COLORS.textTertiary,
//   },
//   statusIcon: {
//     marginLeft: 4,
//   },
//   attachmentContainer: {
//     marginBottom: 8,
//   },
//   attachmentImage: {
//     width: 200,
//     height: 200,
//     borderRadius: 8,
//   },
//   documentContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 12,
//     backgroundColor: 'rgba(0, 0, 0, 0.05)',
//     borderRadius: 8,
//   },
//   documentName: {
//     marginLeft: 8,
//     fontSize: 14,
//     color: COLORS.textPrimary,
//   },
//   inputContainer: {
//     backgroundColor: COLORS.backgroundLight,
//     borderTopWidth: 1,
//     borderTopColor: COLORS.border,
//     paddingHorizontal: 8,
//     paddingVertical: 8,
//   },
//   inputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     minHeight: 50,
//   },
//   emojiButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 20,
//   },
//   attachmentButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 20,
//     transform: [{ rotate: '-45deg' }],
//   },
//   textInputContainer: {
//     flex: 1,
//     marginHorizontal: 8,
//     backgroundColor: COLORS.backgroundLighter,
//     borderRadius: 24,
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     maxHeight: 120,
//     minHeight: 40,
//     justifyContent: 'center',
//   },
//   textInput: {
//     fontSize: 16,
//     color: COLORS.textPrimary,
//     paddingVertical: 6,
//     maxHeight: 100,
//     minHeight: 24,
//     textAlignVertical: 'center',
//   },
//   sendButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: COLORS.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   sendButtonDisabled: {
//     backgroundColor: COLORS.backgroundLighter,
//   },
//   emojiPickerContainer: {
//     height: 250,
//     backgroundColor: COLORS.backgroundLight,
//     borderTopWidth: 1,
//     borderTopColor: COLORS.border,
//   },
//   emojiScrollView: {
//     flex: 1,
//     paddingHorizontal: 8,
//     paddingVertical: 12,
//   },
//   emojiRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 8,
//   },
//   emojiItem: {
//     width: 36,
//     height: 36,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 8,
//   },
//   emojiText: {
//     fontSize: 24,
//   },
//   selectedAttachmentContainer: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderTopWidth: 1,
//     borderTopColor: COLORS.border,
//   },
//   selectedImageContainer: {
//     position: 'relative',
//     alignSelf: 'flex-start',
//   },
//   selectedImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 8,
//   },
//   selectedDocumentContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 12,
//     backgroundColor: COLORS.backgroundLighter,
//     borderRadius: 8,
//   },
//   selectedDocumentName: {
//     flex: 1,
//     marginLeft: 8,
//     fontSize: 14,
//     color: COLORS.textPrimary,
//   },
//   removeAttachmentButton: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     backgroundColor: 'rgba(0, 0, 0, 0.2)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: 8,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.4)',
//     justifyContent: 'flex-end',
//   },
//   attachmentModalContainer: {
//     backgroundColor: COLORS.backgroundLight,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     paddingBottom: 30,
//   },
//   attachmentModalHandle: {
//     width: 40,
//     height: 5,
//     backgroundColor: COLORS.textTertiary,
//     borderRadius: 3,
//     alignSelf: 'center',
//     marginTop: 10,
//     marginBottom: 15,
//   },
//   attachmentModalTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   attachmentOptions: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginBottom: 20,
//   },
//   attachmentOption: {
//     alignItems: 'center',
//     paddingVertical: 10,
//   },
//   attachmentIconContainer: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: COLORS.backgroundLighter,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   attachmentOptionText: {
//     fontSize: 14,
//     color: COLORS.textPrimary,
//   },
//   cancelButton: {
//     paddingVertical: 12,
//     alignItems: 'center',
//     borderTopWidth: 1,
//     borderTopColor: COLORS.border,
//   },
//   cancelButtonText: {
//     fontSize: 18,
//     color: COLORS.danger,
//     fontWeight: '500',
//   },
//   moreMenuContainer: {
//     backgroundColor: COLORS.backgroundLight,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     paddingBottom: 30,
//   },
//   moreMenuHandle: {
//     width: 40,
//     height: 5,
//     backgroundColor: COLORS.textTertiary,
//     borderRadius: 3,
//     alignSelf: 'center',
//     marginTop: 10,
//     marginBottom: 15,
//   },
//   moreMenuTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: COLORS.textPrimary,
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   moreMenuContent: {
//     paddingHorizontal: 20,
//   },
//   menuOption: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.border,
//   },
//   menuOptionText: {
//     fontSize: 16,
//     color: COLORS.textPrimary,
//     marginLeft: 15,
//   },
//   dangerOption: {
//     // No additional styles needed
//   },
//   dangerText: {
//     color: COLORS.danger,
//   },
// });

// export default MessageScreen;



