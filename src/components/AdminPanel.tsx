import React, { useState, useMemo } from 'react';
import { User, Publication, PublicationType, CategoryType, Announcement } from '../types';
import { 
  ShieldAlert, 
  Trash2, 
  Edit, 
  Plus, 
  Search, 
  Users, 
  Check, 
  MapPin, 
  Sparkles, 
  X, 
  Save, 
  AlertTriangle, 
  CheckCircle, 
  Smartphone, 
  Mail, 
  FileText, 
  Tag, 
  UserPlus, 
  Map, 
  ChevronRight,
  Eye,
  EyeOff,
  Megaphone,
  Pin
} from 'lucide-react';

interface AdminPanelProps {
  currentUser: User;
  publications: Publication[];
  allUsers: User[];
  announcements: Announcement[];
  onOpenProfile: (userId: string) => void;
  onSwitchUser: (userId: string) => void;
  onAdminDeletePublication: (pubId: string) => void;
  onAdminSavePublication: (pub: Publication) => void;
  onAdminCreatePublication: (pub: Omit<Publication, 'id' | 'createdAt'>) => void;
  onAdminDeleteUser: (userId: string) => void;
  onAdminSaveUser: (user: User) => void;
  onAdminCreateUser: (user: Omit<User, 'id'>) => void;
  onAdminDeleteAnnouncement: (annId: string) => void;
  onAdminSaveAnnouncement: (ann: Announcement) => void;
  onAdminCreateAnnouncement: (ann: Omit<Announcement, 'id' | 'date'>) => void;
  onLogout?: () => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
];

const PHOTO_PRESETS = [
  { name: '🥟 Comida', url: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80' },
  { name: '🔧 Herramientas', url: 'https://images.unsplash.com/photo-1530124560072-a059b014b37d?w=600&auto=format&fit=crop&q=80' },
  { name: '🌱 Jardín/Plantas', url: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=600&auto=format&fit=crop&q=80' },
  { name: '📚 Clases/Libros', url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80' },
  { name: '🐶 Mascotas', url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=80' },
  { name: '🏠 Hogar', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80' }
];

export default function AdminPanel({
  currentUser,
  publications,
  allUsers,
  announcements,
  onOpenProfile,
  onSwitchUser,
  onAdminDeletePublication,
  onAdminSavePublication,
  onAdminCreatePublication,
  onAdminDeleteUser,
  onAdminSaveUser,
  onAdminCreateUser,
  onAdminDeleteAnnouncement,
  onAdminSaveAnnouncement,
  onAdminCreateAnnouncement,
  onLogout
}: AdminPanelProps) {
  // Navigation tabs inside admin
  const [adminTab, setAdminTab] = useState<'pubs' | 'users' | 'announcements'>('pubs');
  
  // Search query states
  const [pubSearch, setPubSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [annSearch, setAnnSearch] = useState('');
  
  // Filtering states
  const [filterType, setFilterType] = useState<PublicationType | 'all'>('all');

  // Creation / editing states
  const [editingPub, setEditingPub] = useState<Publication | null>(null);
  const [creatingPub, setCreatingPub] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [creatingUser, setCreatingUser] = useState<boolean>(false);
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const [creatingAnn, setCreatingAnn] = useState<boolean>(false);

  // Status message state
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Helper for displaying notifications
  const showFeedback = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => {
      setStatusMsg(null);
    }, 4000);
  };

  // Form states - Publications
  const [pubFormAuthorId, setPubFormAuthorId] = useState<string>(currentUser.id);
  const [pubFormType, setPubFormType] = useState<PublicationType>('vendo');
  const [pubFormTitle, setPubFormTitle] = useState('');
  const [pubFormCategory, setPubFormCategory] = useState<CategoryType>('Productos');
  const [pubFormDescription, setPubFormDescription] = useState('');
  const [pubFormPriceType, setPubFormPriceType] = useState<'monto' | 'a-consultar' | 'intercambio'>('monto');
  const [pubFormPriceValue, setPubFormPriceValue] = useState('');
  const [pubFormPhoto, setPubFormPhoto] = useState('');
  const [pubFormZone, setPubFormZone] = useState('');
  const [pubFormAvailability, setPubFormAvailability] = useState('');
  const [pubFormIsActive, setPubFormIsActive] = useState(true);

  // Form states - Users
  const [userFormName, setUserFormName] = useState('');
  const [userFormPhone, setUserFormPhone] = useState('');
  const [userFormEmail, setUserFormEmail] = useState('');
  const [userFormZone, setUserFormZone] = useState('');
  const [userFormBio, setUserFormBio] = useState('');
  const [userFormAvatar, setUserFormAvatar] = useState(AVATAR_PRESETS[0]);
  const [userFormIsAdmin, setUserFormIsAdmin] = useState(false);

  // Form states - Announcements
  const [annFormTitle, setAnnFormTitle] = useState('');
  const [annFormContent, setAnnFormContent] = useState('');
  const [annFormImportant, setAnnFormImportant] = useState(false);

  // Load publication into edit state
  const handleStartEditPub = (pub: Publication) => {
    setEditingPub(pub);
    setCreatingPub(false);
    setPubFormAuthorId(pub.userId);
    setPubFormType(pub.type);
    setPubFormTitle(pub.title);
    setPubFormCategory(pub.category);
    setPubFormDescription(pub.description);
    setPubFormPriceType(pub.priceType);
    setPubFormPriceValue(pub.priceValue || '');
    setPubFormPhoto(pub.photo || '');
    setPubFormZone(pub.zone || '');
    setPubFormAvailability(pub.availability || '');
    setPubFormIsActive(pub.isActive !== false);
    // Scroll smoothly to form
    const container = document.getElementById('admin-form-anchor');
    if (container) container.scrollIntoView({ behavior: 'smooth' });
  };

  // Open empty publication creation form
  const handleStartCreatePub = () => {
    setCreatingPub(true);
    setEditingPub(null);
    setPubFormAuthorId(currentUser.id);
    setPubFormType('vendo');
    setPubFormTitle('');
    setPubFormCategory('Productos');
    setPubFormDescription('');
    setPubFormPriceType('monto');
    setPubFormPriceValue('');
    setPubFormPhoto(PHOTO_PRESETS[0].url);
    setPubFormZone(currentUser.zone || 'Calle Las Acacias al 100');
    setPubFormAvailability('Lunes a Viernes de 16:00 a 20:00 hs');
    setPubFormIsActive(true);
    
    const container = document.getElementById('admin-form-anchor');
    if (container) container.scrollIntoView({ behavior: 'smooth' });
  };

  // Load user profile into edit state
  const handleStartEditUser = (usr: User) => {
    setEditingUser(usr);
    setCreatingUser(false);
    setUserFormName(usr.name);
    setUserFormPhone(usr.phone);
    setUserFormEmail(usr.email || '');
    setUserFormZone(usr.zone || '');
    setUserFormBio(usr.bio || '');
    setUserFormAvatar(usr.avatar);
    setUserFormIsAdmin(usr.isAdmin || false);
    
    const container = document.getElementById('admin-form-anchor');
    if (container) container.scrollIntoView({ behavior: 'smooth' });
  };

  // Open empty user profile creation form
  const handleStartCreateUser = () => {
    setCreatingUser(true);
    setEditingUser(null);
    setUserFormName('');
    setUserFormPhone('');
    setUserFormEmail('');
    setUserFormZone('La Morita, Santa Cruz');
    setUserFormBio('');
    setUserFormAvatar(AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)]);
    setUserFormIsAdmin(false);
    
    const container = document.getElementById('admin-form-anchor');
    if (container) container.scrollIntoView({ behavior: 'smooth' });
  };

  // Save/Create publication submit
  const handlePubFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubFormTitle.trim()) {
      showFeedback('El título es requerido', 'error');
      return;
    }

    const authorUser = allUsers.find(u => u.id === pubFormAuthorId);
    if (!authorUser) {
      showFeedback('Usuario de autor no válido', 'error');
      return;
    }

    const dataPayload = {
      userId: pubFormAuthorId,
      authorName: authorUser.name,
      authorAvatar: authorUser.avatar,
      type: pubFormType,
      title: pubFormTitle.trim(),
      category: pubFormCategory,
      description: pubFormDescription.trim(),
      priceType: pubFormPriceType,
      priceValue: pubFormPriceType === 'monto' ? pubFormPriceValue.trim() : undefined,
      photo: pubFormPhoto.trim() || undefined,
      zone: pubFormZone.trim(),
      availability: pubFormAvailability.trim() || undefined,
      isActive: pubFormIsActive
    };

    if (editingPub) {
      const updatedPub: Publication = {
        ...editingPub,
        ...dataPayload
      };
      onAdminSavePublication(updatedPub);
      showFeedback(`Publicación "${pubFormTitle}" actualizada correctamente.`);
      setEditingPub(null);
    } else {
      onAdminCreatePublication(dataPayload);
      showFeedback(`Publicación "${pubFormTitle}" creada correctamente en nombre de ${authorUser.name}.`);
      setCreatingPub(false);
    }
  };

  // Save/Create User profile submit
  const handleUserFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormName.trim()) {
      showFeedback('El nombre es requerido', 'error');
      return;
    }
    if (!userFormPhone.trim()) {
      showFeedback('El teléfono de contacto es requerido', 'error');
      return;
    }

    const userPayload = {
      name: userFormName.trim(),
      phone: userFormPhone.trim(),
      email: userFormEmail.trim() || undefined,
      zone: userFormZone.trim() || 'La Morita, Santa Cruz',
      bio: userFormBio.trim() || undefined,
      avatar: userFormAvatar,
      isAdmin: userFormIsAdmin
    };

    if (editingUser) {
      const updatedUser: User = {
        ...editingUser,
        ...userPayload
      };
      onAdminSaveUser(updatedUser);
      showFeedback(`Perfil de "${userFormName}" actualizado correctamente.`);
      setEditingUser(null);
    } else {
      onAdminCreateUser(userPayload);
      showFeedback(`Nuevo vecino "${userFormName}" registrado con éxito.`);
      setCreatingUser(false);
    }
  };

  // Load announcement into edit state
  const handleStartEditAnn = (ann: Announcement) => {
    setEditingAnn(ann);
    setCreatingAnn(false);
    setAnnFormTitle(ann.title);
    setAnnFormContent(ann.content);
    setAnnFormImportant(ann.important || false);

    // Scroll smoothly to form
    const anchor = document.getElementById('admin-form-anchor');
    if (anchor) anchor.scrollIntoView({ behavior: 'smooth' });
  };

  // Open empty announcement creation form
  const handleStartCreateAnn = () => {
    setCreatingAnn(true);
    setEditingAnn(null);
    setAnnFormTitle('');
    setAnnFormContent('');
    setAnnFormImportant(false);

    const anchor = document.getElementById('admin-form-anchor');
    if (anchor) anchor.scrollIntoView({ behavior: 'smooth' });
  };

  // Submit announcement form
  const handleAnnFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!annFormTitle.trim() || !annFormContent.trim()) {
      showFeedback('Por favor, completa el título y el contenido del comunicado.', 'error');
      return;
    }

    if (editingAnn) {
      onAdminSaveAnnouncement({
        ...editingAnn,
        title: annFormTitle,
        content: annFormContent,
        important: annFormImportant
      });
      showFeedback('¡Comunicado vecinal actualizado exitosamente!');
      setEditingAnn(null);
    } else {
      onAdminCreateAnnouncement({
        title: annFormTitle,
        content: annFormContent,
        important: annFormImportant
      });
      showFeedback('¡Nuevo comunicado vecinal publicado con éxito!');
      setCreatingAnn(false);
    }
  };

  // Safe delete Announcement
  const handleDeleteAnnClick = (annId: string, title: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el comunicado "${title}"?`)) {
      onAdminDeleteAnnouncement(annId);
      showFeedback(`Comunicado "${title}" eliminado.`);
      if (editingAnn?.id === annId) setEditingAnn(null);
    }
  };

  // Safe delete publication
  const handleDeletePubClick = (pubId: string, title: string) => {
    if (window.confirm(`¿Estás completamente seguro de que deseas eliminar permanentemente la publicación "${title}"? Esta acción es irreversible.`)) {
      onAdminDeletePublication(pubId);
      showFeedback(`Publicación "${title}" eliminada.`);
      if (editingPub?.id === pubId) setEditingPub(null);
    }
  };

  // Safe delete User
  const handleDeleteUserClick = (userId: string, name: string) => {
    if (userId === currentUser.id) {
      alert('No podés eliminar al usuario con el que estás simulando actualmente. Cambiá de identidad de simulación arriba a la derecha y volvé a intentarlo.');
      return;
    }
    if (window.confirm(`⚠️ ADVERTENCIA CRÍTICA: ¿Estás seguro de eliminar permanentemente al vecino "${name}"?\nSe borrarán todas sus publicaciones e información del barrio. Esta acción no se puede deshacer.`)) {
      onAdminDeleteUser(userId);
      showFeedback(`Vecino "${name}" eliminado de la base de datos.`);
      if (editingUser?.id === userId) setEditingUser(null);
    }
  };

  // Match and filter Publications
  const filteredPubs = useMemo(() => {
    return publications.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(pubSearch.toLowerCase()) || 
                            p.authorName.toLowerCase().includes(pubSearch.toLowerCase()) ||
                            (p.description && p.description.toLowerCase().includes(pubSearch.toLowerCase()));
      const matchesType = filterType === 'all' || p.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [publications, pubSearch, filterType]);

  // Match and filter Users
  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => {
      return u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
             (u.zone && u.zone.toLowerCase().includes(userSearch.toLowerCase())) ||
             (u.phone && u.phone.toLowerCase().includes(userSearch.toLowerCase()));
    });
  }, [allUsers, userSearch]);

  // Match and filter Announcements
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(ann => {
      return ann.title.toLowerCase().includes(annSearch.toLowerCase()) || 
             ann.content.toLowerCase().includes(annSearch.toLowerCase());
    });
  }, [announcements, annSearch]);

  return (
    <div className="bg-white border border-morita-sand rounded-3xl p-6 shadow-xs max-w-7xl mx-auto">
      
      {/* 1. Admin Shield Header banner */}
      <div className="bg-gradient-to-r from-morita-charcoal to-morita-charcoal/85 text-white p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-3.5">
          <div className="bg-morita-terracotta text-white p-3 rounded-full shadow-inner animate-pulse">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold tracking-tight">
              Panel Administrativo de Moderación
            </h2>
            <p className="text-xs text-white/70 mt-1 max-w-2xl">
              Aquí podés gestionar, crear, editar o eliminar los perfiles de los vecinos y todas las publicaciones de la comunidad de **La Morita**. Úsalo con cuidado.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 text-center shrink-0 w-full sm:w-auto">
            <span className="block text-[9px] font-bold uppercase text-white/50 tracking-wider">Identidad Activa</span>
            <span className="block text-xs font-bold text-morita-sand">{currentUser.name} (Admin)</span>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full sm:w-auto bg-morita-terracotta hover:bg-morita-terracotta/95 text-white font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              Salir de Admin 🛡️
            </button>
          )}
        </div>
      </div>

      {/* Action feedbacks alert */}
      {statusMsg && (
        <div className={`mb-6 p-4 rounded-xl flex items-center space-x-2 text-xs font-semibold animate-fade-in ${
          statusMsg.type === 'success' ? 'bg-morita-leaf/10 text-morita-leaf border border-morita-leaf/20' :
          statusMsg.type === 'error' ? 'bg-morita-terracotta/10 text-morita-terracotta border border-morita-terracotta/20' :
          'bg-morita-sand/20 text-morita-charcoal/80 border border-morita-sand'
        }`}>
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Anchor point to snap to forms */}
      <div id="admin-form-anchor" />

      {/* 2. INLINE CREATE / EDITING FORM SECTION */}
      {(editingPub || creatingPub) && (
        <div className="mb-8 p-6 bg-morita-sand/15 border border-morita-sand/50 rounded-2xl animate-fade-in shadow-2xs">
          <div className="flex items-center justify-between border-b border-morita-sand pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <span className="p-1 bg-morita-mulberry/15 text-morita-mulberry rounded">
                <Tag className="h-4 w-4" />
              </span>
              <h3 className="font-display font-bold text-sm text-morita-charcoal">
                {editingPub ? `Editar Publicación: "${editingPub.title}"` : 'Crear Publicación Administrativa'}
              </h3>
            </div>
            <button 
              onClick={() => { setEditingPub(null); setCreatingPub(false); }}
              className="p-1 text-morita-charcoal/40 hover:text-morita-charcoal hover:bg-morita-sand rounded-full cursor-pointer transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handlePubFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Publication Author mapping */}
              <div>
                <label className="block text-[11px] font-bold text-morita-charcoal/70 uppercase mb-1">Autor / Vecino que Publica</label>
                <select
                  value={pubFormAuthorId}
                  onChange={(e) => setPubFormAuthorId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-morita-sand px-3 py-2 bg-white focus:outline-hidden focus:ring-1 focus:ring-morita-mulberry/40"
                >
                  {allUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.zone})</option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="block text-[11px] font-bold text-morita-charcoal/70 uppercase mb-1">Tipo de Publicación</label>
                <select
                  value={pubFormType}
                  onChange={(e) => {
                    const newType = e.target.value as PublicationType;
                    setPubFormType(newType);
                    // Sync category and price defaults as helper
                    if (newType === 'vendo') {
                      setPubFormCategory('Productos');
                      setPubFormPriceType('monto');
                    } else if (newType === 'ofrezco') {
                      setPubFormCategory('Servicios');
                      setPubFormPriceType('monto');
                    } else if (newType === 'necesito') {
                      setPubFormCategory('Ayuda vecinal');
                      setPubFormPriceType('intercambio');
                    }
                  }}
                  className="w-full text-xs rounded-lg border border-morita-sand px-3 py-2 bg-white focus:outline-hidden"
                >
                  <option value="vendo">🛒 Vendo (Producto)</option>
                  <option value="ofrezco">💼 Ofrezco (Servicio/Habilidad)</option>
                  <option value="necesito">🤝 Necesito (Pedido de ayuda/Buscar algo)</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-[11px] font-bold text-morita-charcoal/70 uppercase mb-1">Categoría</label>
                <select
                  value={pubFormCategory}
                  onChange={(e) => setPubFormCategory(e.target.value as CategoryType)}
                  className="w-full text-xs rounded-lg border border-morita-sand px-3 py-2 bg-white focus:outline-hidden"
                >
                  <option value="Productos">Productos</option>
                  <option value="Servicios">Servicios</option>
                  <option value="Comida">Comida</option>
                  <option value="Reparaciones">Reparaciones</option>
                  <option value="Clases/Tutorías">Clases/Tutorías</option>
                  <option value="Ayuda vecinal">Ayuda vecinal</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div>
                <label className="block text-[11px] font-bold text-morita-charcoal/70 uppercase mb-1">Título de la publicación</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Pintor profesional de casas"
                  value={pubFormTitle}
                  onChange={(e) => setPubFormTitle(e.target.value)}
                  className="w-full text-xs rounded-lg border border-morita-sand px-3 py-2 bg-white focus:outline-hidden"
                />
              </div>

              {/* Zone */}
              <div>
                <label className="block text-[11px] font-bold text-morita-charcoal/70 uppercase mb-1">Zona o Cuadra</label>
                <input
                  type="text"
                  placeholder="Ej: Calle Las Acacias al 100"
                  value={pubFormZone}
                  onChange={(e) => setPubFormZone(e.target.value)}
                  className="w-full text-xs rounded-lg border border-morita-sand px-3 py-2 bg-white focus:outline-hidden"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-bold text-morita-charcoal/70 uppercase mb-1">Descripción detallada</label>
              <textarea
                rows={3}
                placeholder="Explicá lo que ofrecés o buscás con claridad..."
                value={pubFormDescription}
                onChange={(e) => setPubFormDescription(e.target.value)}
                className="w-full text-xs rounded-lg border border-morita-sand px-3 py-2 bg-white focus:outline-hidden"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Price Type */}
              <div>
                <label className="block text-[11px] font-bold text-morita-charcoal/70 uppercase mb-1">Tipo de Precio</label>
                <select
                  value={pubFormPriceType}
                  onChange={(e) => setPubFormPriceType(e.target.value as any)}
                  className="w-full text-xs rounded-lg border border-morita-sand px-3 py-2 bg-white focus:outline-hidden"
                >
                  <option value="monto">Monto específico</option>
                  <option value="a-consultar">A consultar / convenir</option>
                  <option value="intercambio">Intercambio de favores</option>
                </select>
              </div>

              {/* Price Value */}
              <div>
                <label className="block text-[11px] font-bold text-morita-charcoal/70 uppercase mb-1">Monto en Bs. (si aplica)</label>
                <input
                  type="text"
                  disabled={pubFormPriceType !== 'monto'}
                  placeholder="Ej: 50 o 100 / hora"
                  value={pubFormPriceValue}
                  onChange={(e) => setPubFormPriceValue(e.target.value)}
                  className="w-full text-xs rounded-lg border border-morita-sand px-3 py-2 bg-white disabled:bg-morita-sand/20 disabled:text-morita-charcoal/40 focus:outline-hidden"
                />
              </div>

              {/* Availability */}
              <div>
                <label className="block text-[11px] font-bold text-morita-charcoal/70 uppercase mb-1">Disponibilidad / Horarios</label>
                <input
                  type="text"
                  placeholder="Ej: Sábados todo el día"
                  value={pubFormAvailability}
                  onChange={(e) => setPubFormAvailability(e.target.value)}
                  className="w-full text-xs rounded-lg border border-morita-sand px-3 py-2 bg-white focus:outline-hidden"
                />
              </div>
            </div>

            {/* Photo URL & presets */}
            <div>
              <label className="block text-[11px] font-bold text-morita-charcoal/70 uppercase mb-1">Foto (URL de imagen o preseteada)</label>
              <input
                type="text"
                placeholder="Pegá un enlace de imagen..."
                value={pubFormPhoto}
                onChange={(e) => setPubFormPhoto(e.target.value)}
                className="w-full text-xs rounded-lg border border-morita-sand px-3 py-2 bg-white focus:outline-hidden font-mono text-[10px]"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[9px] text-morita-charcoal/50 mr-1 flex items-center">Presets:</span>
                {PHOTO_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPubFormPhoto(p.url)}
                    className="px-2 py-1 text-[9px] font-bold rounded-md bg-white border border-morita-sand hover:border-morita-mulberry/50 hover:bg-morita-sand/10 transition-colors cursor-pointer"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle Visibility */}
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="pubFormIsActive"
                checked={pubFormIsActive}
                onChange={(e) => setPubFormIsActive(e.target.checked)}
                className="h-4 w-4 rounded-sm border-morita-sand text-morita-mulberry focus:ring-morita-mulberry/30 cursor-pointer"
              />
              <label htmlFor="pubFormIsActive" className="text-xs font-bold text-morita-charcoal cursor-pointer flex items-center gap-1">
                <span>Publicación visible y activa</span>
                <span className="text-[10px] text-morita-charcoal/50 font-normal">(Si la desactivás, no aparecerá en el feed general de los vecinos)</span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-2 pt-3 border-t border-morita-sand/50">
              <button
                type="button"
                onClick={() => { setEditingPub(null); setCreatingPub(false); }}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-morita-sand text-morita-charcoal/80 hover:bg-morita-sand/30 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-xl bg-morita-mulberry text-white hover:bg-morita-mulberry/90 transition-colors cursor-pointer flex items-center gap-1 shadow-3xs"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{editingPub ? 'Guardar Cambios' : 'Crear Publicación'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {(editingUser || creatingUser) && (
        <div className="mb-8 p-6 bg-morita-sand/15 border border-morita-sand/50 rounded-2xl animate-fade-in shadow-2xs">
          <div className="flex items-center justify-between border-b border-morita-sand pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <span className="p-1 bg-morita-terracotta/15 text-morita-terracotta rounded">
                <Users className="h-4 w-4" />
              </span>
              <h3 className="font-display font-bold text-sm text-morita-charcoal">
                {editingUser ? `Editar Perfil de Vecino: "${editingUser.name}"` : 'Registrar Nuevo Perfil de Vecino'}
              </h3>
            </div>
            <button 
              onClick={() => { setEditingUser(null); setCreatingUser(false); }}
              className="p-1 text-morita-charcoal/40 hover:text-morita-charcoal hover:bg-morita-sand rounded-full cursor-pointer transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleUserFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Name */}
              <div>
                <label className="block text-[11px] font-bold text-morita-charcoal/70 uppercase mb-1">Nombre y Apellido</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Marcelo Gómez"
                  value={userFormName}
                  onChange={(e) => setUserFormName(e.target.value)}
                  className="w-full text-xs rounded-lg border border-morita-sand px-3 py-2 bg-white focus:outline-hidden"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[11px] font-bold text-morita-charcoal/70 uppercase mb-1">Teléfono de Contacto (WhatsApp)</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: +54 9 348 455-6677"
                  value={userFormPhone}
                  onChange={(e) => setUserFormPhone(e.target.value)}
                  className="w-full text-xs rounded-lg border border-morita-sand px-3 py-2 bg-white focus:outline-hidden"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-bold text-morita-charcoal/70 uppercase mb-1">Correo Electrónico (Opcional)</label>
                <input
                  type="email"
                  placeholder="Ej: marcelogomez@mail.com"
                  value={userFormEmail}
                  onChange={(e) => setUserFormEmail(e.target.value)}
                  className="w-full text-xs rounded-lg border border-morita-sand px-3 py-2 bg-white focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Zone */}
              <div>
                <label className="block text-[11px] font-bold text-morita-charcoal/70 uppercase mb-1">Zona / Dirección exacta en La Morita</label>
                <input
                  type="text"
                  placeholder="Ej: Calle Las Acacias al 150"
                  value={userFormZone}
                  onChange={(e) => setUserFormZone(e.target.value)}
                  className="w-full text-xs rounded-lg border border-morita-sand px-3 py-2 bg-white focus:outline-hidden"
                />
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-[11px] font-bold text-morita-charcoal/70 uppercase mb-1">Imagen de Perfil (Avatar)</label>
                <div className="flex items-center space-x-3">
                  <img
                    src={userFormAvatar}
                    alt="Preview"
                    className="h-10 w-10 rounded-full object-cover border border-morita-sand shadow-3xs shrink-0"
                  />
                  <input
                    type="text"
                    value={userFormAvatar}
                    onChange={(e) => setUserFormAvatar(e.target.value)}
                    className="flex-1 text-[10px] font-mono rounded-lg border border-morita-sand px-3 py-1.5 bg-white focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Avatar Presets gallery */}
            <div className="p-3 bg-white border border-morita-sand/50 rounded-xl">
              <span className="block text-[10px] font-bold text-morita-charcoal/60 uppercase mb-2">Elegir un avatar ilustrativo:</span>
              <div className="flex flex-wrap gap-2">
                {AVATAR_PRESETS.map((presetUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setUserFormAvatar(presetUrl)}
                    className={`p-0.5 rounded-full border-2 transition-all cursor-pointer ${
                      userFormAvatar === presetUrl ? 'border-morita-mulberry scale-110 shadow-3xs' : 'border-transparent hover:scale-105'
                    }`}
                  >
                    <img src={presetUrl} alt="preset" className="h-8 w-8 rounded-full object-cover" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const randIndex = Math.floor(Math.random() * AVATAR_PRESETS.length);
                    setUserFormAvatar(AVATAR_PRESETS[randIndex]);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-morita-sand/30 hover:bg-morita-sand text-[10px] font-bold text-morita-charcoal cursor-pointer flex items-center gap-1 self-center"
                >
                  <Sparkles className="h-3 w-3 text-morita-terracotta" />
                  <span>Aleatorio</span>
                </button>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-[11px] font-bold text-morita-charcoal/70 uppercase mb-1">Breve Biografía o Presentación</label>
              <textarea
                rows={2}
                placeholder="Ej: Vecino de la manzana B, ofrezco reparaciones eléctricas y me gusta colaborar en las mingas del barrio."
                value={userFormBio}
                onChange={(e) => setUserFormBio(e.target.value)}
                className="w-full text-xs rounded-lg border border-morita-sand px-3 py-2 bg-white focus:outline-hidden"
              ></textarea>
            </div>

            {/* Admin Privileges Toggle */}
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold text-purple-950 flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-purple-700" />
                  <span>Privilegios de Administrador (Super Admin)</span>
                </span>
                <span className="block text-[10px] text-purple-800/80 mt-0.5">
                  Permite a este usuario gestionar el panel de control, moderar publicaciones y editar todos los perfiles.
                </span>
              </div>
              <input
                type="checkbox"
                id="userFormIsAdmin"
                checked={userFormIsAdmin}
                onChange={(e) => setUserFormIsAdmin(e.target.checked)}
                className="h-5 w-5 rounded border-purple-300 text-purple-700 focus:ring-purple-600 cursor-pointer"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-2 pt-3 border-t border-morita-sand/50">
              <button
                type="button"
                onClick={() => { setEditingUser(null); setCreatingUser(false); }}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-morita-sand text-morita-charcoal/80 hover:bg-morita-sand/30 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-xl bg-morita-terracotta text-white hover:bg-morita-terracotta/90 transition-colors cursor-pointer flex items-center gap-1 shadow-3xs"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{editingUser ? 'Guardar Cambios' : 'Registrar Vecino'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2.3 INLINE ANNOUNCEMENT CREATE / EDITING FORM SECTION */}
      {(editingAnn || creatingAnn) && (
        <div className="mb-8 p-6 bg-morita-sand/15 border border-morita-sand/50 rounded-2xl animate-fade-in shadow-2xs">
          <div className="flex items-center justify-between border-b border-morita-sand pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <span className="p-1 bg-morita-terracotta/15 text-morita-terracotta rounded">
                <Megaphone className="h-4 w-4 text-morita-terracotta" />
              </span>
              <h3 className="font-display font-bold text-sm text-morita-charcoal">
                {editingAnn ? `Editar Comunicado: "${editingAnn.title}"` : 'Publicar Nuevo Comunicado de la Junta'}
              </h3>
            </div>
            <button 
              onClick={() => { setEditingAnn(null); setCreatingAnn(false); }}
              className="p-1 text-morita-charcoal/40 hover:text-morita-charcoal hover:bg-morita-sand rounded-full cursor-pointer transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleAnnFormSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-morita-charcoal/70 uppercase mb-1">Título del Comunicado</label>
              <input
                type="text"
                required
                placeholder="Ej: 🍔🌭 ¡CONVOCATORIA PARA EMPRENDEDORES! 🍰🥤"
                value={annFormTitle}
                onChange={(e) => setAnnFormTitle(e.target.value)}
                className="w-full text-xs rounded-lg border border-morita-sand px-3 py-2 bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-morita-charcoal/70 uppercase mb-1">Contenido del Mensaje</label>
              <textarea
                rows={10}
                required
                placeholder="Escribe aquí el contenido completo del comunicado de WhatsApp del barrio..."
                value={annFormContent}
                onChange={(e) => setAnnFormContent(e.target.value)}
                className="w-full text-xs rounded-lg border border-morita-sand px-3 py-2 bg-white focus:outline-hidden font-sans"
              ></textarea>
            </div>

            <div className="flex items-center space-x-2.5 bg-white/50 p-3 rounded-xl border border-morita-sand/40 max-w-sm">
              <input
                type="checkbox"
                id="annFormImportant"
                checked={annFormImportant}
                onChange={(e) => setAnnFormImportant(e.target.checked)}
                className="h-4 w-4 text-morita-terracotta focus:ring-morita-terracotta border-morita-sand rounded cursor-pointer"
              />
              <label htmlFor="annFormImportant" className="text-xs font-bold text-morita-charcoal cursor-pointer select-none">
                📍 Fijar este comunicado arriba en la cartelera
              </label>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-morita-sand/50">
              <button
                type="button"
                onClick={() => { setEditingAnn(null); setCreatingAnn(false); }}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-morita-sand text-morita-charcoal/80 hover:bg-morita-sand/30 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-xl bg-morita-terracotta text-white hover:bg-morita-terracotta/90 transition-colors cursor-pointer flex items-center gap-1 shadow-3xs"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{editingAnn ? 'Guardar Cambios' : 'Publicar Comunicado'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. TABS SELECTOR */}
      <div className="flex border-b border-morita-sand mb-6">
        <button
          onClick={() => setAdminTab('pubs')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            adminTab === 'pubs'
              ? 'border-morita-mulberry text-morita-mulberry'
              : 'border-transparent text-morita-charcoal/50 hover:text-morita-charcoal'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>📢 Publicaciones ({publications.length})</span>
        </button>
        <button
          onClick={() => setAdminTab('users')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            adminTab === 'users'
              ? 'border-morita-terracotta text-morita-terracotta'
              : 'border-transparent text-morita-charcoal/50 hover:text-morita-charcoal'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>👥 Vecinos y Perfiles ({allUsers.length})</span>
        </button>
        <button
          onClick={() => setAdminTab('announcements')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            adminTab === 'announcements'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-morita-charcoal/50 hover:text-morita-charcoal'
          }`}
        >
          <Megaphone className="h-4 w-4" />
          <span>📣 Cartelera de la Junta ({announcements.length})</span>
        </button>
      </div>

      {/* 4. PUBLICATIONS TAB VIEW */}
      {adminTab === 'pubs' && (
        <div className="space-y-4">
          
          {/* Controls bar */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
            
            {/* Search & Filter */}
            <div className="flex-1 flex flex-col sm:flex-row gap-2 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-morita-charcoal/40" />
                <input
                  type="text"
                  placeholder="Buscar publicación por título o autor..."
                  value={pubSearch}
                  onChange={(e) => setPubSearch(e.target.value)}
                  className="w-full text-xs rounded-xl border border-morita-sand pl-9 pr-4 py-2 bg-white focus:outline-hidden"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="text-xs rounded-xl border border-morita-sand px-3 py-2 bg-white focus:outline-hidden cursor-pointer"
              >
                <option value="all">Todos los Tipos</option>
                <option value="vendo">Vendo (Productos)</option>
                <option value="ofrezco">Ofrezco (Servicios)</option>
                <option value="necesito">Necesito (Ayuda)</option>
              </select>
            </div>

            {/* Quick Create Button */}
            <button
              onClick={handleStartCreatePub}
              className="bg-morita-mulberry hover:bg-morita-mulberry/90 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-3xs shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Crear Publicación</span>
            </button>
          </div>

          {/* List/Grid of publications */}
          {filteredPubs.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-morita-sand rounded-2xl bg-morita-beige/30">
              <AlertTriangle className="h-8 w-8 text-morita-terracotta mx-auto mb-2" />
              <p className="text-xs font-bold text-morita-charcoal/70">No se encontraron publicaciones</p>
              <p className="text-[11px] text-morita-charcoal/50 mt-1">Intentá cambiar el término de búsqueda o el tipo de filtro.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPubs.map((pub) => (
                <div 
                  key={pub.id} 
                  className={`p-4 bg-white border rounded-2xl flex flex-col justify-between transition-all hover:shadow-2xs ${
                    pub.isActive === false ? 'border-dashed border-morita-sand opacity-70 bg-morita-sand/5' : 'border-morita-sand/60 shadow-3xs'
                  }`}
                >
                  <div>
                    {/* Author & Header */}
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={() => onOpenProfile(pub.userId)}
                        className="flex items-center space-x-2 text-left cursor-pointer hover:underline group"
                      >
                        <img 
                          src={pub.authorAvatar} 
                          alt={pub.authorName} 
                          className="h-6 w-6 rounded-full object-cover border border-morita-sand shrink-0 group-hover:scale-105 transition-transform" 
                        />
                        <span className="text-[11px] font-bold text-morita-charcoal/80 truncate max-w-[120px]">
                          {pub.authorName}
                        </span>
                      </button>
                      <span className="text-[10px] text-morita-charcoal/40 font-semibold uppercase tracking-wider">
                        {new Date(pub.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Image & Title */}
                    <div className="flex gap-2.5 mb-3">
                      {pub.photo ? (
                        <img 
                          src={pub.photo} 
                          alt={pub.title} 
                          className="h-12 w-12 rounded-lg object-cover border border-morita-sand shrink-0" 
                        />
                      ) : (
                        <div className="h-12 w-12 bg-morita-sand/30 rounded-lg flex items-center justify-center text-lg shrink-0 select-none">
                          📦
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className={`inline-block text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-md mb-1 mr-1 ${
                          pub.type === 'vendo' ? 'bg-morita-mulberry/10 text-morita-mulberry' :
                          pub.type === 'ofrezco' ? 'bg-morita-leaf/10 text-morita-leaf' :
                          'bg-morita-terracotta/10 text-morita-terracotta'
                        }`}>
                          {pub.type === 'vendo' ? 'Vendo' : pub.type === 'ofrezco' ? 'Ofrezco' : 'Necesito'}
                        </span>
                        <span className="inline-block text-[8px] font-bold text-morita-charcoal/50 bg-morita-sand/40 px-1.5 py-0.5 rounded-md">
                          {pub.category}
                        </span>
                        <h4 className="text-xs font-bold text-morita-charcoal leading-snug line-clamp-1 mt-0.5">
                          {pub.title}
                        </h4>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[10px] text-morita-charcoal/60 line-clamp-2 leading-relaxed mb-3 bg-morita-beige/35 p-2 rounded-lg border border-morita-sand/20">
                      {pub.description}
                    </p>

                    {/* Metadata line */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-morita-charcoal/50 font-medium mb-3">
                      <span className="flex items-center gap-0.5">
                        <MapPin className="h-3 w-3 text-morita-terracotta shrink-0" />
                        <span className="truncate max-w-[120px]">{pub.zone}</span>
                      </span>
                      <span>•</span>
                      <span className="font-bold text-morita-charcoal/80">
                        {pub.priceType === 'monto' ? `Bs. ${pub.priceValue}` : pub.priceType === 'a-consultar' ? 'A consultar' : 'Intercambio'}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-morita-sand/40 flex items-center justify-between mt-1">
                    {/* Toggle visibility shortcut */}
                    <button
                      onClick={() => {
                        const updated = { ...pub, isActive: pub.isActive !== false ? false : true };
                        onAdminSavePublication(updated);
                        showFeedback(`Publicación "${pub.title}" ${updated.isActive ? 'activada' : 'desactivada'}.`);
                      }}
                      className="text-[10px] font-bold flex items-center gap-1 cursor-pointer select-none text-morita-charcoal/60 hover:text-morita-charcoal"
                      title={pub.isActive !== false ? 'Ocultar esta publicación en la app' : 'Hacer visible esta publicación'}
                    >
                      {pub.isActive !== false ? (
                        <>
                          <Eye className="h-3.5 w-3.5 text-morita-leaf" />
                          <span>Visible</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3.5 w-3.5 text-morita-charcoal/40" />
                          <span className="text-morita-charcoal/40">Oculto</span>
                        </>
                      )}
                    </button>

                    {/* Edit / Delete buttons */}
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleStartEditPub(pub)}
                        className="p-1.5 hover:bg-morita-sand text-morita-charcoal/60 hover:text-morita-mulberry rounded-lg transition-colors cursor-pointer"
                        title="Editar Publicación"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePubClick(pub.id, pub.title)}
                        className="p-1.5 hover:bg-morita-terracotta/10 text-morita-charcoal/40 hover:text-morita-terracotta rounded-lg transition-colors cursor-pointer"
                        title="Eliminar Publicación"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. USER PROFILES TAB VIEW */}
      {adminTab === 'users' && (
        <div className="space-y-4">
          
          {/* Controls bar */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
            
            {/* Search Bar */}
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-morita-charcoal/40" />
              <input
                type="text"
                placeholder="Buscar vecino por nombre, zona o celular..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full text-xs rounded-xl border border-morita-sand pl-9 pr-4 py-2 bg-white focus:outline-hidden"
              />
            </div>

            {/* Registrar Nuevo Vecino button */}
            <button
              onClick={handleStartCreateUser}
              className="bg-morita-terracotta hover:bg-morita-terracotta/90 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-3xs shrink-0"
            >
              <UserPlus className="h-4 w-4" />
              <span>Registrar Vecino</span>
            </button>
          </div>

          {/* List of user profiles */}
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-morita-sand rounded-2xl bg-morita-beige/30">
              <AlertTriangle className="h-8 w-8 text-morita-terracotta mx-auto mb-2" />
              <p className="text-xs font-bold text-morita-charcoal/70">No se encontraron perfiles</p>
              <p className="text-[11px] text-morita-charcoal/50 mt-1">Probá cambiando el texto de búsqueda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user) => {
                const isCurrentActive = user.id === currentUser.id;
                const pubCount = publications.filter(p => p.userId === user.id).length;
                
                return (
                  <div 
                    key={user.id} 
                    className={`p-4 bg-white border rounded-2xl shadow-3xs flex flex-col justify-between transition-all hover:shadow-2xs ${
                      isCurrentActive ? 'border-morita-mulberry ring-1 ring-morita-mulberry/20 bg-morita-sand/10' : 'border-morita-sand/60'
                    }`}
                  >
                    <div>
                      {/* Avatar, Name, Stats */}
                      <div className="flex items-start justify-between mb-3.5">
                        <button
                          onClick={() => onOpenProfile(user.id)}
                          className="flex items-center space-x-3 text-left cursor-pointer group"
                        >
                          <img 
                            src={user.avatar} 
                            alt={user.name} 
                            className="h-11 w-11 rounded-full object-cover border-2 border-morita-sand shrink-0 group-hover:scale-105 transition-transform" 
                          />
                          <div className="min-w-0">
                            <span className="block text-xs font-bold text-morita-charcoal leading-tight truncate group-hover:text-morita-mulberry transition-colors">
                              {user.name}
                            </span>
                            <span className="block text-[10px] text-morita-charcoal/50 mt-0.5 font-medium">
                              {pubCount} {pubCount === 1 ? 'publicación' : 'publicaciones'}
                            </span>
                          </div>
                        </button>
                        
                        {isCurrentActive && (
                          <span className="text-[9px] font-bold bg-morita-mulberry text-white px-2 py-0.5 rounded-full shadow-3xs flex items-center gap-0.5">
                            <Sparkles className="h-2.5 w-2.5 animate-spin-slow" />
                            <span>Activo</span>
                          </span>
                        )}
                      </div>

                      {/* Contact & Location details */}
                      <div className="space-y-1.5 mb-4 text-[10px] text-morita-charcoal/70 font-medium">
                        <div className="flex items-center space-x-1.5">
                          <MapPin className="h-3.5 w-3.5 text-morita-terracotta shrink-0" />
                          <span className="truncate">{user.zone || 'La Morita, Escobar'}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <Smartphone className="h-3.5 w-3.5 text-morita-leaf shrink-0" />
                          <span>{user.phone}</span>
                        </div>
                        {user.email && (
                          <div className="flex items-center space-x-1.5">
                            <Mail className="h-3.5 w-3.5 text-morita-charcoal/40 shrink-0" />
                            <span className="truncate font-mono text-[9px]">{user.email}</span>
                          </div>
                        )}
                      </div>

                      {/* Biography summary */}
                      {user.bio ? (
                        <p className="text-[10px] text-morita-charcoal/60 italic leading-relaxed bg-morita-beige/35 p-2 rounded-lg border border-morita-sand/20 line-clamp-2 min-h-8">
                          "{user.bio}"
                        </p>
                      ) : (
                        <div className="text-[10px] text-morita-charcoal/40 italic p-2 rounded-lg border border-dashed border-morita-sand/30 bg-morita-beige/10 line-clamp-2 min-h-8">
                          Sin presentación agregada.
                        </div>
                      )}
                    </div>

                    {/* Actions panel */}
                    <div className="pt-3 border-t border-morita-sand/40 flex items-center justify-between mt-4">
                      {/* Sim switcher shortcut */}
                      <button
                        onClick={() => {
                          onSwitchUser(user.id);
                          showFeedback(`Identidad simulada cambiada a: ${user.name}`);
                        }}
                        className={`text-[9px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                          isCurrentActive
                            ? 'bg-morita-mulberry/15 text-morita-mulberry border-morita-mulberry/20 font-extrabold shadow-3xs cursor-default'
                            : 'bg-white border-morita-sand text-morita-charcoal hover:bg-morita-sand hover:text-morita-mulberry'
                        }`}
                        disabled={isCurrentActive}
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>{isCurrentActive ? 'Simulación Activa' : 'Simular Vecino'}</span>
                      </button>

                      {/* Edit / Delete User */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleStartEditUser(user)}
                          className="p-1.5 hover:bg-morita-sand text-morita-charcoal/60 hover:text-morita-terracotta rounded-lg transition-colors cursor-pointer"
                          title="Editar Perfil de Vecino"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUserClick(user.id, user.name)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isCurrentActive 
                              ? 'opacity-30 cursor-not-allowed text-morita-charcoal/30' 
                              : 'hover:bg-morita-terracotta/10 text-morita-charcoal/40 hover:text-morita-terracotta'
                          }`}
                          disabled={isCurrentActive}
                          title="Eliminar Vecino"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. ANNOUNCEMENTS TAB VIEW */}
      {adminTab === 'announcements' && (
        <div className="space-y-4">
          {/* Controls bar */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
            {/* Search */}
            <div className="flex-1 flex gap-2 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-morita-charcoal/40" />
                <input
                  type="text"
                  placeholder="Buscar comunicado por título o contenido..."
                  value={annSearch}
                  onChange={(e) => setAnnSearch(e.target.value)}
                  className="w-full text-xs rounded-xl border border-morita-sand pl-9 pr-4 py-2 bg-white focus:outline-hidden"
                />
              </div>
            </div>

            {/* Quick Create Button */}
            <button
              onClick={handleStartCreateAnn}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-3xs shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Comunicado</span>
            </button>
          </div>

          {/* List of announcements */}
          {filteredAnnouncements.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-morita-sand rounded-2xl bg-morita-beige/30">
              <AlertTriangle className="h-8 w-8 text-morita-terracotta mx-auto mb-2" />
              <p className="text-xs font-bold text-morita-charcoal/70">No se encontraron comunicados</p>
              <p className="text-[11px] text-morita-charcoal/50 mt-1">Intentá cambiar el término de búsqueda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAnnouncements.map((ann) => (
                <div 
                  key={ann.id}
                  className={`p-4 rounded-xl border relative transition-all bg-white flex flex-col justify-between ${
                    ann.important 
                      ? 'border-amber-300 shadow-3xs ring-1 ring-amber-300/30' 
                      : 'border-morita-sand/65 hover:border-morita-sand shadow-4xs'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center space-x-1.5">
                        <span className="p-1 bg-amber-500/10 text-amber-800 rounded text-xs font-bold">
                          <Megaphone className="h-3.5 w-3.5 shrink-0" />
                        </span>
                        <h4 className="text-xs font-bold text-morita-charcoal line-clamp-1 pr-12">
                          {ann.title}
                        </h4>
                      </div>
                      {ann.important && (
                        <span className="shrink-0 flex items-center space-x-0.5 text-[9px] bg-amber-500/15 text-amber-800 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                          <Pin className="h-2 w-2 shrink-0 rotate-45" />
                          <span>Fijado</span>
                        </span>
                      )}
                    </div>

                    <span className="block text-[9px] text-morita-charcoal/40 font-semibold mb-2">
                      📅 {new Date(ann.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <p className="text-[11px] text-morita-charcoal/70 line-clamp-4 font-sans whitespace-pre-wrap bg-morita-sand/10 p-2.5 rounded border border-morita-sand/20">
                      {ann.content}
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-morita-sand/30">
                    <button
                      onClick={() => handleStartEditAnn(ann)}
                      className="p-1.5 hover:bg-morita-sand text-morita-charcoal/60 hover:text-morita-mulberry rounded-lg transition-colors cursor-pointer"
                      title="Editar Comunicado"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteAnnClick(ann.id, ann.title)}
                      className="p-1.5 hover:bg-morita-terracotta/10 text-morita-charcoal/40 hover:text-morita-terracotta rounded-lg transition-colors cursor-pointer"
                      title="Eliminar Comunicado"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
