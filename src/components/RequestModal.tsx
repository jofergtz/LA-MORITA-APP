import React, { useState } from 'react';
import { Publication, User } from '../types';
import { X, MessageSquare, Calendar, Sparkles, ShoppingBag, HeartHandshake, Clock } from 'lucide-react';

interface RequestModalProps {
  isOpen: boolean;
  publication: Publication | null;
  currentUser: User;
  publisher?: User | null;
  onClose: () => void;
  onSubmit: (data: {
    comment: string;
    quantity?: number;
    proposedDateTime?: string;
  }) => void;
}

const formatFriendlyDate = (dateStr: string) => {
  if (!dateStr) return '';
  const dateObj = new Date(dateStr + 'T00:00:00');
  if (isNaN(dateObj.getTime())) return dateStr;
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const dayName = days[dateObj.getDay()];
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  return `${dayName} ${dd}/${mm}`;
};

export default function RequestModal({
  isOpen,
  publication,
  currentUser,
  publisher,
  onClose,
  onSubmit
}: RequestModalProps) {
  const [comment, setComment] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [scheduleMode, setScheduleMode] = useState<'picker' | 'text'>('picker');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('cualquiera');
  const [specificTime, setSpecificTime] = useState('');
  const [freeTextSchedule, setFreeTextSchedule] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !publication) return null;

  const cleanPhone = (phoneStr: string) => {
    const clean = phoneStr.replace(/[^\d+]/g, '');
    if (!clean.startsWith('+') && !clean.startsWith('54')) {
      return '549' + clean;
    }
    return clean;
  };

  const getWhatsAppLink = () => {
    if (!publisher || !publication) return '';
    const customText = comment.trim() 
      ? `Hola ${publication.authorName}! Vi tu publicación "${publication.title}" en La Morita. ${comment.trim()}`
      : `Hola ${publication.authorName}! Vi tu publicación "${publication.title}" en La Morita y me interesó contactarte.`;
    return `https://wa.me/${cleanPhone(publisher.phone)}?text=${encodeURIComponent(customText)}`;
  };

  const isProduct = publication.type === 'vendo';
  const isHelp = publication.type === 'necesito';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!comment.trim()) {
      setError('Por favor, escribí un comentario amigable para tu vecino.');
      return;
    }

    let finalSchedule = '';
    if (scheduleMode === 'picker') {
      if (selectedDate) {
        const dateFormatted = formatFriendlyDate(selectedDate);
        let timeLabel = '';
        if (selectedTimeSlot === 'cualquiera') {
          timeLabel = 'en cualquier horario';
        } else if (selectedTimeSlot === 'manana') {
          timeLabel = 'por la mañana (08:00 a 12:00)';
        } else if (selectedTimeSlot === 'mediodia') {
          timeLabel = 'al mediodía (12:00 a 14:00)';
        } else if (selectedTimeSlot === 'tarde') {
          timeLabel = 'por la tarde (14:00 a 19:00)';
        } else if (selectedTimeSlot === 'noche') {
          timeLabel = 'por la noche (19:00 a 22:00)';
        } else if (selectedTimeSlot === 'especifico' && specificTime) {
          timeLabel = `a las ${specificTime} hs`;
        } else {
          timeLabel = 'en cualquier horario';
        }
        finalSchedule = `${dateFormatted}, ${timeLabel}`;
      } else {
        finalSchedule = 'A coordinar';
      }
    } else {
      finalSchedule = freeTextSchedule.trim();
    }

    onSubmit({
      comment: comment.trim(),
      quantity: isProduct ? quantity : undefined,
      proposedDateTime: finalSchedule || undefined
    });

    // Reset fields
    setComment('');
    setQuantity(1);
    setSelectedDate('');
    setSelectedTimeSlot('cualquiera');
    setSpecificTime('');
    setFreeTextSchedule('');
    onClose();
  };

  return (
    <div id="request-modal-overlay" className="fixed inset-0 z-50 overflow-y-auto bg-morita-charcoal/60 backdrop-blur-xs p-3 sm:p-6 flex items-center justify-center min-h-full">
      <div 
        id="request-modal-content" 
        className="bg-white rounded-2xl border border-morita-sand shadow-2xl w-full max-w-lg my-auto max-h-[88vh] overflow-y-auto flex flex-col touch-pan-y animate-fade-in"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-morita-sand/50 bg-morita-beige/30 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-full ${isHelp ? 'bg-morita-leaf/10 text-morita-leaf' : 'bg-morita-mulberry/10 text-morita-mulberry'}`}>
              {isHelp ? <HeartHandshake className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-morita-charcoal/50 uppercase tracking-wider">
                {isHelp ? 'Responder Pedido de Ayuda' : 'Enviar Solicitud de Interés'}
              </h3>
              <h2 className="text-base font-serif font-bold text-morita-charcoal leading-tight truncate max-w-xs sm:max-w-md">
                {publication.title}
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-morita-sand/40 text-morita-charcoal/60 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-2.5 text-xs font-semibold">
              ⚠️ {error}
            </div>
          )}

          {/* Publisher Quick Info Card */}
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-morita-beige/40 border border-morita-sand/40">
            <img
              src={publication.authorAvatar}
              alt={publication.authorName}
              className="h-8 w-8 rounded-full object-cover border border-morita-sand"
            />
            <div className="flex-1 min-w-0">
              <span className="text-xs text-morita-charcoal/60 block">Le vas a escribir a:</span>
              <span className="text-xs font-bold text-morita-charcoal block">
                {publication.authorName} <span className="text-morita-charcoal/50 font-normal">({publication.zone})</span>
              </span>
            </div>
          </div>

          {/* Comment text area */}
          <div>
            <label className="block text-xs font-bold text-morita-charcoal/70 mb-1.5 uppercase tracking-wider">
              {isHelp ? '¿Cómo podés dar una mano? *' : 'Mensaje inicial para coordinar *'}
            </label>
            <textarea
              rows={3}
              placeholder={
                isHelp 
                  ? 'Hola vecino, yo tengo una herramienta de esas que te puedo prestar mañana. Avisame si te sirve...'
                  : 'Hola, me interesan mucho las salteñas/cuñapés. ¿Podría retirarlos este sábado por la mañana? Muchas gracias...'
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full text-xs rounded-lg border border-morita-sand p-2.5 bg-white focus:ring-2 focus:ring-morita-mulberry/40"
              required
            />
            <p className="text-[10px] text-morita-charcoal/40 mt-1">
              Sé amable y respetuoso. ¡La confianza mutua es lo que hace fuerte al barrio!
            </p>
          </div>

          {/* Conditional inputs based on type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {isProduct && (
              <div>
                <label className="block text-xs font-bold text-morita-charcoal/70 mb-1.5 uppercase tracking-wider">
                  Cantidad deseada
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-8 w-8 rounded-lg border border-morita-sand flex items-center justify-center text-sm font-bold text-morita-charcoal hover:bg-morita-beige cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-morita-charcoal">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-8 w-8 rounded-lg border border-morita-sand flex items-center justify-center text-sm font-bold text-morita-charcoal hover:bg-morita-beige cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className={`${isProduct ? 'sm:col-span-1' : 'sm:col-span-2'}`}>
              <label className="block text-xs font-bold text-morita-charcoal/70 mb-1.5 uppercase tracking-wider">
                Fecha / Horario sugerido
              </label>
              
              <div className="bg-morita-sand/15 p-2.5 rounded-xl border border-morita-sand/35 space-y-2">
                {/* Mode Tabs */}
                <div className="flex border-b border-morita-sand/30 pb-2">
                  <button
                    type="button"
                    onClick={() => setScheduleMode('picker')}
                    className={`flex-1 text-center py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                      scheduleMode === 'picker'
                        ? 'bg-morita-mulberry text-white shadow-3xs'
                        : 'text-morita-charcoal/60 hover:bg-morita-sand/30'
                    }`}
                  >
                    📅 Elegir de Calendario
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleMode('text')}
                    className={`flex-1 text-center py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                      scheduleMode === 'text'
                        ? 'bg-morita-mulberry text-white shadow-3xs'
                        : 'text-morita-charcoal/60 hover:bg-morita-sand/30'
                    }`}
                  >
                    ✍️ Texto Libre
                  </button>
                </div>

                {scheduleMode === 'picker' ? (
                  <div className="space-y-2">
                    {/* Date Picker */}
                    <div>
                      <span className="block text-[9px] font-bold text-morita-charcoal/50 uppercase mb-1">Día sugerido:</span>
                      <div className="relative">
                        <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-morita-charcoal/40" />
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-full text-xs rounded-lg border border-morita-sand pl-8 pr-2.5 py-1.5 bg-white focus:ring-1 focus:ring-morita-mulberry/40"
                        />
                      </div>
                    </div>

                    {/* Time Picker / Editor */}
                    <div>
                      <span className="block text-[9px] font-bold text-morita-charcoal/50 uppercase mb-1">Horario sugerido:</span>
                      <div className="grid grid-cols-1 gap-1.5">
                        <select
                          value={selectedTimeSlot}
                          onChange={(e) => setSelectedTimeSlot(e.target.value)}
                          className="w-full text-xs rounded-lg border border-morita-sand px-2 py-1.5 bg-white focus:ring-1 focus:ring-morita-mulberry/40"
                        >
                          <option value="cualquiera">Cualquier horario</option>
                          <option value="manana">Por la mañana (08:00 a 12:00)</option>
                          <option value="mediodia">Al mediodía (12:00 a 14:00)</option>
                          <option value="tarde">Por la tarde (14:00 a 19:00)</option>
                          <option value="noche">Por la noche (19:00 a 22:00)</option>
                          <option value="especifico">Especificar hora exacta...</option>
                        </select>

                        {selectedTimeSlot === 'especifico' && (
                          <div className="relative mt-1">
                            <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-morita-charcoal/40" />
                            <input
                              type="time"
                              value={specificTime}
                              onChange={(e) => setSpecificTime(e.target.value)}
                              className="w-full text-xs rounded-lg border border-morita-sand pl-8 pr-2.5 py-1.5 bg-white focus:ring-1 focus:ring-morita-mulberry/40"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="block text-[9px] font-bold text-morita-charcoal/50 uppercase mb-1">Escribí día y horario:</span>
                    <input
                      type="text"
                      placeholder="Ej: Sábados por la tarde, o de lunes a viernes desde las 18 hs"
                      value={freeTextSchedule}
                      onChange={(e) => setFreeTextSchedule(e.target.value)}
                      className="w-full text-xs rounded-lg border border-morita-sand px-2.5 py-1.5 bg-white focus:ring-1 focus:ring-morita-mulberry/40"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {publisher && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-150 flex items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5 min-w-0">
                <span className="text-xl shrink-0">💬</span>
                <div className="min-w-0">
                  <h4 className="text-[11px] font-bold text-emerald-950 uppercase tracking-wide">¿Coordinar directo por WhatsApp?</h4>
                  <p className="text-[10px] text-emerald-850 leading-tight truncate">Contactá a {publication.authorName} por chat privado.</p>
                </div>
              </div>
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] py-1.5 px-3 rounded-lg flex items-center space-x-1.5 transition-colors shrink-0 cursor-pointer shadow-3xs"
              >
                <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                <span>Escribirle</span>
              </a>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-3 border-t border-morita-sand/40 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg hover:bg-morita-sand/50 text-morita-charcoal/70 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-lg text-xs font-bold text-white shadow-xs transition-colors cursor-pointer flex items-center space-x-1 ${
                isHelp 
                  ? 'bg-morita-leaf hover:bg-morita-leaf-dark'
                  : 'bg-morita-mulberry hover:bg-morita-mulberry-dark'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>
                {isHelp ? 'Ofrecer mi ayuda' : 'Enviar mi interés'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
