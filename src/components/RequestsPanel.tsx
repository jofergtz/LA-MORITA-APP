import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Request, Message, User, Publication } from '../types';
import { MessageSquare, Calendar, Send, CheckCircle2, XCircle, Heart, User as UserIcon, Sparkles, ShoppingBag, ArrowLeft, HeartHandshake } from 'lucide-react';

interface RequestsPanelProps {
  requests: Request[];
  messages: Message[];
  publications: Publication[];
  currentUser: User;
  allUsers: User[];
  onSendMessage: (requestId: string, text: string) => void;
  onChangeRequestStatus: (requestId: string, newStatus: 'pendiente' | 'aceptada' | 'rechazada' | 'completada') => void;
  onAddThankYou: (targetUserId: string, text: string, pubTitle?: string) => void;
  selectedRequestId: string | null;
  setSelectedRequestId: (id: string | null) => void;
}

export default function RequestsPanel({
  requests,
  messages,
  publications,
  currentUser,
  allUsers,
  onSendMessage,
  onChangeRequestStatus,
  onAddThankYou,
  selectedRequestId,
  setSelectedRequestId
}: RequestsPanelProps) {
  const [activeTab, setActiveTab] = useState<'recibidas' | 'enviadas'>('recibidas');
  const [typedMessage, setTypedMessage] = useState('');
  const [thankYouText, setThankYouText] = useState('');
  const [showThankYouForm, setShowThankYouForm] = useState(false);
  const [submittedThankYou, setSubmittedThankYou] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Filter requests
  const incomingRequests = useMemo(() => {
    return requests.filter(r => r.publisherId === currentUser.id);
  }, [requests, currentUser.id]);

  const outgoingRequests = useMemo(() => {
    return requests.filter(r => r.requesterId === currentUser.id);
  }, [requests, currentUser.id]);

  const activeRequestsList = activeTab === 'recibidas' ? incomingRequests : outgoingRequests;

  // Selected request details
  const selectedRequest = useMemo(() => {
    if (!selectedRequestId) return null;
    return requests.find(r => r.id === selectedRequestId) || null;
  }, [requests, selectedRequestId]);

  // Messages of the selected request
  const selectedRequestMessages = useMemo(() => {
    if (!selectedRequestId) return [];
    return messages
      .filter(m => m.requestId === selectedRequestId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [messages, selectedRequestId]);

  // Publication of the selected request
  const selectedRequestPub = useMemo(() => {
    if (!selectedRequest) return null;
    return publications.find(p => p.id === selectedRequest.publicationId) || null;
  }, [selectedRequest, publications]);

  // Find partner user in allUsers
  const partnerUser = useMemo(() => {
    if (!selectedRequest || !allUsers) return null;
    const partnerId = selectedRequest.publisherId === currentUser.id
      ? selectedRequest.requesterId
      : selectedRequest.publisherId;
    return allUsers.find(u => u.id === partnerId) || null;
  }, [selectedRequest, allUsers, currentUser.id]);

  const cleanPhone = (phoneStr: string) => {
    const clean = phoneStr.replace(/[^\d+]/g, '');
    if (!clean.startsWith('+') && !clean.startsWith('591')) {
      return '591' + clean;
    }
    return clean;
  };

  const getWhatsAppChatLink = () => {
    if (!partnerUser || !selectedRequest) return '';
    const text = `Hola ${partnerUser.name}, te escribo por La Morita sobre la coordinación de "${selectedRequest.publicationTitle}".`;
    return `https://wa.me/${cleanPhone(partnerUser.phone)}?text=${encodeURIComponent(text)}`;
  };

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedRequestMessages]);

  // Reset thank-you state on request change
  useEffect(() => {
    setShowThankYouForm(false);
    setThankYouText('');
    setSubmittedThankYou(false);
  }, [selectedRequestId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !selectedRequestId) return;
    
    onSendMessage(selectedRequestId, typedMessage.trim());
    setTypedMessage('');
  };

  const handleStatusChange = (status: 'pendiente' | 'aceptada' | 'rechazada' | 'completada') => {
    if (!selectedRequestId) return;
    onChangeRequestStatus(selectedRequestId, status);
  };

  const handleThankYouSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!thankYouText.trim() || !selectedRequest) return;

    // The current user gives thank you to the publisher
    onAddThankYou(
      selectedRequest.publisherId,
      thankYouText.trim(),
      selectedRequest.publicationTitle
    );

    setSubmittedThankYou(true);
    setThankYouText('');
    setTimeout(() => {
      setShowThankYouForm(false);
    }, 1500);
  };

  const getStatusBadge = (status: Request['status']) => {
    switch (status) {
      case 'pendiente':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
            Pendiente ⏳
          </span>
        );
      case 'aceptada':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-morita-leaf/10 text-morita-leaf border border-morita-leaf/20">
            Aceptada 💬
          </span>
        );
      case 'rechazada':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
            Rechazada ✕
          </span>
        );
      case 'completada':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-morita-mulberry/10 text-morita-mulberry border border-morita-mulberry/20">
            Completada ✓
          </span>
        );
    }
  };

  // Determine other user details in chat
  const getChatPartner = (req: Request) => {
    const isPublisher = req.publisherId === currentUser.id;
    return {
      name: isPublisher ? req.requesterName : req.publicationTitle,
      avatar: isPublisher ? req.requesterAvatar : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      label: isPublisher ? 'Vecino Interesado' : 'Creador de publicación'
    };
  };

  return (
    <div id="requests-panel-layout" className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[70vh] items-stretch">
      
      {/* LEFT COLUMN: Requests List (Columns span 4 on wide screen, hidden on mobile if request is selected) */}
      <div 
        id="requests-list-col" 
        className={`md:col-span-5 bg-white border border-morita-sand rounded-2xl flex flex-col shadow-xs overflow-hidden ${
          selectedRequestId ? 'hidden md:flex' : 'flex'
        }`}
      >
        
        {/* Inbox Header / Tabs */}
        <div className="bg-morita-beige/35 border-b border-morita-sand/60 px-4 py-3 flex justify-between items-center shrink-0">
          <h2 className="text-sm font-bold text-morita-charcoal uppercase tracking-wider">Bandeja de Mensajes</h2>
          <span className="text-[10px] bg-morita-sand font-bold text-morita-mulberry px-2 py-0.5 rounded-full">
            {requests.length} en total
          </span>
        </div>

        {/* Tab switchers */}
        <div className="grid grid-cols-2 border-b border-morita-sand/40 p-1 bg-morita-beige/10 shrink-0">
          <button
            onClick={() => {
              setActiveTab('recibidas');
              setSelectedRequestId(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer relative ${
              activeTab === 'recibidas'
                ? 'bg-white text-morita-mulberry shadow-xs border-b-2 border-morita-mulberry'
                : 'text-morita-charcoal/60 hover:text-morita-mulberry'
            }`}
          >
            Pedidos Recibidos ({incomingRequests.length})
            {incomingRequests.some(r => r.status === 'pendiente') && (
              <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-morita-terracotta animate-pulse" />
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('enviadas');
              setSelectedRequestId(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer relative ${
              activeTab === 'enviadas'
                ? 'bg-white text-morita-mulberry shadow-xs border-b-2 border-morita-mulberry'
                : 'text-morita-charcoal/60 hover:text-morita-mulberry'
            }`}
          >
            Mis Solicitudes ({outgoingRequests.length})
          </button>
        </div>

        {/* Requests Items List */}
        <div className="flex-1 overflow-y-auto divide-y divide-morita-sand/40 max-h-[60vh] md:max-h-[70vh]">
          {activeRequestsList.length === 0 ? (
            <div className="px-6 py-12 text-center text-xs text-morita-charcoal/50">
              <MessageSquare className="h-8 w-8 text-morita-sand mx-auto mb-2.5 opacity-60" />
              <span>No tenés solicitudes en esta bandeja por el momento.</span>
            </div>
          ) : (
            activeRequestsList.map((r) => {
              const isRecibida = activeTab === 'recibidas';
              const partnerName = isRecibida ? r.requesterName : r.publicationTitle;
              const partnerAvatar = isRecibida ? r.requesterAvatar : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'; // fallback or find owner in list
              const isSelected = r.id === selectedRequestId;

              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRequestId(r.id)}
                  className={`p-4 hover:bg-morita-sand/15 cursor-pointer transition-colors border-l-4 ${
                    isSelected
                      ? 'bg-morita-sand/30 border-morita-mulberry'
                      : r.status === 'pendiente' && isRecibida
                      ? 'border-morita-terracotta bg-morita-terracotta/5'
                      : 'border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-[10px] font-bold text-morita-terracotta uppercase tracking-wide">
                      {r.publicationType === 'necesito' ? 'Ayuda 🤝' : 'Interés 🛒'}
                    </span>
                    {getStatusBadge(r.status)}
                  </div>

                  <h3 className="text-xs font-bold text-morita-charcoal mt-1 line-clamp-1">
                    {r.publicationTitle}
                  </h3>

                  <div className="flex items-center space-x-2 mt-2.5">
                    <img
                      src={isRecibida ? r.requesterAvatar : partnerAvatar}
                      alt={partnerName}
                      className="h-6 w-6 rounded-full object-cover border border-morita-sand shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold text-morita-charcoal/80 truncate">
                        {isRecibida ? `De: ${r.requesterName}` : `Para: ${r.publicationTitle}`}
                      </p>
                      <p className="text-[10px] text-morita-charcoal/50 truncate">
                        "{r.comment}"
                      </p>
                    </div>
                  </div>

                  {/* Relative date footer */}
                  <div className="text-[9px] text-morita-charcoal/40 text-right mt-1.5">
                    {new Date(r.createdAt).toLocaleDateString()} a las {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Switching instructions tooltip */}
        <div className="bg-morita-beige/30 p-3 border-t border-morita-sand/50 text-[10px] text-morita-charcoal/60 leading-relaxed shrink-0">
          {currentUser.isAdmin ? (
            <span>💡 <strong>Tip de Admin:</strong> Podés cambiar de vecino en la esquina superior para probar respuestas de prueba.</span>
          ) : (
            <span>💡 <strong>Tip Vecinal:</strong> Coordiná el horario y detalles del favor directamente por el chat privado.</span>
          )}
        </div>

      </div>

      {/* RIGHT COLUMN: Active Request Chat & Controls */}
      <div 
        id="active-chat-col" 
        className={`md:col-span-7 bg-white border border-morita-sand rounded-2xl flex flex-col shadow-xs overflow-hidden min-h-[50vh] ${
          !selectedRequestId ? 'hidden md:flex items-center justify-center bg-morita-beige/10 p-12 text-center' : 'flex'
        }`}
      >
        {!selectedRequest ? (
          <div className="max-w-xs">
            <div className="bg-morita-sand/40 p-4 rounded-full w-fit mx-auto mb-4 text-morita-mulberry">
              <MessageSquare className="h-8 w-8" />
            </div>
            <h3 className="text-base font-serif font-bold text-morita-charcoal">Seleccioná una conversación</h3>
            <p className="text-xs text-morita-charcoal/60 mt-1.5 leading-relaxed">
              Elegí cualquier solicitud del menú izquierdo para ver los detalles de la coordinación, gestionar el estado del pedido, y chatear directamente con tu vecino.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Back Button & Header */}
            <div className="bg-morita-beige/35 border-b border-morita-sand/50 px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5 min-w-0">
                <button
                  onClick={() => setSelectedRequestId(null)}
                  className="p-1.5 rounded-lg hover:bg-morita-sand/40 text-morita-charcoal md:hidden cursor-pointer"
                  title="Volver a la lista"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-morita-charcoal/50 uppercase tracking-wider flex items-center gap-1">
                    {selectedRequest.publicationType === 'necesito' ? 'Coordinando Ayuda 🤝' : 'Coordinando Compra/Contrato 🛒'}
                  </h3>
                  <h2 className="text-sm sm:text-base font-serif font-bold text-morita-charcoal leading-snug break-words">
                    {selectedRequest.publicationTitle}
                  </h2>
                </div>
              </div>
              <div className="shrink-0 pl-1">
                {getStatusBadge(selectedRequest.status)}
              </div>
            </div>

            {/* Quick Publication reference strip */}
            <div className="px-4 py-2 bg-morita-sand/20 border-b border-morita-sand/30 flex flex-wrap items-center justify-between text-xs text-morita-charcoal/70 gap-2">
              <span className="truncate flex items-center gap-2">
                {selectedRequest.publisherId === currentUser.id ? (
                  <>🔑 Tu publicación • Solicitante: <strong>{selectedRequest.requesterName}</strong></>
                ) : (
                  <>👤 Publicado por un vecino • Tu oferta de interés</>
                )}
                {partnerUser && (
                  <a
                    href={getWhatsAppChatLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors text-[10px] font-bold cursor-pointer shrink-0"
                    title={`Chatear con ${partnerUser.name} por WhatsApp`}
                  >
                    <span className="text-[10px] leading-none">🟢</span>
                    <span>WhatsApp</span>
                  </a>
                )}
              </span>
              <div className="flex items-center gap-2">
                {selectedRequest.proposedDateTime && (
                  <span className="text-[11px] font-medium bg-white px-2 py-0.5 rounded-md border border-morita-sand shrink-0">
                    🕒 {selectedRequest.proposedDateTime}
                  </span>
                )}
              </div>
            </div>

            {/* STATE CONTROLS BAR: Changes dynamically based on roles and current status */}
            <div className="p-4 bg-morita-beige/10 border-b border-morita-sand/30 shrink-0">
              {selectedRequest.publisherId === currentUser.id ? (
                // Publisher Controls (Owner)
                <div>
                  {selectedRequest.status === 'pendiente' && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-amber-50 rounded-xl border border-amber-150">
                      <div className="text-xs text-amber-900 font-medium text-center sm:text-left leading-relaxed">
                        <span className="font-bold">¡Nueva solicitud entrante!</span> ¿Aceptás coordinar con este vecino? Al aceptar se habilitará el chat.
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto shrink-0">
                        <button
                          onClick={() => handleStatusChange('rechazada')}
                          className="flex-1 sm:flex-none px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Rechazar
                        </button>
                        <button
                          onClick={() => handleStatusChange('aceptada')}
                          className="flex-1 sm:flex-none px-4 py-1.5 bg-morita-leaf hover:bg-morita-leaf-dark text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-colors"
                        >
                          Aceptar Solicitud
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedRequest.status === 'aceptada' && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-150">
                      <div className="text-xs text-emerald-900 font-medium text-center sm:text-left leading-relaxed">
                        Chateá para coordinar el encuentro o la entrega. Una vez finalizado el intercambio, marcalo como completado.
                      </div>
                      <button
                        onClick={() => handleStatusChange('completada')}
                        className="w-full sm:w-auto px-4 py-2 bg-morita-mulberry hover:bg-morita-mulberry-dark text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-colors"
                      >
                        ✓ Marcar como Completada
                      </button>
                    </div>
                  )}

                  {selectedRequest.status === 'rechazada' && (
                    <div className="text-center p-2 rounded-lg bg-slate-50 border border-slate-150 text-xs text-slate-500 italic">
                      Rechazaste esta solicitud. El vecino interesado fue notificado.
                    </div>
                  )}

                  {selectedRequest.status === 'completada' && (
                    <div className="text-center p-2.5 rounded-xl bg-morita-sand/30 border border-morita-sand text-xs text-morita-charcoal/70 font-semibold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-morita-mulberry" />
                      <span>¡Coordinación completada con éxito! Muchas gracias por fortalecer la red vecinal.</span>
                    </div>
                  )}
                </div>
              ) : (
                // Requester Controls (Interesado)
                <div>
                  {selectedRequest.status === 'pendiente' && (
                    <div className="text-center p-3 rounded-xl bg-amber-50/50 border border-amber-100 text-xs text-amber-800 leading-relaxed font-medium">
                      ⏳ Tu solicitud está esperando que el vecino creador la acepte para empezar a chatear. Recibirás una notificación en cuanto responda. {currentUser.isAdmin && `(Super Admin: podés cambiar de vecino a ${selectedRequestPub?.authorName.split(' ')[0]} arriba para aprobarla).`}
                    </div>
                  )}

                  {selectedRequest.status === 'rechazada' && (
                    <div className="text-center p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 italic">
                      El vecino no pudo aceptar la solicitud en esta oportunidad. ¡No te desanimes, hay muchas ofertas en el feed!
                    </div>
                  )}

                  {selectedRequest.status === 'aceptada' && (
                    <div className="text-center p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-800 font-medium leading-relaxed">
                      💬 ¡Tu solicitud fue aceptada! Ya podés coordinar la fecha, lugar de retiro o detalles en el chat de abajo.
                    </div>
                  )}

                  {selectedRequest.status === 'completada' && (
                    <div>
                      {!showThankYouForm && !submittedThankYou ? (
                        <div className="p-3 bg-morita-sand/30 rounded-xl border border-morita-sand text-center">
                          <p className="text-xs text-morita-charcoal/80 font-semibold mb-2">
                            🎉 ¡Tu vecino marcó este pedido como COMPLETADO! ¿Te gustaría enviarle unas palabras de agradecimiento para su perfil?
                          </p>
                          <button
                            onClick={() => setShowThankYouForm(true)}
                            className="bg-morita-terracotta hover:bg-morita-terracotta-dark text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-xs cursor-pointer transition-colors"
                          >
                            💖 Escribir un Agradecimiento Vecinal
                          </button>
                        </div>
                      ) : showThankYouForm && !submittedThankYou ? (
                        <form onSubmit={handleThankYouSubmit} className="p-3 bg-white border border-morita-sand rounded-xl space-y-2">
                          <label className="block text-xs font-bold text-morita-charcoal/70 uppercase tracking-wider">
                            Escribí tu recomendación o palabras de agradecimiento:
                          </label>
                          <textarea
                            value={thankYouText}
                            onChange={(e) => setThankYouText(e.target.value)}
                            rows={2}
                            placeholder="Ej: Excelente vecina, las empanadas estaban calientes y riquísimas. ¡Súper recomendable!"
                            className="w-full text-xs rounded-lg border border-morita-sand p-2 bg-white"
                            required
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setShowThankYouForm(false)}
                              className="text-[11px] text-morita-charcoal/50 font-semibold px-2 py-1 hover:underline cursor-pointer"
                            >
                              Ahora no
                            </button>
                            <button
                              type="submit"
                              className="bg-morita-terracotta hover:bg-morita-terracotta-dark text-white text-[11px] font-bold px-3 py-1 rounded-lg cursor-pointer"
                            >
                              Publicar Agradecimiento
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="p-3 bg-green-50 rounded-xl border border-green-200 text-center text-xs font-bold text-green-800 animate-pulse">
                          🎉 ¡Muchísimas gracias! Tu comentario de agradecimiento ya fue publicado en el perfil de tu vecino.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* CHAT MESSAGES DISPLAY BOX */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[35vh] md:max-h-[42vh] bg-morita-beige/5">
              
              {/* Initial Solicitation Comment as anchor */}
              <div className="flex justify-center my-2">
                <div className="bg-morita-sand/35 text-morita-charcoal/70 border border-morita-sand/50 px-4 py-2.5 rounded-2xl max-w-md text-[11px] leading-relaxed text-center shadow-2xs">
                  <span className="font-bold block text-morita-mulberry text-xs mb-1">
                    📩 Solicitud de contacto enviada
                  </span>
                  "{selectedRequest.comment}"
                </div>
              </div>

              {selectedRequestMessages.map((msg) => {
                const isMine = msg.senderId === currentUser.id;
                
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-3xs ${
                        isMine
                          ? 'bg-morita-mulberry text-white rounded-br-none'
                          : 'bg-morita-sand text-morita-charcoal rounded-bl-none border border-morita-sand/50'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span className={`text-[8px] block text-right mt-1 opacity-70 ${
                        isMine ? 'text-white/80' : 'text-morita-charcoal/50'
                      }`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* CHAT INPUT FORM */}
            <form 
              onSubmit={handleSendMessage} 
              className="p-3 bg-white border-t border-morita-sand/50 flex gap-2 shrink-0 items-center bg-morita-beige/10"
            >
              <input
                id="chat-input-text"
                type="text"
                placeholder={
                  selectedRequest.status === 'pendiente' 
                    ? 'Esperando aceptación para chatear...' 
                    : selectedRequest.status === 'rechazada'
                    ? 'No se puede enviar mensajes (Rechazada)'
                    : 'Escribí un mensaje de coordinación al vecino...'
                }
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                disabled={selectedRequest.status === 'pendiente' || selectedRequest.status === 'rechazada'}
                className="flex-1 text-xs rounded-lg border border-morita-sand/80 px-3.5 py-2.5 bg-white disabled:bg-slate-50 disabled:text-slate-400 placeholder:text-morita-charcoal/30 focus:outline-hidden focus:ring-2 focus:ring-morita-mulberry/40"
              />
              <button
                type="submit"
                disabled={!typedMessage.trim() || selectedRequest.status === 'pendiente' || selectedRequest.status === 'rechazada'}
                className="bg-morita-mulberry hover:bg-morita-mulberry-dark disabled:bg-slate-200 disabled:text-slate-400 text-white p-2.5 rounded-lg shrink-0 transition-colors cursor-pointer"
                title="Enviar mensaje"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </>
        )}
      </div>

    </div>
  );
}
