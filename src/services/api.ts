import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { User, Publication, Request, Message, Notification, ThankYou, Announcement } from '../types';
import { mockUsers, mockPublications, mockRequests, mockMessages, mockNotifications, mockThankYous, mockAnnouncements } from '../mockData';
import { safeStorage } from '../lib/storage';

// Storage keys for local persistence fallback
const STORAGE_KEYS = {
  USERS: 'morita_users',
  PUBLICATIONS: 'morita_publications',
  REQUESTS: 'morita_requests',
  MESSAGES: 'morita_messages',
  NOTIFICATIONS: 'morita_notifications',
  THANK_YOUS: 'morita_thankYous',
  FAVORITES: 'morita_favorites',
  ANNOUNCEMENTS: 'morita_announcements',
  DELETED_USERS: 'morita_deleted_users',
  DELETED_PUBS: 'morita_deleted_pubs',
  DELETED_ANNOUNCEMENTS: 'morita_deleted_announcements',
};

/**
 * Get list of deleted IDs from LocalStorage
 */
function getDeletedIds(key: string): string[] {
  return safeStorage.getItem<string[]>(key, []);
}

/**
 * Add a deleted ID to LocalStorage
 */
function addDeletedId(key: string, id: string): void {
  const ids = getDeletedIds(key);
  if (!ids.includes(id)) {
    safeStorage.setItem(key, [...ids, id]);
  }
}

/**
 * Get item from LocalStorage with mock fallback
 */
function getLocalData<T>(key: string, fallback: T): T {
  return safeStorage.getItem<T>(key, fallback);
}

/**
 * Set item in LocalStorage safely
 */
function setLocalData<T>(key: string, value: T): void {
  safeStorage.setItem(key, value);
}

/* ============================================================================
   SERVICE API INTERFACE
   ============================================================================ */

export const api = {
  // 1. USERS / PROFILES
  async getUsers(): Promise<User[]> {
    const deletedUserIds = getDeletedIds(STORAGE_KEYS.DELETED_USERS);
    const localUsers = getLocalData<User[]>(STORAGE_KEYS.USERS, mockUsers);

    let supabaseUsers: User[] = [];
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('profiles').select('*');
        if (!error && data) {
          supabaseUsers = data.map((u: any) => ({
            id: u.id,
            name: u.name || 'Vecino',
            email: u.email || '',
            phone: u.phone || '',
            avatar: u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
            zone: u.zone || 'Barrio La Morita',
            bio: u.bio || '',
            skills: Array.isArray(u.skills) ? u.skills : (typeof u.skills === 'string' ? JSON.parse(u.skills) : []),
            isAdmin: u.is_admin ?? u.isAdmin ?? false
          }));
        }
      } catch (err) {
        console.warn('Supabase getUsers catch:', err);
      }
    }

    const userMap = new Map<string, User>();
    // Add mock users unless deleted locally
    mockUsers.forEach(u => {
      if (!deletedUserIds.includes(u.id)) userMap.set(u.id, u);
    });
    // Add local users unless deleted locally
    localUsers.forEach(u => {
      if (!deletedUserIds.includes(u.id)) userMap.set(u.id, u);
    });
    // ALWAYS override and add Supabase live cloud users (never filtered by local deleted list)
    supabaseUsers.forEach(u => userMap.set(u.id, u));

    return Array.from(userMap.values());
  },

  async updateUserProfile(updatedUser: User): Promise<User> {
    if (isSupabaseConfigured() && supabase) {
      // Ensure avatar is not a giant uncompressed camera string that breaks PostgREST
      let safeAvatar = updatedUser.avatar;
      if (safeAvatar && safeAvatar.startsWith('data:image/') && safeAvatar.length > 150000) {
        console.warn('Avatar string exceeds safe size, truncating for Supabase sync');
        safeAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          avatar: safeAvatar,
          zone: updatedUser.zone,
          bio: updatedUser.bio,
          skills: updatedUser.skills,
          is_admin: updatedUser.isAdmin || false,
          updated_at: new Date().toISOString()
        });
      if (error) console.warn('Supabase updateUserProfile notice:', error.message || error);
    }
    const users = getLocalData<User[]>(STORAGE_KEYS.USERS, mockUsers);
    const index = users.findIndex(u => u.id === updatedUser.id);
    let newUsers = [...users];
    if (index >= 0) {
      newUsers[index] = updatedUser;
    } else {
      newUsers.push(updatedUser);
    }
    setLocalData(STORAGE_KEYS.USERS, newUsers);
    return updatedUser;
  },

  // 2. PUBLICATIONS
  async getPublications(): Promise<Publication[]> {
    const deletedPubIds = getDeletedIds(STORAGE_KEYS.DELETED_PUBS);
    const localPubs = getLocalData<Publication[]>(STORAGE_KEYS.PUBLICATIONS, mockPublications);

    let supabasePubs: Publication[] = [];
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('publications')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          supabasePubs = data.map((item: any) => ({
            id: item.id,
            userId: item.user_id || item.userId || '',
            authorName: item.author_name || item.authorName || 'Vecino de La Morita',
            authorAvatar: item.author_avatar || item.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
            type: item.type || 'ofrezco',
            title: item.title || '',
            category: item.category || 'Otros',
            description: item.description || '',
            priceType: item.price_type || item.priceType || 'fijo',
            priceValue: item.price_value || item.priceValue || '',
            photo: item.photo || '',
            zone: item.zone || 'Barrio La Morita',
            availability: item.availability || '',
            isActive: item.is_active ?? item.isActive ?? true,
            createdAt: item.created_at || item.createdAt || new Date().toISOString()
          }));
        }
      } catch (err) {
        console.warn('Supabase getPublications catch:', err);
      }
    }

    const pubMap = new Map<string, Publication>();
    // Add mock publications unless deleted locally
    mockPublications.forEach(p => {
      if (!deletedPubIds.includes(p.id)) pubMap.set(p.id, p);
    });
    // Add local publications unless deleted locally
    localPubs.forEach(p => {
      if (!deletedPubIds.includes(p.id)) pubMap.set(p.id, p);
    });
    // ALWAYS override and add Supabase live cloud publications (never filtered by local deleted list)
    supabasePubs.forEach(p => pubMap.set(p.id, p));

    return Array.from(pubMap.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async createPublication(pub: Omit<Publication, 'id' | 'createdAt'>): Promise<Publication> {
    const newPub: Publication = {
      ...pub,
      id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    if (isSupabaseConfigured() && supabase) {
      let safeAuthorAvatar = newPub.authorAvatar;
      if (safeAuthorAvatar && safeAuthorAvatar.startsWith('data:image/') && safeAuthorAvatar.length > 150000) {
        safeAuthorAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
      }

      let safePhoto = newPub.photo;
      if (safePhoto && safePhoto.startsWith('data:image/') && safePhoto.length > 250000) {
        safePhoto = '';
      }

      const { error } = await supabase.from('publications').insert({
        id: newPub.id,
        user_id: newPub.userId,
        author_name: newPub.authorName,
        author_avatar: safeAuthorAvatar,
        type: newPub.type,
        title: newPub.title,
        category: newPub.category,
        description: newPub.description,
        price_type: newPub.priceType,
        price_value: newPub.priceValue,
        photo: safePhoto,
        zone: newPub.zone,
        availability: newPub.availability,
        is_active: newPub.isActive,
        created_at: newPub.createdAt
      });
      if (error) console.warn('Supabase createPublication notice:', error.message || error);
    }

    const current = getLocalData<Publication[]>(STORAGE_KEYS.PUBLICATIONS, mockPublications);
    const updated = [newPub, ...current];
    setLocalData(STORAGE_KEYS.PUBLICATIONS, updated);
    return newPub;
  },

  async updatePublication(pub: Publication): Promise<Publication> {
    if (isSupabaseConfigured() && supabase) {
      let safeAuthorAvatar = pub.authorAvatar;
      if (safeAuthorAvatar && safeAuthorAvatar.startsWith('data:image/') && safeAuthorAvatar.length > 150000) {
        safeAuthorAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
      }

      let safePhoto = pub.photo;
      if (safePhoto && safePhoto.startsWith('data:image/') && safePhoto.length > 250000) {
        safePhoto = '';
      }

      const { error } = await supabase.from('publications').upsert({
        id: pub.id,
        user_id: pub.userId,
        author_name: pub.authorName,
        author_avatar: safeAuthorAvatar,
        type: pub.type,
        title: pub.title,
        category: pub.category,
        description: pub.description,
        price_type: pub.priceType,
        price_value: pub.priceValue,
        photo: safePhoto,
        zone: pub.zone,
        availability: pub.availability,
        is_active: pub.isActive ?? true,
        created_at: pub.createdAt
      });
      if (error) console.warn('Supabase updatePublication notice:', error.message || error);
    }
    const current = getLocalData<Publication[]>(STORAGE_KEYS.PUBLICATIONS, mockPublications);
    const updated = current.map(p => p.id === pub.id ? pub : p);
    setLocalData(STORAGE_KEYS.PUBLICATIONS, updated);
    return pub;
  },

  async deletePublication(id: string, password?: string): Promise<boolean> {
    addDeletedId(STORAGE_KEYS.DELETED_PUBS, id);

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.functions.invoke('admin-action', {
          body: { action: 'deletePublication', payload: { id }, password }
        });
        if (error || (data && !data.success)) {
          console.warn('Supabase Edge Function deletePublication warning:', error || data?.error);
        }
      } catch (err) {
        console.warn('Supabase Edge Function deletePublication catch:', err);
      }
    }
    const current = getLocalData<Publication[]>(STORAGE_KEYS.PUBLICATIONS, mockPublications);
    const updated = current.filter(p => p.id !== id);
    setLocalData(STORAGE_KEYS.PUBLICATIONS, updated);
    return true;
  },

  async deleteUser(id: string, password?: string): Promise<boolean> {
    addDeletedId(STORAGE_KEYS.DELETED_USERS, id);

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.functions.invoke('admin-action', {
          body: { action: 'deleteUser', payload: { id }, password }
        });
        if (error || (data && !data.success)) {
          console.warn('Supabase Edge Function deleteUser warning:', error || data?.error);
        }
      } catch (err) {
        console.warn('Supabase Edge Function deleteUser catch:', err);
      }
    }
    const current = getLocalData<User[]>(STORAGE_KEYS.USERS, mockUsers);
    const updated = current.filter(u => u.id !== id);
    setLocalData(STORAGE_KEYS.USERS, updated);
    return true;
  },

  // 3. REQUESTS
  async getRequests(): Promise<Request[]> {
    const localReqs = getLocalData<Request[]>(STORAGE_KEYS.REQUESTS, mockRequests);
    let supabaseReqs: Request[] = [];

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('requests').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          supabaseReqs = data.map(r => ({
            id: r.id,
            publicationId: r.publication_id,
            publicationTitle: r.publication_title,
            publicationType: r.publication_type,
            publisherId: r.publisher_id,
            requesterId: r.requester_id,
            requesterName: r.requester_name,
            requesterAvatar: r.requester_avatar,
            comment: r.comment,
            quantity: r.quantity,
            proposedDateTime: r.proposed_date_time,
            status: r.status,
            createdAt: r.created_at
          }));
        }
      } catch (err) {
        console.warn('Supabase getRequests catch:', err);
      }
    }

    const reqMap = new Map<string, Request>();
    mockRequests.forEach(r => reqMap.set(r.id, r));
    localReqs.forEach(r => reqMap.set(r.id, r));
    supabaseReqs.forEach(r => reqMap.set(r.id, r));

    return Array.from(reqMap.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async createRequest(req: Omit<Request, 'id' | 'createdAt'>): Promise<Request> {
    const newReq: Request = {
      ...req,
      id: `r_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString()
    };

    if (isSupabaseConfigured() && supabase) {
      await supabase.from('requests').insert({
        id: newReq.id,
        publication_id: newReq.publicationId,
        publication_title: newReq.publicationTitle,
        publication_type: newReq.publicationType,
        publisher_id: newReq.publisherId,
        requester_id: newReq.requesterId,
        requester_name: newReq.requesterName,
        requester_avatar: newReq.requesterAvatar,
        comment: newReq.comment,
        quantity: newReq.quantity,
        proposed_date_time: newReq.proposedDateTime,
        status: newReq.status,
        created_at: newReq.createdAt
      });
    }

    const current = getLocalData<Request[]>(STORAGE_KEYS.REQUESTS, mockRequests);
    const updated = [newReq, ...current];
    setLocalData(STORAGE_KEYS.REQUESTS, updated);
    return newReq;
  },

  async updateRequestStatus(id: string, status: Request['status']): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('requests').update({ status }).eq('id', id);
    }
    const current = getLocalData<Request[]>(STORAGE_KEYS.REQUESTS, mockRequests);
    const updated = current.map(r => r.id === id ? { ...r, status } : r);
    setLocalData(STORAGE_KEYS.REQUESTS, updated);
  },

  // 4. MESSAGES
  async getMessages(): Promise<Message[]> {
    const localMsgs = getLocalData<Message[]>(STORAGE_KEYS.MESSAGES, mockMessages);
    let supabaseMsgs: Message[] = [];

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
        if (!error && data) {
          supabaseMsgs = data.map(m => ({
            id: m.id,
            requestId: m.request_id,
            senderId: m.sender_id,
            text: m.text,
            createdAt: m.created_at
          }));
        }
      } catch (err) {
        console.warn('Supabase getMessages catch:', err);
      }
    }

    const msgMap = new Map<string, Message>();
    mockMessages.forEach(m => msgMap.set(m.id, m));
    localMsgs.forEach(m => msgMap.set(m.id, m));
    supabaseMsgs.forEach(m => msgMap.set(m.id, m));

    return Array.from(msgMap.values()).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  async sendMessage(msg: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
    const newMsg: Message = {
      ...msg,
      id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString()
    };

    if (isSupabaseConfigured() && supabase) {
      await supabase.from('messages').insert({
        id: newMsg.id,
        request_id: newMsg.requestId,
        sender_id: newMsg.senderId,
        text: newMsg.text,
        created_at: newMsg.createdAt
      });
    }

    const current = getLocalData<Message[]>(STORAGE_KEYS.MESSAGES, mockMessages);
    const updated = [...current, newMsg];
    setLocalData(STORAGE_KEYS.MESSAGES, updated);
    return newMsg;
  },

  // 5. NOTIFICATIONS
  async getNotifications(): Promise<Notification[]> {
    const localNotifs = getLocalData<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, mockNotifications);
    let supabaseNotifs: Notification[] = [];

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          supabaseNotifs = data.map(n => ({
            id: n.id,
            userId: n.user_id,
            type: n.type,
            title: n.title,
            message: n.message,
            requestId: n.request_id,
            createdAt: n.created_at,
            read: n.read
          }));
        }
      } catch (err) {
        console.warn('Supabase getNotifications catch:', err);
      }
    }

    const notifMap = new Map<string, Notification>();
    mockNotifications.forEach(n => notifMap.set(n.id, n));
    localNotifs.forEach(n => notifMap.set(n.id, n));
    supabaseNotifs.forEach(n => notifMap.set(n.id, n));

    return Array.from(notifMap.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async createNotification(notif: Notification): Promise<Notification> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('notifications').insert({
        id: notif.id,
        user_id: notif.userId,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        request_id: notif.requestId,
        read: notif.read ?? false,
        created_at: notif.createdAt
      });
    }
    const current = getLocalData<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, mockNotifications);
    const updated = [notif, ...current];
    setLocalData(STORAGE_KEYS.NOTIFICATIONS, updated);
    return notif;
  },

  // 6. ANNOUNCEMENTS
  async getAnnouncements(): Promise<Announcement[]> {
    const deletedAnnIds = getDeletedIds(STORAGE_KEYS.DELETED_ANNOUNCEMENTS);
    const localAnns = getLocalData<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, mockAnnouncements);

    let supabaseAnns: Announcement[] = [];
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('announcements').select('*').order('date', { ascending: false });
        if (!error && data) {
          supabaseAnns = data.map((a: any) => ({
            id: a.id,
            title: a.title,
            content: a.content,
            date: a.date,
            important: a.important
          }));
        }
      } catch (err) {
        console.warn('Supabase getAnnouncements catch:', err);
      }
    }

    const annMap = new Map<string, Announcement>();
    mockAnnouncements.forEach(a => {
      if (!deletedAnnIds.includes(a.id)) annMap.set(a.id, a);
    });
    localAnns.forEach(a => {
      if (!deletedAnnIds.includes(a.id)) annMap.set(a.id, a);
    });
    supabaseAnns.forEach(a => annMap.set(a.id, a));

    return Array.from(annMap.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async createAnnouncement(ann: Omit<Announcement, 'id' | 'date'>, password?: string): Promise<Announcement> {
    const newAnn: Announcement = {
      ...ann,
      id: `ann_${Date.now()}`,
      date: new Date().toISOString()
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.functions.invoke('admin-action', {
          body: {
            action: 'createAnnouncement',
            payload: {
              id: newAnn.id,
              title: newAnn.title,
              content: newAnn.content,
              date: newAnn.date,
              important: newAnn.important ?? false
            },
            password
          }
        });
        if (error || (data && !data.success)) {
          console.warn('Supabase Edge Function createAnnouncement warning:', error || data?.error);
        }
      } catch (err) {
        console.warn('Supabase Edge Function createAnnouncement catch:', err);
      }
    }

    const current = getLocalData<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, mockAnnouncements);
    const updated = [newAnn, ...current];
    setLocalData(STORAGE_KEYS.ANNOUNCEMENTS, updated);
    return newAnn;
  },

  async updateAnnouncement(ann: Announcement, password?: string): Promise<Announcement> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.functions.invoke('admin-action', {
          body: {
            action: 'updateAnnouncement',
            payload: {
              id: ann.id,
              title: ann.title,
              content: ann.content,
              date: ann.date,
              important: ann.important ?? false
            },
            password
          }
        });
        if (error || (data && !data.success)) {
          console.warn('Supabase Edge Function updateAnnouncement warning:', error || data?.error);
        }
      } catch (err) {
        console.warn('Supabase Edge Function updateAnnouncement catch:', err);
      }
    }
    const current = getLocalData<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, mockAnnouncements);
    const updated = current.map(a => a.id === ann.id ? ann : a);
    setLocalData(STORAGE_KEYS.ANNOUNCEMENTS, updated);
    return ann;
  },

  async deleteAnnouncement(id: string, password?: string): Promise<boolean> {
    addDeletedId(STORAGE_KEYS.DELETED_ANNOUNCEMENTS, id);

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.functions.invoke('admin-action', {
          body: { action: 'deleteAnnouncement', payload: { id }, password }
        });
        if (error || (data && !data.success)) {
          console.warn('Supabase Edge Function deleteAnnouncement warning:', error || data?.error);
        }
      } catch (err) {
        console.warn('Supabase Edge Function deleteAnnouncement catch:', err);
      }
    }
    const current = getLocalData<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, mockAnnouncements);
    const updated = current.filter(a => a.id !== id);
    setLocalData(STORAGE_KEYS.ANNOUNCEMENTS, updated);
    return true;
  }
};
