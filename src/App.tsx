/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Feed from './components/Feed';
import PublishModal from './components/PublishModal';
import RequestModal from './components/RequestModal';
import RequestsPanel from './components/RequestsPanel';
import UserProfileModal from './components/UserProfileModal';
import RegistrationModal from './components/RegistrationModal';
import AdminPanel from './components/AdminPanel';
import AdminLoginGate from './components/AdminLoginGate';
import InstallPrompt from './components/InstallPrompt';

import { User, Publication, Request, Message, Notification, ThankYou, PublicationType, CategoryType, Announcement } from './types';
import { mockUsers, mockPublications, mockRequests, mockMessages, mockNotifications, mockThankYous, mockAnnouncements, guestUser } from './mockData';
import { api } from './services/api';
import { Leaf, Heart, Plus, User as UserIcon, ShieldAlert, Sparkles, MessageCircle, Check, Megaphone } from 'lucide-react';

const DATA_VERSION = 'v10_guest_default_pass_update_2026';
export const ADMIN_PASSWORD = 'LarryO405';
export const JUNTA_PASSWORD = 'JuntaVecinal2026';

function getInitialData<T>(key: string, fallback: T): T {
  try {
    const version = localStorage.getItem('morita_data_version');
    if (version !== DATA_VERSION) {
      localStorage.setItem('morita_data_version', DATA_VERSION);
      localStorage.removeItem('morita_users');
      localStorage.removeItem('morita_currentUser');
      localStorage.removeItem('morita_publications');
      localStorage.removeItem('morita_requests');
      localStorage.removeItem('morita_messages');
      localStorage.removeItem('morita_notifications');
      localStorage.removeItem('morita_thankYous');
      localStorage.removeItem('morita_announcements');
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch (e) {
    return fallback;
  }
}

export default function App() {
  // -----------------------------------------
  // 1. STATE INITIALIZATION & PERSISTENCE
  // -----------------------------------------

  const [users, setUsers] = useState<User[]>(() =>
    getInitialData('morita_users', mockUsers)
  );

  const [currentUser, setCurrentUser] = useState<User>(() =>
    getInitialData('morita_currentUser', guestUser)
  );

  const [publications, setPublications] = useState<Publication[]>(() => {
    const rawList: Publication[] = getInitialData('morita_publications', mockPublications);
    return rawList.map(p => {
      let val = p.priceValue || '';
      // Sanitize any legacy unrealistically high prices
      if (val.includes('10000') || val.includes('10.000') || val.includes('9500') || val.includes('9.500') || val.includes('9000')) {
        const mockMatch = mockPublications.find(mp => mp.id === p.id);
        if (mockMatch && mockMatch.priceValue) {
          val = mockMatch.priceValue;
        } else {
          val = 'Bs. 50';
        }
      }
      return {
        ...p,
        priceValue: val ? val.replace(/\$/g, 'Bs.') : val,
        isActive: p.isActive !== false
      };
    });
  });

  const [requests, setRequests] = useState<Request[]>(() =>
    getInitialData('morita_requests', mockRequests)
  );

  const [messages, setMessages] = useState<Message[]>(() =>
    getInitialData('morita_messages', mockMessages)
  );

  const [notifications, setNotifications] = useState<Notification[]>(() =>
    getInitialData('morita_notifications', mockNotifications)
  );

  const [thankYous, setThankYous] = useState<ThankYou[]>(() =>
    getInitialData('morita_thankYous', mockThankYous)
  );

  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    getInitialData('morita_announcements', mockAnnouncements)
  );

  // Favorites State (stored per-user ID)
  const [favorites, setFavorites] = useState<string[]>(() => {
    const stored = localStorage.getItem(`morita_favorites_${currentUser.id}`);
    return stored ? JSON.parse(stored) : [];
  });

  // Whenever currentUser.id changes, load favorites for that user
  useEffect(() => {
    const stored = localStorage.getItem(`morita_favorites_${currentUser.id}`);
    setFavorites(stored ? JSON.parse(stored) : []);
  }, [currentUser.id]);

  // Whenever favorites changes (or currentUser.id), save it to localStorage
  useEffect(() => {
    localStorage.setItem(`morita_favorites_${currentUser.id}`, JSON.stringify(favorites));
  }, [favorites, currentUser.id]);

  // Navigation and Modal States
  const [activeTab, setActiveTab] = useState<string>('feed'); // 'feed' | 'requests' | 'admin'
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [publicationToEdit, setPublicationToEdit] = useState<Publication | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [registrationMode, setRegistrationMode] = useState<'edit' | 'register'>('edit');
  const [activePublicationForRequest, setActivePublicationForRequest] = useState<Publication | null>(null);
  const [selectedRequestIdForChat, setSelectedRequestIdForChat] = useState<string | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    const stored = localStorage.getItem('morita_adminLoggedIn');
    if (stored !== null) return stored === 'true';
    return false; // Default to guest mode on fresh install / first launch
  });
  const [isJuntaModalOpen, setIsJuntaModalOpen] = useState(false);
  const [isJuntaLoggedIn, setIsJuntaLoggedIn] = useState<boolean>(() => {
    const stored = localStorage.getItem('morita_juntaLoggedIn');
    if (stored !== null) return stored === 'true';
    return false;
  });

  // Synchronize localStorage on states changes
  useEffect(() => {
    localStorage.setItem('morita_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('morita_currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('morita_publications', JSON.stringify(publications));
  }, [publications]);

  useEffect(() => {
    localStorage.setItem('morita_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('morita_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('morita_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('morita_thankYous', JSON.stringify(thankYous));
  }, [thankYous]);

  useEffect(() => {
    localStorage.setItem('morita_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('morita_adminLoggedIn', String(isAdminLoggedIn));
  }, [isAdminLoggedIn]);

  useEffect(() => {
    localStorage.setItem('morita_juntaLoggedIn', String(isJuntaLoggedIn));
  }, [isJuntaLoggedIn]);

  // Load data from Supabase Cloud on mount & poll every 5 seconds for cross-device sync
  const loadCloudData = async () => {
    try {
      const [cloudPubs, cloudUsers, cloudReqs, cloudMsgs, cloudNotifs, cloudAnns] = await Promise.all([
        api.getPublications(),
        api.getUsers(),
        api.getRequests(),
        api.getMessages(),
        api.getNotifications(),
        api.getAnnouncements(),
      ]);

      if (cloudPubs && cloudPubs.length > 0) setPublications(cloudPubs);
      if (cloudUsers && cloudUsers.length > 0) setUsers(cloudUsers);
      if (cloudReqs && cloudReqs.length > 0) setRequests(cloudReqs);
      if (cloudMsgs && cloudMsgs.length > 0) setMessages(cloudMsgs);
      if (cloudNotifs && cloudNotifs.length > 0) setNotifications(cloudNotifs);
      if (cloudAnns && cloudAnns.length > 0) setAnnouncements(cloudAnns);
    } catch (err) {
      console.error('Error loading cloud data from Supabase:', err);
    }
  };

  useEffect(() => {
    loadCloudData();
    const interval = setInterval(() => {
      loadCloudData();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // -----------------------------------------
  // 2. WORKFLOW HANDLERS
  // -----------------------------------------

  // Switch Active Neighbor / Guest
  const handleSwitchUser = (userId: string) => {
    // If attempting to switch to Admin account and not logged in as Admin, prompt for credentials
    if (userId === 'currentUser' || users.find(u => u.id === userId)?.isAdmin) {
      if (!isAdminLoggedIn) {
        setIsAdminModalOpen(true);
        return;
      }
    }

    if (userId === 'guest') {
      setCurrentUser(guestUser);
      setSelectedRequestIdForChat(null);
      setIsAdminLoggedIn(false);
      if (activeTab === 'admin') {
        setActiveTab('feed');
      }
      return;
    }

    const target = users.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
      setSelectedRequestIdForChat(null); // Clear selected chat to avoid cross-user confusion
      if (!target.isAdmin) {
        setIsAdminLoggedIn(false);
        if (activeTab === 'admin') {
          setActiveTab('feed');
        }
      } else {
        setIsAdminLoggedIn(true);
      }
    }
  };

  // Toggle Publication Favorite
  const handleToggleFavorite = (pubId: string) => {
    setFavorites(prev => {
      if (prev.includes(pubId)) {
        return prev.filter(id => id !== pubId);
      } else {
        return [...prev, pubId];
      }
    });
  };

  // Create or Edit a post
  const handleCreatePublication = async (pubData: {
    type: PublicationType;
    title: string;
    category: CategoryType;
    description: string;
    priceType: 'monto' | 'a-consultar' | 'intercambio';
    priceValue?: string;
    photo?: string;
    zone: string;
    availability?: string;
  }, id?: string) => {
    const formattedPrice = pubData.priceValue ? pubData.priceValue.replace(/\$/g, 'Bs.') : pubData.priceValue;

    if (id) {
      // Edit mode
      const existing = publications.find(p => p.id === id);
      if (existing) {
        const updatedPub: Publication = {
          ...existing,
          ...pubData,
          priceValue: formattedPrice
        };
        setPublications(prev => prev.map(p => p.id === id ? updatedPub : p));
        await api.updatePublication(updatedPub);
      }
    } else {
      // Create mode
      const newPub = await api.createPublication({
        userId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        ...pubData,
        priceValue: formattedPrice,
        isActive: true,
        zone: pubData.zone
      });

      setPublications(prev => [newPub, ...prev]);
    }
    setPublicationToEdit(null);
  };

  // Toggle active / inactive status of a post
  const handleTogglePublicationActive = async (pubId: string) => {
    const target = publications.find(p => p.id === pubId);
    if (!target) return;
    const updated = { ...target, isActive: target.isActive === false ? true : false };
    setPublications(prev => prev.map(p => p.id === pubId ? updated : p));
    await api.updatePublication(updated);
  };

  // Send an interest / help request on a post
  const handleCreateRequest = async (reqData: {
    comment: string;
    quantity?: number;
    proposedDateTime?: string;
  }) => {
    if (!activePublicationForRequest) return;

    const newRequest = await api.createRequest({
      publicationId: activePublicationForRequest.id,
      publicationTitle: activePublicationForRequest.title,
      publicationType: activePublicationForRequest.type,
      publisherId: activePublicationForRequest.userId,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterAvatar: currentUser.avatar,
      ...reqData,
      status: 'pendiente'
    });

    setRequests(prev => [newRequest, ...prev]);

    // Create notification for the publisher
    const newNotif: Notification = {
      id: 'notif_' + Date.now(),
      userId: activePublicationForRequest.userId,
      type: 'new_request',
      title: activePublicationForRequest.type === 'necesito' ? '¡Ofrecieron ayudarte! 🤝' : '¡Hay un vecino interesado! 🛒',
      message: `${currentUser.name} respondió a tu publicación: "${activePublicationForRequest.title}"`,
      requestId: newRequest.id,
      createdAt: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [newNotif, ...prev]);
    await api.createNotification(newNotif);

    // Focus immediately on the newly created request
    setSelectedRequestIdForChat(newRequest.id);
    setActiveTab('requests');
    setActivePublicationForRequest(null);
  };

  // Send a chat message
  const handleSendMessage = async (requestId: string, text: string) => {
    const activeReq = requests.find(r => r.id === requestId);
    if (!activeReq) return;

    const newMsg = await api.sendMessage({
      requestId,
      senderId: currentUser.id,
      text
    });

    setMessages(prev => [...prev, newMsg]);

    // Find who receives the message
    const recipientId = activeReq.publisherId === currentUser.id ? activeReq.requesterId : activeReq.publisherId;

    // Create a chat notification for the recipient
    const newNotif: Notification = {
      id: 'notif_' + Date.now(),
      userId: recipientId,
      type: 'new_message',
      title: `Mensaje de ${currentUser.name}`,
      message: `"${text}"`,
      requestId: requestId,
      createdAt: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [newNotif, ...prev]);
    await api.createNotification(newNotif);
  };

  // Change request status (Aceptada, Rechazada, Completada)
  const handleChangeRequestStatus = async (requestId: string, newStatus: 'pendiente' | 'aceptada' | 'rechazada' | 'completada') => {
    setRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return { ...r, status: newStatus };
      }
      return r;
    }));

    await api.updateRequestStatus(requestId, newStatus);

    const activeReq = requests.find(r => r.id === requestId);
    if (!activeReq) return;

    // Recipient of the status notification (usually the requester)
    const recipientId = activeReq.publisherId === currentUser.id ? activeReq.requesterId : activeReq.publisherId;

    let notifTitle = '';
    let notifMsg = '';

    if (newStatus === 'aceptada') {
      notifTitle = '¡Solicitud Aceptada! 🎉';
      notifMsg = `${currentUser.name} aceptó tu solicitud en: "${activeReq.publicationTitle}". ¡Ya pueden chatear!`;
    } else if (newStatus === 'rechazada') {
      notifTitle = 'Solicitud rechazada';
      notifMsg = `${currentUser.name} no pudo aceptar tu solicitud en: "${activeReq.publicationTitle}".`;
    } else if (newStatus === 'completada') {
      notifTitle = '¡Intercambio Completado! 🌟';
      notifMsg = `${currentUser.name} marcó como completado el intercambio de: "${activeReq.publicationTitle}". ¡Dejale un agradecimiento!`;
    }

    const newNotif: Notification = {
      id: 'notif_' + Date.now(),
      userId: recipientId,
      type: 'status_change',
      title: notifTitle,
      message: notifMsg,
      requestId: requestId,
      createdAt: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [newNotif, ...prev]);
    await api.createNotification(newNotif);
  };

  // Add a Thank You (Recomendación) to a neighbor
  const handleAddThankYou = (targetUserId: string, text: string, pubTitle?: string) => {
    const newThankYou: ThankYou = {
      id: 'ty_' + Date.now(),
      targetUserId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      text,
      createdAt: new Date().toISOString(),
      publicationTitle: pubTitle
    };

    setThankYous(prev => [newThankYou, ...prev]);
  };

  // Edit / Save Profile information
  const handleSaveProfile = async (updatedUser: User) => {
    // Update active user lists
    setUsers(prev => {
      const exists = prev.some(u => u.id === updatedUser.id);
      if (exists) {
        return prev.map(u => u.id === updatedUser.id ? updatedUser : u);
      } else {
        return [...prev, updatedUser];
      }
    });
    
    // Set as active user
    setCurrentUser(updatedUser);

    await api.updateUserProfile(updatedUser);

    // Retroactively update name/avatar in their publications
    setPublications(prev => prev.map(p => {
      if (p.userId === updatedUser.id) {
        return {
          ...p,
          authorName: updatedUser.name,
          authorAvatar: updatedUser.avatar,
          zone: updatedUser.zone // update zone on published items
        };
      }
      return p;
    }));

    // Retroactively update name/avatar in requests they made
    setRequests(prev => prev.map(r => {
      if (r.requesterId === updatedUser.id) {
        return {
          ...r,
          requesterName: updatedUser.name,
          requesterAvatar: updatedUser.avatar
        };
      }
      return r;
    }));
  };

  // --- ADMIN PANEL HANDLERS ---
  const handleAdminDeletePublication = async (pubId: string) => {
    setPublications(prev => prev.filter(p => p.id !== pubId));
    await api.deletePublication(pubId);
  };

  const handleAdminSavePublication = async (updatedPub: Publication) => {
    setPublications(prev => prev.map(p => p.id === updatedPub.id ? updatedPub : p));
    await api.updatePublication(updatedPub);
  };

  const handleAdminCreatePublication = async (pubData: Omit<Publication, 'id' | 'createdAt'>) => {
    const newPub = await api.createPublication(pubData);
    setPublications(prev => [newPub, ...prev]);
  };

  const handleAdminDeleteUser = async (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    // Also remove their publications so the database stays clean
    setPublications(prev => prev.filter(p => p.userId !== userId));
    await api.deleteUser(userId);
  };

  const handleAdminSaveUser = async (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    
    // If the active simulated user was updated, keep currentUser in sync
    if (currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }

    await api.updateUserProfile(updatedUser);

    // Retroactively update name/avatar in publications
    setPublications(prev => prev.map(p => {
      if (p.userId === updatedUser.id) {
        return {
          ...p,
          authorName: updatedUser.name,
          authorAvatar: updatedUser.avatar,
          zone: updatedUser.zone
        };
      }
      return p;
    }));

    // Retroactively update in requests
    setRequests(prev => prev.map(r => {
      if (r.requesterId === updatedUser.id) {
        return {
          ...r,
          requesterName: updatedUser.name,
          requesterAvatar: updatedUser.avatar
        };
      }
      return r;
    }));
  };

  const handleAdminCreateUser = async (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: 'usr_admin_' + Date.now()
    };
    setUsers(prev => [...prev, newUser]);
    await api.updateUserProfile(newUser);
  };

  const handleAdminDeleteAnnouncement = async (annId: string) => {
    setAnnouncements(prev => prev.filter(ann => ann.id !== annId));
    await api.deleteAnnouncement(annId);
  };

  const handleAdminSaveAnnouncement = async (ann: Announcement) => {
    setAnnouncements(prev => prev.map(p => p.id === ann.id ? ann : p));
    await api.updateAnnouncement(ann);
  };

  const handleAdminCreateAnnouncement = async (annData: Omit<Announcement, 'id' | 'date'>) => {
    const newAnn = await api.createAnnouncement(annData);
    setAnnouncements(prev => [newAnn, ...prev]);
  };

  // Clear / Read notifications
  const handleClearNotifications = () => {
    setNotifications(prev => prev.map(n => n.userId === currentUser.id ? { ...n, read: true } : n));
  };

  // Clicking on a notification
  const handleSelectNotification = (requestId: string) => {
    // Mark specifically as read
    setNotifications(prev => prev.map(n => n.requestId === requestId && n.userId === currentUser.id ? { ...n, read: true } : n));
    
    // Navigate and set focus
    setSelectedRequestIdForChat(requestId);
    setActiveTab('requests');
  };

  // Reset Demo data
  const handleResetData = () => {
    if (window.confirm('¿Estás seguro de que querés restaurar los datos de ejemplo iniciales? Se borrarán tus publicaciones y chats actuales.')) {
      localStorage.clear();
      setUsers(mockUsers);
      setCurrentUser(mockUsers[5]);
      setPublications(mockPublications);
      setRequests(mockRequests);
      setMessages(mockMessages);
      setNotifications(mockNotifications);
      setThankYous(mockThankYous);
      setAnnouncements(mockAnnouncements);
      setActiveTab('feed');
      setSelectedRequestIdForChat(null);
    }
  };

  // Count unread notifications
  const unreadCount = notifications.filter(n => n.userId === currentUser.id && !n.read).length;

  const isUserAdmin = isAdminLoggedIn;

  return (
    <div id="morita-app-wrapper" className="min-h-screen bg-morita-beige flex flex-col justify-between selection:bg-morita-sand selection:text-morita-mulberry overflow-x-hidden w-full max-w-full">
      {/* PWA Install Banner */}
      <InstallPrompt />

      {/* 1. Header component */}
      <Header
        currentUser={currentUser}
        allUsers={users}
        notifications={notifications.filter(n => n.userId === currentUser.id)}
        activeTab={activeTab}
        isAdmin={isUserAdmin}
        isJunta={isJuntaLoggedIn}
        onNavigate={(tab) => {
          if (tab === 'admin' && !isAdminLoggedIn) {
            setIsAdminModalOpen(true);
          } else if (tab === 'junta' && !isJuntaLoggedIn) {
            setIsJuntaModalOpen(true);
          } else {
            setActiveTab(tab);
            if (tab === 'feed') setSelectedRequestIdForChat(null);
          }
        }}
        onSwitchUser={handleSwitchUser}
        onOpenProfile={setSelectedProfileUserId}
        onOpenPublish={() => setIsPublishOpen(true)}
        onClearNotifications={handleClearNotifications}
        onSelectNotification={handleSelectNotification}
        onRegisterNewUserClick={() => {
          setRegistrationMode('register');
          setUserToEdit(null);
          setIsEditProfileOpen(true);
        }}
        onEditProfileClick={() => {
          setRegistrationMode('edit');
          setUserToEdit(currentUser);
          setIsEditProfileOpen(true);
        }}
        onOpenAdminLogin={() => setIsAdminModalOpen(true)}
        onOpenJuntaLogin={() => setIsJuntaModalOpen(true)}
      />

      {/* 2. Main Content Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 md:pb-8 overflow-x-hidden min-w-0">
        
        {activeTab === 'feed' ? (
          <Feed
            publications={publications}
            currentUser={currentUser}
            allUsers={users}
            announcements={announcements}
            onOpenProfile={setSelectedProfileUserId}
            onRequestHelp={setActivePublicationForRequest}
            onToggleActive={handleTogglePublicationActive}
            onEditPublication={(pub) => {
              setPublicationToEdit(pub);
              setIsPublishOpen(true);
            }}
            onOpenPublish={() => setIsPublishOpen(true)}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            requests={requests}
            isAdmin={isAdminLoggedIn}
          />
        ) : activeTab === 'favorites' ? (
          <Feed
            publications={publications.filter(p => favorites.includes(p.id))}
            currentUser={currentUser}
            allUsers={users}
            announcements={announcements}
            onOpenProfile={setSelectedProfileUserId}
            onRequestHelp={setActivePublicationForRequest}
            onToggleActive={handleTogglePublicationActive}
            onEditPublication={(pub) => {
              setPublicationToEdit(pub);
              setIsPublishOpen(true);
            }}
            onOpenPublish={() => setIsPublishOpen(true)}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            isFavoritesTab={true}
            requests={requests}
            isAdmin={isAdminLoggedIn}
          />
        ) : activeTab === 'admin' ? (
          !isAdminLoggedIn ? (
            <AdminLoginGate
              onVerify={(username, passcode) => {
                const isValidUser = username.trim().toLowerCase() === 'admin';
                const isValidPass = passcode.trim() === ADMIN_PASSWORD;
                if (isValidUser && isValidPass) {
                  setIsAdminLoggedIn(true);
                  const adminUser = users.find(u => u.isAdmin) || users[0];
                  if (adminUser) setCurrentUser(adminUser);
                  return true;
                }
                return false;
              }}
              onCancel={() => setActiveTab('feed')}
            />
          ) : (
            <AdminPanel
              currentUser={currentUser}
              publications={publications}
              allUsers={users}
              announcements={announcements}
              onOpenProfile={setSelectedProfileUserId}
              onSwitchUser={handleSwitchUser}
              onAdminDeletePublication={handleAdminDeletePublication}
              onAdminSavePublication={handleAdminSavePublication}
              onAdminCreatePublication={handleAdminCreatePublication}
              onAdminDeleteUser={handleAdminDeleteUser}
              onAdminSaveUser={handleAdminSaveUser}
              onAdminCreateUser={handleAdminCreateUser}
              onAdminDeleteAnnouncement={handleAdminDeleteAnnouncement}
              onAdminSaveAnnouncement={handleAdminSaveAnnouncement}
              onAdminCreateAnnouncement={handleAdminCreateAnnouncement}
              onLogout={() => {
                setIsAdminLoggedIn(false);
                setCurrentUser(guestUser);
                setActiveTab('feed');
              }}
            />
          )
        ) : activeTab === 'junta' ? (
          !isJuntaLoggedIn ? (
            <AdminLoginGate
              title="Ingreso Junta Vecinal"
              description="Ingresá las credenciales de la Junta Vecinal para administrar la cartelera de comunicados de La Morita."
              buttonText="Ingresar a la Junta"
              icon={<Megaphone className="h-9 w-9 text-amber-700 animate-pulse" />}
              onVerify={(username, passcode) => {
                if (passcode.trim() === JUNTA_PASSWORD) {
                  setIsJuntaLoggedIn(true);
                  return true;
                }
                return false;
              }}
              onCancel={() => setActiveTab('feed')}
            />
          ) : (
            <AdminPanel
              currentUser={currentUser}
              publications={publications}
              allUsers={users}
              announcements={announcements}
              onOpenProfile={setSelectedProfileUserId}
              onSwitchUser={handleSwitchUser}
              onAdminDeletePublication={handleAdminDeletePublication}
              onAdminSavePublication={handleAdminSavePublication}
              onAdminCreatePublication={handleAdminCreatePublication}
              onAdminDeleteUser={handleAdminDeleteUser}
              onAdminSaveUser={handleAdminSaveUser}
              onAdminCreateUser={handleAdminCreateUser}
              onAdminDeleteAnnouncement={handleAdminDeleteAnnouncement}
              onAdminSaveAnnouncement={handleAdminSaveAnnouncement}
              onAdminCreateAnnouncement={handleAdminCreateAnnouncement}
              restrictToAnnouncements={true}
              onLogout={() => {
                setIsJuntaLoggedIn(false);
                setActiveTab('feed');
              }}
            />
          )
        ) : (
          <RequestsPanel
            requests={requests}
            messages={messages}
            publications={publications}
            currentUser={currentUser}
            allUsers={users}
            onSendMessage={handleSendMessage}
            onChangeRequestStatus={handleChangeRequestStatus}
            onAddThankYou={handleAddThankYou}
            selectedRequestId={selectedRequestIdForChat}
            setSelectedRequestId={setSelectedRequestIdForChat}
          />
        )}

      </main>

      {/* 3. Aesthetic Local Footer */}
      <footer id="app-footer" className="bg-white border-t border-morita-sand/50 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center space-x-2 text-morita-charcoal/70">
              <Leaf className="h-4 w-4 text-morita-leaf fill-current" />
              <span className="text-xs font-semibold font-display">La Morita • Red Vecinal Colaborativa</span>
            </div>

            {/* Quick stats / informative */}
            <div className="text-[11px] text-morita-charcoal/50 text-center md:text-right leading-snug">
              <span>Construido con amor para fortalecer la confianza de nuestro barrio.</span>
              <div className="mt-1 flex items-center justify-center md:justify-end gap-3.5">
                <button
                  onClick={() => {
                    setRegistrationMode('edit');
                    setIsEditProfileOpen(true);
                  }}
                  className="text-morita-mulberry font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <UserIcon className="h-3 w-3" />
                  <span>Editar mis datos</span>
                </button>
                <span>•</span>
                {isAdminLoggedIn && (
                  <>
                    <button
                      onClick={() => setActiveTab('admin')}
                      className="text-morita-terracotta font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <ShieldAlert className="h-3 w-3 text-morita-terracotta" />
                      <span>Panel Admin 🛡️</span>
                    </button>
                    <span>•</span>
                  </>
                )}
                <button
                  onClick={handleResetData}
                  className="text-morita-terracotta font-semibold hover:underline cursor-pointer"
                >
                  Restaurar datos de prueba 🔄
                </button>
              </div>
            </div>

          </div>
        </div>
      </footer>

      {/* -----------------------------------------
          3. OVERLAY MODALS & LIGHTBOXES
         ----------------------------------------- */}

      {/* A. Create/Edit Publication Modal */}
      <PublishModal
        isOpen={isPublishOpen}
        onClose={() => {
          setIsPublishOpen(false);
          setPublicationToEdit(null);
        }}
        currentUser={currentUser}
        publicationToEdit={publicationToEdit}
        onSubmit={handleCreatePublication}
      />

      {/* B. Create Request Modal */}
      <RequestModal
        isOpen={activePublicationForRequest !== null}
        publication={activePublicationForRequest}
        currentUser={currentUser}
        publisher={activePublicationForRequest ? users.find(u => u.id === activePublicationForRequest.userId) : null}
        onClose={() => setActivePublicationForRequest(null)}
        onSubmit={handleCreateRequest}
      />

      {/* C. Neighbor Profile Modal */}
      <UserProfileModal
        isOpen={selectedProfileUserId !== null}
        userId={selectedProfileUserId}
        allUsers={users}
        publications={publications}
        thankYous={thankYous}
        currentUser={currentUser}
        onClose={() => setSelectedProfileUserId(null)}
        onAddThankYou={handleAddThankYou}
        onRequestHelp={setActivePublicationForRequest}
        onOpenAdminPanel={() => setActiveTab('admin')}
        onEditProfile={(targetUser) => {
          setSelectedProfileUserId(null);
          setRegistrationMode('edit');
          setUserToEdit(targetUser);
          setIsEditProfileOpen(true);
        }}
      />

      {/* D. Edit Active Profile Modal */}
      <RegistrationModal
        isOpen={isEditProfileOpen}
        currentUser={currentUser}
        userToEdit={userToEdit || undefined}
        mode={registrationMode}
        onClose={() => {
          setIsEditProfileOpen(false);
          setUserToEdit(null);
        }}
        onSave={(updatedUser) => {
          handleSaveProfile(updatedUser);
          setUserToEdit(null);
        }}
      />

      {/* 4. Native-feeling Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-morita-sand/60 shadow-xl flex justify-around items-center h-16 pb-safe px-1 max-w-[100vw] overflow-x-hidden">
        <button
          onClick={() => {
            setActiveTab('feed');
            setSelectedRequestIdForChat(null);
          }}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all active:scale-90 cursor-pointer ${
            activeTab === 'feed' ? 'text-morita-mulberry font-bold' : 'text-morita-charcoal/50 hover:text-morita-mulberry'
          }`}
        >
          <Leaf className={`h-5 w-5 ${activeTab === 'feed' ? 'fill-current text-morita-mulberry scale-110' : ''} transition-transform`} />
          <span className="text-[10px] font-bold mt-0.5">Explorar</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('favorites');
            setSelectedRequestIdForChat(null);
          }}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all active:scale-90 cursor-pointer ${
            activeTab === 'favorites' ? 'text-morita-mulberry font-bold' : 'text-morita-charcoal/50 hover:text-morita-mulberry'
          }`}
        >
          <Heart className={`h-5 w-5 ${activeTab === 'favorites' ? 'fill-current text-morita-mulberry scale-110' : ''} transition-transform`} />
          <span className="text-[10px] font-bold mt-0.5">Favoritos</span>
        </button>

        {/* Floating Action Button for Publishing - Only for registered accounts */}
        {currentUser.id !== 'guest' && (
          <div className="relative -top-3 px-1 shrink-0">
            <button
              onClick={() => setIsPublishOpen(true)}
              className="flex items-center justify-center h-12 w-12 rounded-full bg-morita-mulberry text-white shadow-lg shadow-morita-mulberry/30 active:scale-90 transition-transform cursor-pointer ring-4 ring-white"
              title="Crear Publicación"
            >
              <Plus className="h-6 w-6 text-white stroke-[2.5]" />
            </button>
          </div>
        )}

        <button
          onClick={() => {
            setActiveTab('requests');
          }}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all active:scale-90 cursor-pointer relative ${
            activeTab === 'requests' ? 'text-morita-mulberry font-bold' : 'text-morita-charcoal/50 hover:text-morita-mulberry'
          }`}
        >
          <MessageCircle className={`h-5 w-5 ${activeTab === 'requests' ? 'fill-current text-morita-mulberry scale-110' : ''} transition-transform`} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-2 sm:right-4 h-4 w-4 bg-morita-terracotta text-white text-[9px] font-extrabold rounded-full flex items-center justify-center shadow-xs">
              {unreadCount}
            </span>
          )}
          <span className="text-[10px] font-bold mt-0.5">Mensajes</span>
        </button>

        <button
          onClick={() => {
            setSelectedProfileUserId(currentUser.id);
          }}
          className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center text-morita-charcoal/50 hover:text-morita-mulberry active:scale-90 transition-all cursor-pointer"
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="h-5 w-5 rounded-full object-cover border-2 border-morita-mulberry/60 shrink-0"
          />
          <span className="text-[10px] font-bold mt-0.5">Mi Perfil</span>
        </button>

        {/* Admin button: ONLY visible when logged in as Admin */}
        {isAdminLoggedIn && (
          <button
            onClick={() => {
              setActiveTab('admin');
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all active:scale-90 cursor-pointer ${
              activeTab === 'admin' ? 'text-purple-800 font-extrabold' : 'text-purple-900/70 hover:text-purple-900'
            }`}
            title="Panel Admin del barrio"
          >
            <ShieldAlert className="h-5 w-5 text-purple-700" />
            <span className="text-[10px] font-bold mt-0.5">Admin 🛡️</span>
          </button>
        )}

        {/* Junta button: ONLY visible when logged in as Junta */}
        {isJuntaLoggedIn && (
          <button
            onClick={() => {
              setActiveTab('junta');
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all active:scale-90 cursor-pointer ${
              activeTab === 'junta' ? 'text-amber-800 font-extrabold' : 'text-amber-900/70 hover:text-amber-900'
            }`}
            title="Cartelera de la Junta Vecinal"
          >
            <Megaphone className="h-5 w-5 text-amber-700" />
            <span className="text-[10px] font-bold mt-0.5">Junta 📣</span>
          </button>
        )}
      </div>

      {/* Admin Auth Modal Overlay */}
      {isAdminModalOpen && (
        <AdminLoginGate
          isModal={true}
          onVerify={(username, passcode) => {
            const isValidUser = username.trim().toLowerCase() === 'admin';
            const isValidPass = passcode.trim() === ADMIN_PASSWORD;
            if (isValidUser && isValidPass) {
              setIsAdminLoggedIn(true);
              const adminUser = users.find(u => u.isAdmin) || users[0];
              if (adminUser) setCurrentUser(adminUser);
              setActiveTab('admin');
              setIsAdminModalOpen(false);
              return true;
            }
            return false;
          }}
          onCancel={() => setIsAdminModalOpen(false)}
        />
      )}

      {/* Junta Auth Modal Overlay */}
      {isJuntaModalOpen && (
        <AdminLoginGate
          isModal={true}
          title="Ingreso Junta Vecinal"
          description="Ingresá las credenciales de la Junta Vecinal para administrar la cartelera de comunicados de La Morita."
          buttonText="Ingresar a la Junta"
          icon={<Megaphone className="h-9 w-9 text-amber-700 animate-pulse" />}
          onVerify={(username, passcode) => {
            if (passcode.trim() === JUNTA_PASSWORD) {
              setIsJuntaLoggedIn(true);
              setActiveTab('junta');
              setIsJuntaModalOpen(false);
              return true;
            }
            return false;
          }}
          onCancel={() => setIsJuntaModalOpen(false)}
        />
      )}

    </div>
  );
}
