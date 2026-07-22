import React, { useState, useEffect, useRef } from 'react';
import { User, PublicationType, CategoryType, Publication } from '../types';
import { X, Image, MapPin, Clock, Sparkles, HelpCircle, Check, Map, Search, ExternalLink, Camera, Upload, Link, RefreshCw, ShieldAlert, Trash2 } from 'lucide-react';
import { compressImageDataUrl, compressImageFile } from '../utils/imageCompressor';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  publicationToEdit?: Publication | null;
  onDeletePublication?: (id: string) => void;
  onSubmit: (data: {
    type: PublicationType;
    title: string;
    category: CategoryType;
    description: string;
    priceType: 'monto' | 'a-consultar' | 'intercambio';
    priceValue?: string;
    photo?: string;
    zone: string;
    availability?: string;
  }, id?: string) => void;
}

const photoPresets = [
  {
    name: 'Comida / Panadería',
    url: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80',
    emoji: '🥟'
  },
  {
    name: 'Herramientas / Arreglos',
    url: 'https://images.unsplash.com/photo-1530124560072-a059b014b37d?w=600&auto=format&fit=crop&q=80',
    emoji: '🔧'
  },
  {
    name: 'Jardín / Plantas / Exterior',
    url: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=600&auto=format&fit=crop&q=80',
    emoji: '🌱'
  },
  {
    name: 'Clases / Libros / Computación',
    url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
    emoji: '📚'
  },
  {
    name: 'Mascotas / Perros / Gatos',
    url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=80',
    emoji: '🐶'
  },
  {
    name: 'Reparaciones del hogar',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    emoji: '🏠'
  }
];

export default function PublishModal({ isOpen, onClose, currentUser, publicationToEdit, onDeletePublication, onSubmit }: PublishModalProps) {
  const [type, setType] = useState<PublicationType>('vendo');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryType>('Productos');
  const [description, setDescription] = useState('');
  const [priceType, setPriceType] = useState<'monto' | 'a-consultar' | 'intercambio'>('monto');
  const [priceValue, setPriceValue] = useState('');
  const [photo, setPhoto] = useState('');
  const [photoPresetIndex, setPhotoPresetIndex] = useState<number | null>(null);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [useCustomPhoto, setUseCustomPhoto] = useState(false);
  const [zone, setZone] = useState('');
  const [availability, setAvailability] = useState('');
  const [scheduleMode, setScheduleMode] = useState<'picker' | 'text'>('picker');
  const [availDaysType, setAvailDaysType] = useState<'todos' | 'lv' | 'fds' | 'custom'>('lv');
  const [availCustomDays, setAvailCustomDays] = useState<string[]>(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']);
  const [availTimeType, setAvailTimeType] = useState<'todo-dia' | 'manana' | 'tarde' | 'noche' | 'custom'>('tarde');
  const [availStartTime, setAvailStartTime] = useState('16:00');
  const [availEndTime, setAvailEndTime] = useState('20:00');
  const [error, setError] = useState('');
  const [showMapAssistant, setShowMapAssistant] = useState(false);
  const [mapSearchText, setMapSearchText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Photo Source management
  const [activePhotoSource, setActivePhotoSource] = useState<'upload' | 'camera' | 'link'>('upload');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState('');
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Handle Edit vs Create pre-population
  useEffect(() => {
    if (isOpen) {
      setShowDeleteConfirm(false);
      if (publicationToEdit) {
        setType(publicationToEdit.type);
        setTitle(publicationToEdit.title);
        setCategory(publicationToEdit.category);
        setDescription(publicationToEdit.description);
        setPriceType(publicationToEdit.priceType);
        setPriceValue(publicationToEdit.priceValue || '');
        setPhoto(publicationToEdit.photo || '');
        setCustomPhotoUrl(publicationToEdit.photo || '');
        setUseCustomPhoto(!!publicationToEdit.photo);
        
        if (publicationToEdit.photo) {
          if (publicationToEdit.photo.startsWith('data:image/')) {
            setActivePhotoSource('upload');
          } else {
            setActivePhotoSource('link');
          }
        } else {
          setActivePhotoSource('upload');
        }

        setZone(publicationToEdit.zone);
        setAvailability(publicationToEdit.availability || '');
        setScheduleMode('text');
      } else {
        setType('vendo');
        setTitle('');
        setCategory('Productos');
        setDescription('');
        setPriceType('monto');
        setPriceValue('');
        setPhoto('');
        setPhotoPresetIndex(null);
        setCustomPhotoUrl('');
        setUseCustomPhoto(false);
        setActivePhotoSource('upload');
        setZone(currentUser ? currentUser.zone : '');
        setAvailability('');
        setScheduleMode('picker');
        setAvailDaysType('lv');
        setAvailCustomDays(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']);
        setAvailTimeType('tarde');
        setAvailStartTime('16:00');
        setAvailEndTime('20:00');
      }
      setShowMapAssistant(false);
    }
  }, [isOpen, publicationToEdit, currentUser]);

  // Automatically update the availability text from choices in picker mode
  useEffect(() => {
    if (scheduleMode === 'picker' && !publicationToEdit) {
      let daysText = '';
      if (availDaysType === 'todos') {
        daysText = 'Todos los días';
      } else if (availDaysType === 'lv') {
        daysText = 'Lunes a Viernes';
      } else if (availDaysType === 'fds') {
        daysText = 'Sábados y Domingos';
      } else if (availDaysType === 'custom') {
        if (availCustomDays.length === 0) {
          daysText = 'Días a coordinar';
        } else if (availCustomDays.length === 7) {
          daysText = 'Todos los días';
        } else {
          // Sort the custom days in correct calendar order
          const order = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
          const sorted = [...availCustomDays].sort((a, b) => order.indexOf(a) - order.indexOf(b));
          daysText = sorted.join(', ');
        }
      }

      let hoursText = '';
      if (availTimeType === 'todo-dia') {
        hoursText = 'todo el día';
      } else if (availTimeType === 'manana') {
        hoursText = 'de 08:00 a 12:00 hs';
      } else if (availTimeType === 'tarde') {
        hoursText = 'de 16:00 a 20:00 hs';
      } else if (availTimeType === 'noche') {
        hoursText = 'de 19:00 a 22:30 hs';
      } else if (availTimeType === 'custom') {
        if (availStartTime && availEndTime) {
          hoursText = `de ${availStartTime} a ${availEndTime} hs`;
        } else {
          hoursText = 'en horario a coordinar';
        }
      }

      setAvailability(`${daysText} ${hoursText}`);
    }
  }, [scheduleMode, availDaysType, availCustomDays, availTimeType, availStartTime, availEndTime, publicationToEdit]);

  const toggleCustomDay = (day: string) => {
    setAvailCustomDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // Sync category based on publication type ONLY in create mode
  useEffect(() => {
    if (!publicationToEdit) {
      if (type === 'vendo') {
        setCategory('Productos');
        setPriceType('monto');
      } else if (type === 'ofrezco') {
        setCategory('Servicios');
        setPriceType('monto');
      } else if (type === 'necesito') {
        setCategory('Ayuda vecinal');
        setPriceType('intercambio');
      }
    }
  }, [type, publicationToEdit]);

  // Camera and File upload handlers & effects
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, activePhotoSource]);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  useEffect(() => {
    if (!isOpen || activePhotoSource !== 'camera') {
      stopCamera();
    }
  }, [isOpen, activePhotoSource]);

  const startCamera = async () => {
    setCameraError('');
    setIsCameraStarting(true);
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
      setCameraStream(stream);
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      setCameraError('No se pudo acceder a la cámara. Verificá los permisos de tu navegador.');
    } finally {
      setIsCameraStarting(false);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement('canvas');
    canvas.width = Math.min(video.videoWidth || 600, 600);
    canvas.height = Math.min(video.videoHeight || 600, 600);
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const rawUrl = canvas.toDataURL('image/jpeg', 0.7);
      const compressed = await compressImageDataUrl(rawUrl, 600, 600, 0.7);
      setPhoto(compressed);
      setPhotoPresetIndex(null);
      setUseCustomPhoto(true);
      stopCamera();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecciona un archivo de imagen válido.');
      return;
    }

    const compressed = await compressImageFile(file, 600, 600, 0.7);
    if (compressed) {
      setPhoto(compressed);
      setPhotoPresetIndex(null);
      setUseCustomPhoto(true);
    }
  };

  if (!isOpen) return null;

  if (currentUser.id === 'guest') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-morita-charcoal/60 backdrop-blur-xs animate-fade-in">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-morita-sand text-center space-y-4">
          <div className="p-3 bg-amber-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto text-amber-800">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-serif font-bold text-morita-charcoal">
            Función reservada para vecinos registrados
          </h3>
          <p className="text-xs text-morita-charcoal/70 leading-relaxed">
            Como visitante sin cuenta podés explorar todas las publicaciones del barrio, pero para publicar un aviso, servicio o pedido necesitás iniciar sesión o registrarte como vecino de La Morita.
          </p>
          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-6 rounded-xl text-xs font-bold bg-morita-mulberry hover:bg-morita-mulberry-dark text-white shadow-xs transition-colors cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handlePresetSelect = (index: number, url: string) => {
    setPhotoPresetIndex(index);
    setPhoto(url);
    setUseCustomPhoto(false);
  };

  const handleCustomPhotoChange = (url: string) => {
    setCustomPhotoUrl(url);
    setPhoto(url);
    setPhotoPresetIndex(null);
    setUseCustomPhoto(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Por favor, ingresá un título descriptivo.');
      return;
    }
    if (title.length < 5) {
      setError('El título debe tener al menos 5 caracteres.');
      return;
    }
    if (!description.trim()) {
      setError('Por favor, detallá de qué se trata en la descripción.');
      return;
    }
    if (priceType === 'monto' && !priceValue.trim()) {
      setError('Por favor, indicá el precio (ej: "Bs. 50 la docena", "Bs. 35 por hora").');
      return;
    }
    if (!zone.trim()) {
      setError('Por favor, ingresá una calle o zona orientativa para el barrio.');
      return;
    }

    const finalPhoto = photo ? await compressImageDataUrl(photo, 600, 600, 0.7) : undefined;

    onSubmit({
      type,
      title: title.trim(),
      category,
      description: description.trim(),
      priceType,
      priceValue: priceType === 'monto' ? priceValue.trim() : undefined,
      photo: finalPhoto,
      zone: zone.trim(),
      availability: availability.trim() || undefined
    }, publicationToEdit?.id);

    // Reset Form
    setTitle('');
    setDescription('');
    setPriceValue('');
    setPhoto('');
    setPhotoPresetIndex(null);
    setCustomPhotoUrl('');
    setUseCustomPhoto(false);
    setAvailability('');
    setScheduleMode('picker');
    setAvailDaysType('lv');
    setAvailCustomDays(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']);
    setAvailTimeType('tarde');
    setAvailStartTime('16:00');
    setAvailEndTime('20:00');
    setShowMapAssistant(false);
    setMapSearchText('');
    onClose();
  };

  return (
    <div id="publish-modal-overlay" className="fixed inset-0 z-50 overflow-y-auto bg-morita-charcoal/60 backdrop-blur-xs p-3 sm:p-6 flex items-center justify-center min-h-full">
      <div 
        id="publish-modal-content" 
        className="bg-white rounded-2xl border border-morita-sand shadow-2xl w-full max-w-2xl my-auto max-h-[88vh] overflow-y-auto flex flex-col touch-pan-y animate-fade-in"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-morita-sand/60 flex items-center justify-between bg-morita-beige/35">
          <div className="flex items-center space-x-2">
            <span className="text-xl">📢</span>
            <div>
              <h2 className="text-lg font-serif font-bold text-morita-charcoal">
                {publicationToEdit ? 'Editar mi publicación en el barrio' : 'Crear nueva publicación en el barrio'}
              </h2>
              <p className="text-[11px] text-morita-charcoal/50 leading-none">
                Como vecino activo: {currentUser.name}
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

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-5 flex-1">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-xs font-semibold">
              ⚠️ {error}
            </div>
          )}

          {/* 1. Publication Type */}
          <div>
            <label className="block text-xs font-bold text-morita-charcoal/70 mb-2 uppercase tracking-wider">
              ¿Qué tipo de publicación es?
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setType('vendo')}
                className={`py-3 px-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                  type === 'vendo'
                    ? 'border-morita-terracotta bg-morita-terracotta/10 text-morita-terracotta font-bold'
                    : 'border-morita-sand text-morita-charcoal/70 hover:bg-morita-beige/50'
                }`}
              >
                <span className="text-lg">🛍️</span>
                <span className="text-xs">Vendo un producto</span>
              </button>
              <button
                type="button"
                onClick={() => setType('ofrezco')}
                className={`py-3 px-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                  type === 'ofrezco'
                    ? 'border-morita-mulberry bg-morita-mulberry/10 text-morita-mulberry font-bold'
                    : 'border-morita-sand text-morita-charcoal/70 hover:bg-morita-beige/50'
                }`}
              >
                <span className="text-lg">🛠️</span>
                <span className="text-xs">Ofrezco un servicio</span>
              </button>
              <button
                type="button"
                onClick={() => setType('necesito')}
                className={`py-3 px-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                  type === 'necesito'
                    ? 'border-morita-leaf bg-morita-leaf/10 text-morita-leaf font-bold'
                    : 'border-morita-sand text-morita-charcoal/70 hover:bg-morita-beige/50'
                }`}
              >
                <span className="text-lg">🤝</span>
                <span className="text-xs">Necesito ayuda / Pedido</span>
              </button>
            </div>
          </div>

          {/* 2. Title and Category */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-morita-charcoal/70 mb-1.5 uppercase tracking-wider">
                Título corto de la publicación *
              </label>
              <input
                type="text"
                maxLength={65}
                placeholder={
                  type === 'vendo' ? 'Ej: Docena de empanadas de carne' :
                  type === 'ofrezco' ? 'Ej: Clases de dibujo para niños' :
                  'Ej: Busco taladro prestado para el sábado'
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs rounded-lg border border-morita-sand p-2.5 bg-white focus:ring-2 focus:ring-morita-mulberry/40"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-morita-charcoal/70 mb-2 uppercase tracking-wider">
                Categoría de la publicación *
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'Productos', label: 'Productos', emoji: '🛍️' },
                  { value: 'Servicios', label: 'Servicios', emoji: '🛠️' },
                  { value: 'Comida', label: 'Comida', emoji: '🥟' },
                  { value: 'Reparaciones', label: 'Reparaciones', emoji: '🔧' },
                  { value: 'Clases/Tutorías', label: 'Clases/Tutorías', emoji: '📚' },
                  { value: 'Ayuda vecinal', label: 'Ayuda vecinal', emoji: '🤝' },
                  { value: 'Otros', label: 'Otros', emoji: '🌟' }
                ].map((opt) => {
                  const isSelected = category === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setCategory(opt.value as CategoryType)}
                      className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-morita-mulberry bg-morita-mulberry/10 text-morita-mulberry shadow-2xs'
                          : 'border-morita-sand bg-white text-morita-charcoal/70 hover:bg-morita-sand/15'
                      }`}
                    >
                      <span className="text-sm">{opt.emoji}</span>
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Description */}
          <div>
            <label className="block text-xs font-bold text-morita-charcoal/70 mb-1.5 uppercase tracking-wider">
              Detalles / Descripción *
            </label>
            <textarea
              rows={3}
              placeholder="Explicá con tus palabras qué ofrecés, qué vendés o exactamente qué necesitás y en qué condiciones..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs rounded-lg border border-morita-sand p-2.5 bg-white focus:ring-2 focus:ring-morita-mulberry/40"
              required
            />
          </div>

          {/* 4. Price & Availability */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Price section */}
            <div className="bg-morita-beige/25 p-3 rounded-xl border border-morita-sand/50">
              <label className="block text-xs font-bold text-morita-charcoal/70 mb-1.5 uppercase tracking-wider">
                Precio / Retribución
              </label>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setPriceType('monto')}
                  className={`flex-1 py-1 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                    priceType === 'monto'
                      ? 'bg-morita-mulberry border-morita-mulberry text-white'
                      : 'border-morita-sand text-morita-charcoal/60'
                  }`}
                >
                  Monto Fijo
                </button>
                <button
                  type="button"
                  onClick={() => setPriceType('a-consultar')}
                  className={`flex-1 py-1 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                    priceType === 'a-consultar'
                      ? 'bg-morita-mulberry border-morita-mulberry text-white'
                      : 'border-morita-sand text-morita-charcoal/60'
                  }`}
                >
                  A Consultar
                </button>
                <button
                  type="button"
                  onClick={() => setPriceType('intercambio')}
                  className={`flex-1 py-1 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                    priceType === 'intercambio'
                      ? 'bg-morita-mulberry border-morita-mulberry text-white'
                      : 'border-morita-sand text-morita-charcoal/60'
                  }`}
                >
                  Favor / Trueque
                </button>
              </div>

              {priceType === 'monto' && (
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-morita-charcoal/50">Bs.</span>
                  <input
                    type="text"
                    placeholder="Ej: 50 total, 25 por hora, 120 la docena..."
                    value={priceValue}
                    onChange={(e) => setPriceValue(e.target.value)}
                    className="w-full text-xs rounded-lg border border-morita-sand pl-9 pr-2.5 py-1.5 bg-white"
                    required
                  />
                </div>
              )}
              {priceType === 'a-consultar' && (
                <p className="text-[10px] text-morita-charcoal/50 leading-relaxed italic mt-2">
                  Se coordinará el precio directamente con los interesados mediante el chat de la solicitud.
                </p>
              )}
              {priceType === 'intercambio' && (
                <p className="text-[10px] text-morita-charcoal/50 leading-relaxed italic mt-2">
                  Ideal para pedidos de ayuda. Podés poner un intercambio simbólico (ej: "regalo somó helado", "intercambio favor").
                </p>
              )}
            </div>

            {/* Availability / Schedule */}
            <div className="bg-morita-beige/25 p-3.5 rounded-xl border border-morita-sand/50 space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-morita-charcoal/70 uppercase tracking-wider">
                  Días y Horas Disponibles *
                </label>
                {/* Mode Selector */}
                <div className="flex border border-morita-sand/60 rounded-md overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setScheduleMode('picker')}
                    className={`px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer ${
                      scheduleMode === 'picker'
                        ? 'bg-morita-mulberry text-white'
                        : 'text-morita-charcoal/60 hover:bg-morita-sand/15'
                    }`}
                  >
                    🗓️ Asistente
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleMode('text')}
                    className={`px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer ${
                      scheduleMode === 'text'
                        ? 'bg-morita-mulberry text-white'
                        : 'text-morita-charcoal/60 hover:bg-morita-sand/15'
                    }`}
                  >
                    ✍️ Texto Libre
                  </button>
                </div>
              </div>

              {scheduleMode === 'picker' ? (
                <div className="space-y-3 bg-white p-3 rounded-lg border border-morita-sand/40">
                  {/* Days Section */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-bold text-morita-charcoal/50 uppercase">1. ¿Qué días podés?</span>
                    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                      <button
                        type="button"
                        onClick={() => setAvailDaysType('lv')}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                          availDaysType === 'lv'
                            ? 'bg-morita-mulberry/10 border-morita-mulberry text-morita-mulberry'
                            : 'border-morita-sand hover:bg-morita-sand/10 text-morita-charcoal/70'
                        }`}
                      >
                        Lunes a Viernes
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvailDaysType('fds')}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                          availDaysType === 'fds'
                            ? 'bg-morita-mulberry/10 border-morita-mulberry text-morita-mulberry'
                            : 'border-morita-sand hover:bg-morita-sand/10 text-morita-charcoal/70'
                        }`}
                      >
                        Fin de semana
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvailDaysType('todos')}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                          availDaysType === 'todos'
                            ? 'bg-morita-mulberry/10 border-morita-mulberry text-morita-mulberry'
                            : 'border-morita-sand hover:bg-morita-sand/10 text-morita-charcoal/70'
                        }`}
                      >
                        Todos los días
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvailDaysType('custom')}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                          availDaysType === 'custom'
                            ? 'bg-morita-mulberry/10 border-morita-mulberry text-morita-mulberry'
                            : 'border-morita-sand hover:bg-morita-sand/10 text-morita-charcoal/70'
                        }`}
                      >
                        Elegir días...
                      </button>
                    </div>

                    {availDaysType === 'custom' && (
                      <div className="flex flex-wrap gap-1.5 pt-1.5">
                        {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => {
                          const isSelected = availCustomDays.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => toggleCustomDay(day)}
                              className={`px-2 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-morita-mulberry text-white border-morita-mulberry'
                                  : 'bg-white border-morita-sand hover:bg-morita-sand/10 text-morita-charcoal/60'
                              }`}
                            >
                              {day.slice(0, 3)}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Hours Section */}
                  <div className="space-y-1.5 pt-2 border-t border-morita-sand/30">
                    <span className="block text-[10px] font-bold text-morita-charcoal/50 uppercase">2. ¿En qué horario?</span>
                    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-5">
                      <button
                        type="button"
                        onClick={() => setAvailTimeType('manana')}
                        className={`py-1.5 px-1 text-center rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                          availTimeType === 'manana'
                            ? 'bg-morita-mulberry/10 border-morita-mulberry text-morita-mulberry'
                            : 'border-morita-sand hover:bg-morita-sand/10 text-morita-charcoal/70'
                        }`}
                      >
                        🌅 Mañana
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvailTimeType('tarde')}
                        className={`py-1.5 px-1 text-center rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                          availTimeType === 'tarde'
                            ? 'bg-morita-mulberry/10 border-morita-mulberry text-morita-mulberry'
                            : 'border-morita-sand hover:bg-morita-sand/10 text-morita-charcoal/70'
                        }`}
                      >
                        🌇 Tarde
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvailTimeType('noche')}
                        className={`py-1.5 px-1 text-center rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                          availTimeType === 'noche'
                            ? 'bg-morita-mulberry/10 border-morita-mulberry text-morita-mulberry'
                            : 'border-morita-sand hover:bg-morita-sand/10 text-morita-charcoal/70'
                        }`}
                      >
                        🌌 Noche
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvailTimeType('todo-dia')}
                        className={`py-1.5 px-1 text-center rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                          availTimeType === 'todo-dia'
                            ? 'bg-morita-mulberry/10 border-morita-mulberry text-morita-mulberry'
                            : 'border-morita-sand hover:bg-morita-sand/10 text-morita-charcoal/70'
                        }`}
                      >
                        🕒 Todo el día
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvailTimeType('custom')}
                        className={`py-1.5 px-1 text-center rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                          availTimeType === 'custom'
                            ? 'bg-morita-mulberry/10 border-morita-mulberry text-morita-mulberry'
                            : 'border-morita-sand hover:bg-morita-sand/10 text-morita-charcoal/70'
                        }`}
                      >
                        ⏱️ Personalizar
                      </button>
                    </div>

                    {availTimeType === 'custom' && (
                      <div className="flex items-center gap-2 pt-2 justify-center max-w-xs mx-auto">
                        <div className="flex-1">
                          <span className="block text-[8px] font-bold text-morita-charcoal/40 uppercase mb-0.5">Desde:</span>
                          <input
                            type="time"
                            value={availStartTime}
                            onChange={(e) => setAvailStartTime(e.target.value)}
                            className="w-full text-xs rounded-lg border border-morita-sand px-2 py-1 bg-white focus:ring-1 focus:ring-morita-mulberry/40"
                          />
                        </div>
                        <span className="text-xs text-morita-charcoal/40 mt-3">a</span>
                        <div className="flex-1">
                          <span className="block text-[8px] font-bold text-morita-charcoal/40 uppercase mb-0.5">Hasta:</span>
                          <input
                            type="time"
                            value={availEndTime}
                            onChange={(e) => setAvailEndTime(e.target.value)}
                            className="w-full text-xs rounded-lg border border-morita-sand px-2 py-1 bg-white focus:ring-1 focus:ring-morita-mulberry/40"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Formatted Preview */}
                  <div className="pt-2 border-t border-morita-sand/30 flex items-center justify-between">
                    <span className="text-[9px] font-bold text-morita-charcoal/40 uppercase">Vista previa:</span>
                    <span className="text-[10px] font-bold bg-morita-leaf/10 text-morita-leaf px-2.5 py-0.5 rounded-full border border-morita-leaf/25">
                      {availability}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-morita-charcoal/40" />
                  <input
                    type="text"
                    placeholder="Ej: Sábados de 11:30 a 14:30 hs..."
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full text-xs rounded-lg border border-morita-sand pl-8 pr-2.5 py-2 bg-white"
                  />
                </div>
              )}
              <p className="text-[10px] text-morita-charcoal/50 mt-1.5 leading-snug">
                Definí tu horario disponible para que los vecinos te manden solicitudes en ese rango de forma coordinada.
              </p>
            </div>
          </div>

          {/* 5. Custom zone */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-morita-charcoal/70 uppercase tracking-wider">
                Ubicación o cuadra dentro del barrio *
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowMapAssistant(!showMapAssistant);
                  if (!mapSearchText) {
                    setMapSearchText(zone || 'La Morita, Escobar, Buenos Aires');
                  }
                }}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 cursor-pointer transition-all ${
                  showMapAssistant 
                    ? 'bg-morita-mulberry border-morita-mulberry text-white shadow-3xs' 
                    : 'bg-white border-morita-sand text-morita-mulberry hover:bg-morita-sand/25'
                }`}
              >
                <Map className="h-3 w-3" />
                {showMapAssistant ? 'Cerrar Asistente' : '🗺️ Buscar en Google Maps'}
              </button>
            </div>
            <div className="relative">
              <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-morita-terracotta" />
              <input
                type="text"
                placeholder="Ej: Las Acacias al 400, Frente a la plaza principal..."
                value={zone}
                onChange={(e) => {
                  setZone(e.target.value);
                  setMapSearchText(e.target.value);
                }}
                className="w-full text-xs rounded-lg border border-morita-sand pl-8 pr-2.5 py-2 bg-white"
                required
              />
            </div>

            {/* Google Maps Assistant Panel */}
            {showMapAssistant && (
              <div className="mt-2.5 p-3 rounded-xl bg-morita-sand/15 border border-morita-sand/35 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-morita-charcoal/60 uppercase flex items-center gap-1">
                    📍 Asistente de Ubicación Google Maps
                  </span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((zone || 'La Morita') + ' Escobar')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] font-bold text-morita-mulberry hover:underline flex items-center gap-0.5"
                  >
                    Abrir en Google Maps <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>

                {/* Popular street presets in La Morita */}
                <div className="space-y-1">
                  <span className="block text-[8px] font-bold text-morita-charcoal/40 uppercase">Sugerencias del barrio:</span>
                  <div className="flex flex-wrap gap-1">
                    {[
                      'Calle Las Acacias al 100',
                      'Calle Los Robles al 300',
                      'Los Sauces y El Ceibo',
                      'Avenida Del Ombú al 900',
                      'Calle Los Jacarandás al 200',
                      'Frente a la Plaza Principal'
                    ].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setZone(preset);
                          setMapSearchText(preset);
                        }}
                        className="px-1.5 py-0.5 rounded text-[9px] bg-white border border-morita-sand hover:border-morita-mulberry/50 hover:bg-morita-sand/10 transition-colors text-morita-charcoal/80 cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interactive Map Preview */}
                <div className="relative rounded-lg overflow-hidden border border-morita-sand/60 bg-white">
                  <iframe
                    title="Google Maps Preview"
                    width="100%"
                    height="140"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent((zone || 'Barrio La Morita, Santa Cruz') + ', Bolivia')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  ></iframe>
                </div>

                <p className="text-[9px] text-morita-charcoal/50 leading-normal">
                  💡 El mapa se actualiza automáticamente con lo que escribas arriba. Podés hacer zoom o moverlo para confirmar que la zona sea la correcta.
                </p>
              </div>
            )}

            <p className="text-[10px] text-morita-charcoal/40 mt-1 leading-snug">
              ¡Por seguridad, no hace falta que pongas la altura exacta de tu casa si no querés! Solo una orientación de cuadra o esquina de referencia.
            </p>
          </div>

          {/* 6. Photo Source Selection */}
          <div className="space-y-3.5 bg-morita-sand/10 border border-morita-sand/50 rounded-xl p-4">
            <label className="block text-xs font-bold text-morita-charcoal/70 uppercase tracking-wider flex justify-between items-center">
              <span>Foto de la publicación (Opcional)</span>
              <span className="text-[10px] bg-morita-mulberry/10 text-morita-mulberry font-bold px-2 py-0.5 rounded-md">3 Opciones</span>
            </label>

            {/* Source Tab Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setActivePhotoSource('upload')}
                className={`py-2 px-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  activePhotoSource === 'upload'
                    ? 'border-morita-mulberry bg-morita-mulberry/10 text-morita-mulberry shadow-2xs'
                    : 'border-morita-sand bg-white text-morita-charcoal/70 hover:bg-morita-sand/10'
                }`}
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Subir archivo</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePhotoSource('camera')}
                className={`py-2 px-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  activePhotoSource === 'camera'
                    ? 'border-morita-mulberry bg-morita-mulberry/10 text-morita-mulberry shadow-2xs'
                    : 'border-morita-sand bg-white text-morita-charcoal/70 hover:bg-morita-sand/10'
                }`}
              >
                <Camera className="h-3.5 w-3.5" />
                <span>Tomar foto</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePhotoSource('link')}
                className={`py-2 px-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  activePhotoSource === 'link'
                    ? 'border-morita-mulberry bg-morita-mulberry/10 text-morita-mulberry shadow-2xs'
                    : 'border-morita-sand bg-white text-morita-charcoal/70 hover:bg-morita-sand/10'
                }`}
              >
                <Link className="h-3.5 w-3.5" />
                <span>Pegar enlace</span>
              </button>
            </div>

            {/* Source Content Area */}
            <div className="bg-white border border-morita-sand/40 rounded-lg p-3">
              {/* Upload Source */}
              {activePhotoSource === 'upload' && (
                <div className="space-y-3">
                  <p className="text-[10px] text-morita-charcoal/55 font-medium leading-none">
                    Subí una foto directamente de tu celular o computadora:
                  </p>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-morita-sand/80 rounded-xl cursor-pointer hover:bg-morita-sand/5 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-4 pb-4">
                        <Upload className="h-5 w-5 text-morita-charcoal/40 mb-1" />
                        <p className="text-xs text-morita-charcoal/60 font-medium">Hacé clic para seleccionar o arrastrá un archivo</p>
                        <p className="text-[9px] text-morita-charcoal/40 mt-0.5">Formatos soportados: JPG, PNG, WEBP</p>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Camera Source */}
              {activePhotoSource === 'camera' && (
                <div className="space-y-3 text-center">
                  <p className="text-[10px] text-morita-charcoal/55 font-medium text-left">
                    Tomá una foto en vivo utilizando la cámara de tu dispositivo:
                  </p>

                  {cameraError && (
                    <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-2.5 text-[10px] font-bold text-left">
                      ⚠️ {cameraError}
                    </div>
                  )}

                  {!cameraStream ? (
                    <div className="py-4 flex flex-col items-center justify-center border border-dashed border-morita-sand rounded-xl bg-morita-sand/5">
                      <Camera className="h-8 w-8 text-morita-charcoal/30 mb-2" />
                      <button
                        type="button"
                        onClick={startCamera}
                        disabled={isCameraStarting}
                        className="px-4 py-2 bg-morita-mulberry hover:bg-morita-mulberry-dark text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center space-x-1.5"
                      >
                        {isCameraStarting ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            <span>Iniciando cámara...</span>
                          </>
                        ) : (
                          <>
                            <Camera className="h-3.5 w-3.5" />
                            <span>Encender mi cámara 📷</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Video element for live feed */}
                      <div className="relative rounded-xl overflow-hidden border border-morita-sand/80 bg-black max-w-sm mx-auto aspect-video flex items-center justify-center">
                        <video
                          ref={videoRef}
                          id="camera-preview"
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover transform -scale-x-100"
                        />
                        <div className="absolute top-2 right-2 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                          En Vivo
                        </div>
                      </div>

                      {/* Camera Actions */}
                      <div className="flex justify-center space-x-2">
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="px-4 py-1.5 bg-morita-leaf hover:bg-morita-leaf-dark text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center space-x-1"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Capturar Foto 📸</span>
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="px-4 py-1.5 bg-morita-charcoal/10 hover:bg-morita-charcoal/25 text-morita-charcoal text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Apagar cámara
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Link Source */}
              {activePhotoSource === 'link' && (
                <div className="space-y-2">
                  <p className="text-[10px] text-morita-charcoal/55 font-medium leading-none">
                    Pegá un enlace directo de una foto que ya esté subida a internet:
                  </p>
                  <div className="relative">
                    <Link className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-morita-charcoal/40" />
                    <input
                      type="url"
                      placeholder="Ej: https://images.unsplash.com/... o enlace directo de imagen"
                      value={customPhotoUrl}
                      onChange={(e) => handleCustomPhotoChange(e.target.value)}
                      className="w-full text-xs rounded-lg border border-morita-sand pl-8 pr-2.5 py-1.5 bg-white placeholder:text-morita-charcoal/30 focus:ring-1 focus:ring-morita-mulberry/40"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* General selected photo preview banner */}
            {photo && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-green-50 border border-green-200/85 animate-fade-in">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={photo}
                    alt="Vista previa"
                    className="h-12 w-16 object-cover rounded-lg border border-green-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-green-800 block">✓ Foto asignada con éxito</span>
                    <span className="text-[9px] text-green-700/60 leading-none block truncate max-w-sm">
                      {photo.startsWith('data:') ? 'Imagen cargada en el dispositivo (Base64)' : photo}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPhoto('');
                    setPhotoPresetIndex(null);
                    setCustomPhotoUrl('');
                    setUseCustomPhoto(false);
                  }}
                  className="p-1 px-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer text-xs font-bold"
                  title="Eliminar foto"
                >
                  Quitar
                </button>
              </div>
            )}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-morita-sand/60 flex flex-col sm:flex-row items-center justify-between gap-3 bg-morita-beige/20">
          <div>
            {publicationToEdit && onDeletePublication && (
              !showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full sm:w-auto px-3.5 py-2 text-xs font-bold rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors cursor-pointer flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-600" />
                  <span>Borrar publicación</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2 bg-red-100/80 border border-red-300 p-1.5 px-3 rounded-lg animate-fade-in">
                  <span className="text-[11px] font-bold text-red-900">¿Borrar de Supabase?</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (publicationToEdit && onDeletePublication) {
                        onDeletePublication(publicationToEdit.id);
                        onClose();
                      }
                    }}
                    className="px-2.5 py-1 text-[11px] font-extrabold bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors cursor-pointer"
                  >
                    Sí, borrar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-md transition-colors cursor-pointer"
                  >
                    No
                  </button>
                </div>
              )
            )}
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg hover:bg-morita-sand/50 text-morita-charcoal/70 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleFormSubmit}
              className="bg-morita-mulberry hover:bg-morita-mulberry-dark text-white px-5 py-2.5 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              {publicationToEdit ? 'Guardar Cambios' : 'Publicar en el Barrio'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
