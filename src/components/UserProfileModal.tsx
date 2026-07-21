import React, { useState, useMemo } from 'react';
import { User, Publication, ThankYou } from '../types';
import { X, Heart, MapPin, Phone, Mail, Sparkles, Plus, AlertCircle, Calendar, LayoutGrid, List, ShieldAlert, Edit } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  userId: string | null;
  allUsers: User[];
  publications: Publication[];
  thankYous: ThankYou[];
  currentUser: User;
  onClose: () => void;
  onAddThankYou: (targetUserId: string, text: string, pubTitle?: string) => void;
  onRequestHelp?: (pub: Publication) => void;
  onOpenAdminPanel?: () => void;
  onEditProfile?: (user: User) => void;
}

export default function UserProfileModal({
  isOpen,
  userId,
  allUsers,
  publications,
  thankYous,
  currentUser,
  onClose,
  onAddThankYou,
  onRequestHelp,
  onOpenAdminPanel,
  onEditProfile
}: UserProfileModalProps) {
  const [thankYouText, setThankYouText] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  // Find targeted user
  const user = useMemo(() => {
    if (!userId) return null;
    return allUsers.find(u => u.id === userId) || null;
  }, [allUsers, userId]);

  // Find targeted user's publications
  const userPublications = useMemo(() => {
    if (!userId) return [];
    return publications.filter(p => p.userId === userId);
  }, [publications, userId]);

  // Find targeted user's thank-yous
  const userThankYous = useMemo(() => {
    if (!userId) return [];
    return thankYous
      .filter(t => t.targetUserId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [thankYous, userId]);

  // Reset map view and compact layout on user or modal open change
  React.useEffect(() => {
    setShowMap(false);
    if (isOpen && userPublications) {
      setIsCompact(userPublications.length > 2);
    }
  }, [userId, isOpen, userPublications.length]);

  if (!isOpen || !user) return null;

  const isOwnProfile = user.id === currentUser.id;

  const handleThankYouSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!thankYouText.trim()) return;

    onAddThankYou(user.id, thankYouText.trim());
    setThankYouText('');
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setShowForm(false);
    }, 1500);
  };

  return (
    <div id="profile-modal-overlay" className="fixed inset-0 z-50 overflow-y-auto bg-morita-charcoal/60 backdrop-blur-xs p-3 sm:p-6 flex items-center justify-center min-h-full">
      <div 
        id="profile-modal-content" 
        className="bg-white rounded-2xl border border-morita-sand shadow-2xl w-full max-w-2xl my-auto max-h-[88vh] flex flex-col overflow-hidden animate-fade-in"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-morita-sand/50 flex items-center justify-between bg-morita-beige/35 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="text-xl">👤</span>
            <div>
              <h2 className="text-lg font-serif font-bold text-morita-charcoal">
                Perfil de Vecino
              </h2>
              <p className="text-[10px] text-morita-charcoal/50 leading-none">
                La Morita • Conociéndonos en comunidad
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-morita-sand/40 text-morita-charcoal/60 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto touch-pan-y">
          
          {/* 1. Profile Hero Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-6 border-b border-morita-sand/40">
            <img
              src={user.avatar}
              alt={user.name}
              className="h-20 w-20 rounded-full object-cover border-4 border-morita-sand/80 shadow-xs shrink-0"
            />
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-xl font-serif font-bold text-morita-charcoal flex items-center justify-center sm:justify-start gap-2">
                  <span>{user.name}</span>
                  {isOwnProfile && <span className="text-xs bg-morita-sand text-morita-mulberry font-bold px-2 py-0.5 rounded-full">Tú</span>}
                  {user.isAdmin && <span className="text-[10px] bg-purple-100 text-purple-900 font-extrabold px-2 py-0.5 rounded-full border border-purple-200">Admin 🛡️</span>}
                </h3>

                {(isOwnProfile || currentUser.isAdmin) && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onEditProfile) {
                        onEditProfile(user);
                        onClose();
                      }
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-morita-mulberry text-white hover:bg-morita-mulberry/90 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 mx-auto sm:mx-0"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>{isOwnProfile ? 'Editar Mi Perfil ✏️' : 'Editar Perfil (Admin) ✏️'}</span>
                  </button>
                )}
              </div>
              <div className="mt-1 flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start gap-2">
                <p className="text-xs text-morita-charcoal/60 flex items-center justify-center sm:justify-start gap-1">
                  <MapPin className="h-3.5 w-3.5 text-morita-terracotta shrink-0" />
                  <span>{user.zone}</span>
                </p>
                <button
                  type="button"
                  onClick={() => setShowMap(!showMap)}
                  className="text-[10px] font-bold text-morita-mulberry hover:underline inline-flex items-center gap-0.5 justify-center sm:justify-start cursor-pointer"
                >
                  {showMap ? '🙈 Ocultar Mapa' : '🗺️ Ver en Google Maps'}
                </button>
              </div>

              {/* Collapsible Google Maps preview */}
              {showMap && (
                <div className="mt-2.5 p-2 bg-morita-sand/15 border border-morita-sand/30 rounded-xl space-y-1.5 max-w-md mx-auto sm:mx-0">
                  <div className="flex items-center justify-between text-[9px] font-bold text-morita-charcoal/50">
                    <span>VISTA PREVIA DEL BARRIO</span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((user.zone || '') + ' Santa Cruz de la Sierra, Bolivia')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-morita-mulberry hover:underline flex items-center gap-0.5"
                    >
                      Abrir Completo ↗
                    </a>
                  </div>
                  <div className="relative rounded-lg overflow-hidden border border-morita-sand/50 bg-white">
                    <iframe
                      title="Google Map Neighbor"
                      width="100%"
                      height="120"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent((user.zone || 'Equipetrol') + ', Santa Cruz de la Sierra, Bolivia')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    ></iframe>
                  </div>
                </div>
              )}

              {user.bio ? (
                <p className="text-xs text-morita-charcoal/70 italic mt-3 bg-morita-beige/35 p-3 rounded-xl border border-morita-sand/30 leading-relaxed">
                  "{user.bio}"
                </p>
              ) : (
                <p className="text-xs text-morita-charcoal/40 italic mt-3">
                  Sin biografía por el momento. ¡Los vecinos lo conocen por sus buenas acciones!
                </p>
              )}

              {/* Skills badges */}
              {user.skills && user.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5 justify-center sm:justify-start">
                  {user.skills.map(skill => (
                    <span 
                      key={skill} 
                      className="px-2.5 py-0.5 rounded-full bg-morita-mulberry/10 text-morita-mulberry border border-morita-mulberry/20 text-[10px] font-bold tracking-wide"
                    >
                      💡 {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* Private contact credentials shown only if logged in */}
              <div className="mt-4 flex flex-wrap gap-3 justify-center sm:justify-start items-center text-xs text-morita-charcoal/80 bg-morita-sand/20 p-2 rounded-lg">
                <div className="flex items-center space-x-1.5">
                  <Phone className="h-3.5 w-3.5 text-morita-mulberry" />
                  <span className="font-semibold">{user.phone}</span>
                </div>
                {!isOwnProfile && (
                  <a
                    href={`https://wa.me/${user.phone.replace(/[^\d+]/g, '').startsWith('591') || user.phone.replace(/[^\d+]/g, '').startsWith('+591') ? user.phone.replace(/[^\d+]/g, '') : '591' + user.phone.replace(/[^\d+]/g, '')}?text=${encodeURIComponent(`Hola ${user.name}! Te escribo desde La Morita, vi tu perfil vecinal.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold cursor-pointer transition-colors shadow-3xs"
                    title="Chatear directo por WhatsApp"
                  >
                    <span>💬 WhatsApp</span>
                  </a>
                )}
                <div className="flex items-center space-x-1.5">
                  <Mail className="h-3.5 w-3.5 text-morita-mulberry" />
                  <span className="font-semibold truncate max-w-[150px] sm:max-w-xs">{user.email}</span>
                </div>
              </div>

              {/* Exclusive Admin Panel Access - Only shown for Admin User */}
              {(user.isAdmin || (isOwnProfile && currentUser.isAdmin)) && (
                <div className="mt-4 p-3.5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center space-x-2.5 text-left">
                    <div className="p-2 bg-purple-600 text-white rounded-lg shadow-2xs shrink-0">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                        <span>Panel de Administración Vecinal</span>
                        <span className="bg-purple-200 text-purple-900 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase">Admin</span>
                      </h4>
                      <p className="text-[11px] text-purple-800/80 leading-tight">
                        Gestión total del barrio: moderación de avisos, vecinos y comunicados.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenAdminPanel) {
                        onOpenAdminPanel();
                        onClose();
                      }
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    <span>Ingresar al Panel Admin</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 2. Grid Sections: Publications & Gratitude */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            {/* Left: Neighbor's Active Publications */}
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-morita-sand/40 pb-2">
                <h4 className="text-xs font-bold text-morita-charcoal uppercase tracking-wider">
                  Publicaciones activas ({userPublications.length})
                </h4>
                {userPublications.length > 1 && (
                  <div className="flex items-center space-x-1 bg-morita-sand/20 p-0.5 rounded-lg border border-morita-sand/40">
                    <button
                      type="button"
                      onClick={() => setIsCompact(false)}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                        !isCompact
                          ? 'bg-white text-morita-mulberry shadow-4xs'
                          : 'text-morita-charcoal/50 hover:text-morita-charcoal'
                      }`}
                      title="Vista Detallada"
                    >
                      <LayoutGrid className="h-2.5 w-2.5" />
                      <span className="hidden sm:inline">Detalle</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCompact(true)}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                        isCompact
                          ? 'bg-white text-morita-mulberry shadow-4xs'
                          : 'text-morita-charcoal/50 hover:text-morita-charcoal'
                      }`}
                      title="Vista Compacta"
                    >
                      <List className="h-2.5 w-2.5" />
                      <span className="hidden sm:inline">Compacto</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {userPublications.length === 0 ? (
                  <p className="text-xs text-morita-charcoal/50 italic py-4">
                    Este vecino no tiene publicaciones creadas actualmente.
                  </p>
                ) : isCompact ? (
                  userPublications.map((p) => (
                    <div 
                      key={p.id}
                      className="p-2.5 bg-morita-sand/10 hover:bg-morita-sand/20 border border-morita-sand/40 rounded-xl transition-all flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0 ${
                          p.type === 'vendo' ? 'bg-morita-terracotta/10 text-morita-terracotta' :
                          p.type === 'ofrezco' ? 'bg-morita-mulberry/10 text-morita-mulberry' :
                          'bg-morita-leaf/10 text-morita-leaf'
                        }`}>
                          {p.type}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h5 className="font-bold text-morita-charcoal text-[11px] truncate leading-tight" title={p.title}>
                            {p.title}
                          </h5>
                          <p className="text-[10px] text-morita-charcoal/50 truncate leading-normal" title={p.description}>
                            {p.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="text-[10px] font-bold text-morita-mulberry bg-white border border-morita-sand/35 px-1.5 py-0.5 rounded-md">
                          {p.priceType === 'monto' ? (
                            p.priceValue
                              ? p.priceValue.replace(/\$/g, 'Bs.').replace(/Bs\.\s*Bs\./i, 'Bs.').toLowerCase().includes('bs')
                                ? p.priceValue.replace(/\$/g, 'Bs.').replace(/Bs\.\s*Bs\./i, 'Bs.')
                                : `Bs. ${p.priceValue}`
                              : ''
                          ) : p.priceType === 'a-consultar' ? 'Consultar' : 'Favor'}
                        </span>
                        
                        {!isOwnProfile && onRequestHelp && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onRequestHelp(p);
                            }}
                            className="text-[9px] font-bold px-2 py-1 rounded-md bg-morita-mulberry text-white hover:bg-morita-mulberry/90 transition-colors cursor-pointer shadow-4xs"
                          >
                            {p.type === 'necesito' ? 'Ayudar' : 'Pedir'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  userPublications.map((p) => (
                    <div 
                      key={p.id}
                      className="p-3 bg-white border border-morita-sand rounded-xl shadow-3xs hover:border-morita-mulberry transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide ${
                          p.type === 'vendo' ? 'bg-morita-terracotta/10 text-morita-terracotta' :
                          p.type === 'ofrezco' ? 'bg-morita-mulberry/10 text-morita-mulberry' :
                          'bg-morita-leaf/10 text-morita-leaf'
                        }`}>
                          {p.type}
                        </span>
                        <span className="text-[10px] font-bold text-morita-mulberry">
                          {p.priceType === 'monto' ? (
                            p.priceValue
                              ? p.priceValue.replace(/\$/g, 'Bs.').replace(/Bs\.\s*Bs\./i, 'Bs.').toLowerCase().includes('bs')
                                ? p.priceValue.replace(/\$/g, 'Bs.').replace(/Bs\.\s*Bs\./i, 'Bs.')
                                : `Bs. ${p.priceValue}`
                              : ''
                          ) : p.priceType === 'a-consultar' ? 'A consultar 💬' : 'Favor 🤝'}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-morita-charcoal mt-1 truncate">
                        {p.title}
                      </h5>
                      <p className="text-[11px] text-morita-charcoal/60 line-clamp-2 mt-1">
                        {p.description}
                      </p>
                      {!isOwnProfile && onRequestHelp && (
                        <div className="mt-2.5 pt-2 border-t border-morita-sand/30 flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onRequestHelp(p);
                            }}
                            className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-morita-mulberry text-white hover:bg-morita-mulberry/90 transition-colors cursor-pointer flex items-center gap-1 shadow-3xs"
                          >
                            {p.type === 'necesito' ? '🤝 Ofrecer Ayuda' : '🛒 Me Interesa'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: Wall of Gratitude (Agradecimientos) */}
            <div className="space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-morita-sand/40 pb-2">
                  <h4 className="text-xs font-bold text-morita-charcoal uppercase tracking-wider flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5 text-morita-mulberry fill-current" />
                    <span>Muro de agradecimientos ({userThankYous.length})</span>
                  </h4>
                </div>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1 mt-3">
                  {userThankYous.length === 0 ? (
                    <p className="text-xs text-morita-charcoal/50 italic py-4">
                      Todavía nadie le dejó palabras de agradecimiento. ¡Coordiná algo con {user.name.split(' ')[0]} para dejar el primero!
                    </p>
                  ) : (
                    userThankYous.map((t) => (
                      <div 
                        key={t.id}
                        className="p-3 bg-morita-sand/15 border border-morita-sand/55 rounded-xl text-xs space-y-1"
                      >
                        <div className="flex items-center space-x-1.5">
                          <img
                            src={t.authorAvatar}
                            alt={t.authorName}
                            className="h-5 w-5 rounded-full object-cover border border-morita-sand"
                          />
                          <span className="text-[11px] font-bold text-morita-charcoal">
                            {t.authorName}
                          </span>
                          <span className="text-[9px] text-morita-charcoal/40 ml-auto">
                            {new Date(t.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-morita-charcoal/85 italic leading-relaxed text-[11px]">
                          "{t.text}"
                        </p>
                        {t.publicationTitle && (
                          <span className="text-[9px] text-morita-mulberry font-semibold block pt-0.5 truncate">
                            🏷️ Por: {t.publicationTitle}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Leave Thank-You block directly */}
              {!isOwnProfile && (
                <div className="pt-3 border-t border-morita-sand/30">
                  {!showForm ? (
                    <button
                      onClick={() => setShowForm(true)}
                      className="w-full py-1.5 border border-dashed border-morita-terracotta bg-morita-terracotta/5 hover:bg-morita-terracotta/10 text-morita-terracotta rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Dejar agradecimiento libre</span>
                    </button>
                  ) : (
                    <form onSubmit={handleThankYouSubmit} className="space-y-2">
                      {success ? (
                        <div className="p-2 bg-green-50 border border-green-200 text-green-800 text-[11px] font-bold rounded-lg text-center animate-pulse">
                          🎉 ¡Agradecimiento publicado!
                        </div>
                      ) : (
                        <>
                          <textarea
                            value={thankYouText}
                            onChange={(e) => setThankYouText(e.target.value)}
                            rows={2}
                            placeholder={`Escribí algo lindo sobre cómo te ayudó ${user.name.split(' ')[0]}...`}
                            className="w-full text-xs rounded-lg border border-morita-sand p-2 bg-white"
                            required
                          />
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setShowForm(false)}
                              className="text-[10px] text-morita-charcoal/50 font-bold px-2 py-1"
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              className="bg-morita-terracotta hover:bg-morita-terracotta-dark text-white text-[10px] font-bold px-2.5 py-1 rounded-md"
                            >
                              Enviar
                            </button>
                          </div>
                        </>
                      )}
                    </form>
                  )}
                </div>
              )}

            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-morita-sand/50 flex justify-end bg-morita-beige/20">
          <button
            onClick={onClose}
            className="bg-morita-mulberry hover:bg-morita-mulberry-dark text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Listo, cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
