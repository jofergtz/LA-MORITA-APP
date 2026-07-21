export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  zone: string;
  bio?: string;
  skills?: string[];
  isAdmin?: boolean;
}

export type PublicationType = 'vendo' | 'ofrezco' | 'necesito';

export type CategoryType = 
  | 'Productos' 
  | 'Servicios' 
  | 'Comida' 
  | 'Reparaciones' 
  | 'Clases/Tutorías' 
  | 'Ayuda vecinal' 
  | 'Otros';

export interface Publication {
  id: string;
  userId: string;
  authorName: string;
  authorAvatar: string;
  type: PublicationType;
  title: string;
  category: CategoryType;
  description: string;
  priceType: 'monto' | 'a-consultar' | 'intercambio';
  priceValue?: string; // e.g. "Bs. 150" or "Bs. 30 / hora"
  photo?: string;
  zone: string; // e.g. "Calle San Martín al 1200", "Esquina Belgrano"
  availability?: string; // e.g. "Lunes a Viernes de 16 a 20 hs"
  isActive?: boolean; // active status (stock, schedule, etc.)
  createdAt: string;
}

export type RequestStatus = 'pendiente' | 'aceptada' | 'rechazada' | 'completada';

export interface Request {
  id: string;
  publicationId: string;
  publicationTitle: string;
  publicationType: PublicationType;
  publisherId: string; // User who published
  requesterId: string; // User who sent request
  requesterName: string;
  requesterAvatar: string;
  comment: string;
  quantity?: number;
  proposedDateTime?: string; // e.g. "Sábado por la mañana"
  status: RequestStatus;
  createdAt: string;
}

export interface Message {
  id: string;
  requestId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'new_request' | 'status_change' | 'new_message';
  title: string;
  message: string;
  requestId: string;
  createdAt: string;
  read: boolean;
}

export interface ThankYou {
  id: string;
  targetUserId: string; // user receiving thank you
  authorId: string; // user giving thank you
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
  publicationTitle?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  important?: boolean;
}

