import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { X, User as UserIcon, Phone, MapPin, Mail, AlignLeft, Check, Camera, Sparkles, Map, Search, ExternalLink, Upload, Link, RefreshCw, Image } from 'lucide-react';
import { compressImageDataUrl, compressImageFile } from '../utils/imageCompressor';

interface RegistrationModalProps {
  isOpen: boolean;
  currentUser: User;
  userToEdit?: User | null;
  mode?: 'edit' | 'register';
  onSave: (updatedUser: User) => void;
  onClose: () => void;
}

const defaultAvatarUrl = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="%239ca3af"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';

const popularSkills = [
  'Cocina',
  'Pastelería',
  'Electricidad',
  'Plomería',
  'Jardinería',
  'Pintura',
  'Arreglos Generales',
  'Costura',
  'Mascotas',
  'Apoyo Escolar',
  'Computación',
  'Fletes'
];

export default function RegistrationModal({
  isOpen,
  currentUser,
  userToEdit,
  mode = 'edit',
  onSave,
  onClose
}: RegistrationModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [zone, setZone] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [customSkillError, setCustomSkillError] = useState('');
  const [error, setError] = useState('');
  const [showMapAssistant, setShowMapAssistant] = useState(false);
  const [mapSearchText, setMapSearchText] = useState('');
  
  // Real GPS and geocoding states
  const [isLocating, setIsLocating] = useState(false);
  const [locationFeedback, setLocationFeedback] = useState('');
  const [locationResults, setLocationResults] = useState<{ name: string; lat: string; lon: string }[]>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Helper to use browser GPS location
  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      setLocationFeedback('La geolocalización no está soportada en tu navegador.');
      return;
    }
    setIsLocating(true);
    setLocationFeedback('Obteniendo coordenadas GPS...');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          setLocationFeedback('Buscando dirección del punto en Google Maps...');
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          if (response.ok) {
            const data = await response.json();
            const address = data.address;
            const road = address.road || address.pedestrian || address.suburb || '';
            const houseNumber = address.house_number ? ` al ${address.house_number}` : '';
            const city = address.city || address.town || address.county || 'Escobar';
            const cleanAddress = road ? `${road}${houseNumber}` : 'La Morita, Escobar';
            
            setZone(cleanAddress);
            setMapSearchText(`${cleanAddress}, ${city}`);
            setLocationFeedback('¡Ubicación encontrada con éxito!');
          } else {
            const coordStr = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
            setZone(coordStr);
            setMapSearchText(coordStr);
            setLocationFeedback('Ubicación obtenida por coordenadas GPS.');
          }
        } catch (err) {
          console.error(err);
          const coordStr = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          setZone(coordStr);
          setMapSearchText(coordStr);
          setLocationFeedback('Ubicación obtenida por coordenadas (falla en geolocalización de dirección).');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error(error);
        setIsLocating(false);
        setLocationFeedback('No se pudo obtener la ubicación GPS. Por favor, escribila manualmente.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Helper to search addresses in real-time
  const handleSearchAddress = async () => {
    const query = mapSearchText.trim();
    if (!query) return;
    setIsGeocoding(true);
    setLocationFeedback('Buscando en el mapa...');
    setLocationResults([]);
    try {
      const searchContext = query.toLowerCase().includes('escobar') || query.toLowerCase().includes('buenos aires')
        ? query
        : `${query}, Escobar, Buenos Aires, Argentina`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchContext)}&limit=4&addressdetails=1`
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const formatted = data.map((item: any) => {
            const displayNameParts = item.display_name.split(',');
            const shortName = displayNameParts.slice(0, 3).join(',');
            return {
              name: shortName,
              lat: item.lat,
              lon: item.lon
            };
          });
          setLocationResults(formatted);
          setLocationFeedback(`Se encontraron ${formatted.length} resultados.`);
        } else {
          setLocationFeedback('No se encontraron direcciones exactas. Intentá con otra referencia.');
        }
      } else {
        setLocationFeedback('Error al buscar en el mapa.');
      }
    } catch (err) {
      console.error(err);
      setLocationFeedback('Error de conexión al buscar la dirección.');
    } finally {
      setIsGeocoding(false);
    }
  };

  // Avatar selection state & camera handlers
  const [activeAvatarSource, setActiveAvatarSource] = useState<'upload' | 'camera' | 'link'>('upload');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState('');
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, activeAvatarSource]);

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  useEffect(() => {
    if (!isOpen || activeAvatarSource !== 'camera') {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeAvatarSource]);

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
      setCameraError('No se pudo acceder a la cámara. Verificá los permisos del navegador.');
    } finally {
      setIsCameraStarting(false);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = Math.min(video.videoWidth || 300, 300);
    canvas.height = Math.min(video.videoHeight || 300, 300);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const rawUrl = canvas.toDataURL('image/jpeg', 0.7);
      const compressed = await compressImageDataUrl(rawUrl, 250, 250, 0.7);
      setAvatar(compressed);
      stopCamera();
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecciona un archivo de imagen válido.');
      return;
    }

    const compressed = await compressImageFile(file, 250, 250, 0.7);
    if (compressed) {
      setAvatar(compressed);
    }
  };

  // Hydrate or reset form on load
  useEffect(() => {
    if (isOpen) {
      if (mode === 'register') {
        setName('');
        setEmail('');
        setPhone('');
        setZone('');
        setBio('');
        setAvatar(defaultAvatarUrl);
        setSkills([]);
        setCustomSkill('');
        setCustomSkillError('');
        setError('');
        setMapSearchText('');
        setShowMapAssistant(false);
        setActiveAvatarSource('upload');
      } else {
        const target = userToEdit || currentUser;
        if (target) {
          setName(target.name);
          setEmail(target.email || '');
          setPhone(target.phone || '');
          setZone(target.zone || '');
          setBio(target.bio || '');
          setAvatar(target.avatar || defaultAvatarUrl);
          setSkills(target.skills || []);
          setCustomSkill('');
          setCustomSkillError('');
          setError('');
          setMapSearchText(target.zone || '');
          setShowMapAssistant(false);
          setActiveAvatarSource(target.avatar?.startsWith('data:image/') ? 'upload' : 'link');
        }
      }
    }
  }, [currentUser, userToEdit, isOpen, mode]);

  if (!isOpen) return null;

  const handleToggleSkill = (skill: string) => {
    setSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill) 
        : [...prev, skill]
    );
  };

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomSkillError('');
    const trimmed = customSkill.trim();
    if (!trimmed) return;

    if (trimmed.length > 30) {
      setCustomSkillError('Máximo 30 caracteres.');
      return;
    }

    const words = trimmed.split(/\s+/).filter(w => w.length > 0);
    if (words.length > 3) {
      setCustomSkillError('Máximo 3 palabras (ej: "vendedor de autos").');
      return;
    }

    // Format first letters uppercase
    const formatted = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

    if (skills.includes(formatted)) {
      setCustomSkillError('Esa habilidad ya está agregada.');
      return;
    }

    setSkills(prev => [...prev, formatted]);
    setCustomSkill('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Por favor, ingresá tu nombre y apellido.');
      return;
    }
    if (!phone.trim()) {
      setError('Por favor, ingresá un teléfono de contacto.');
      return;
    }
    if (!zone.trim()) {
      setError('Por favor, indicanos en qué cuadra o sector del barrio vivís.');
      return;
    }

    const target = userToEdit || currentUser;
    const savedId = mode === 'register' ? 'u_' + Date.now() : target.id;

    const finalAvatar = await compressImageDataUrl(avatar, 250, 250, 0.7);

    onSave({
      id: savedId,
      name: name.trim(),
      email: email.trim() || 'vecino@lamorita.com',
      phone: phone.trim(),
      zone: zone.trim(),
      bio: bio.trim() || undefined,
      avatar: finalAvatar,
      skills: skills,
      isAdmin: target?.isAdmin
    });

    onClose();
  };

  const isRegister = mode === 'register';
  const targetUser = userToEdit || currentUser;
  const isEditingOther = !isRegister && userToEdit && userToEdit.id !== currentUser.id;

  return (
    <div id="registration-modal-overlay" className="fixed inset-0 z-55 overflow-y-auto bg-morita-charcoal/60 backdrop-blur-xs p-3 sm:p-6 flex items-center justify-center min-h-full">
      <div 
        id="registration-modal-content" 
        className="bg-white rounded-2xl border border-morita-sand shadow-2xl w-full max-w-lg my-auto max-h-[88vh] overflow-y-auto flex flex-col touch-pan-y animate-fade-in"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-morita-sand/50 bg-morita-beige/35 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-2">
            <span className="text-xl">{isRegister ? '🆕' : '✍️'}</span>
            <div>
              <h2 className="text-base font-serif font-bold text-morita-charcoal">
                {isRegister 
                  ? 'Registrar nuevo vecino en La Morita' 
                  : isEditingOther 
                    ? `Editar perfil de ${targetUser.name}` 
                    : 'Editar mis datos de vecino'
                }
              </h2>
              <p className="text-[10px] text-morita-charcoal/50 leading-none">
                {isRegister 
                  ? 'Crear un perfil vecinal desde cero' 
                  : isEditingOther
                    ? 'Modificación de perfil por Super Admin'
                    : 'Mantené tus datos de contacto al día'
                }
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-2.5 text-xs font-semibold">
              ⚠️ {error}
            </div>
          )}

          {/* Avatar Selector */}
          <div className="space-y-3 bg-morita-sand/10 border border-morita-sand/50 rounded-xl p-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-morita-charcoal/70 uppercase tracking-wider">
                Foto de Perfil
              </label>
              <span className="text-[10px] bg-morita-mulberry/10 text-morita-mulberry font-bold px-2 py-0.5 rounded-md">3 Opciones</span>
            </div>

            {/* Current Avatar & Tab Switcher */}
            <div className="flex items-center gap-3">
              <img
                src={avatar || defaultAvatarUrl}
                alt="Avatar elegido"
                className="h-14 w-14 rounded-full object-cover border-2 border-morita-mulberry shadow-xs shrink-0"
              />
              <div className="grid grid-cols-3 gap-1.5 flex-1">
                <button
                  type="button"
                  onClick={() => setActiveAvatarSource('upload')}
                  className={`py-1.5 px-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                    activeAvatarSource === 'upload'
                      ? 'border-morita-mulberry bg-morita-mulberry/10 text-morita-mulberry shadow-2xs'
                      : 'border-morita-sand bg-white text-morita-charcoal/70 hover:bg-morita-sand/10'
                  }`}
                >
                  <Upload className="h-3 w-3" />
                  <span>Subir</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveAvatarSource('camera')}
                  className={`py-1.5 px-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                    activeAvatarSource === 'camera'
                      ? 'border-morita-mulberry bg-morita-mulberry/10 text-morita-mulberry shadow-2xs'
                      : 'border-morita-sand bg-white text-morita-charcoal/70 hover:bg-morita-sand/10'
                  }`}
                >
                  <Camera className="h-3 w-3" />
                  <span>Cámara</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveAvatarSource('link')}
                  className={`py-1.5 px-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                    activeAvatarSource === 'link'
                      ? 'border-morita-mulberry bg-morita-mulberry/10 text-morita-mulberry shadow-2xs'
                      : 'border-morita-sand bg-white text-morita-charcoal/70 hover:bg-morita-sand/10'
                  }`}
                >
                  <Link className="h-3 w-3" />
                  <span>Enlace</span>
                </button>
              </div>
            </div>

            {/* Tab content */}
            <div className="bg-white border border-morita-sand/40 rounded-lg p-2.5">
              {activeAvatarSource === 'upload' && (
                <div className="space-y-2">
                  <p className="text-[10px] text-morita-charcoal/55 font-medium leading-none">
                    Subí una foto tuya desde tu dispositivo:
                  </p>
                  <label className="flex items-center justify-center w-full h-16 border-2 border-dashed border-morita-sand/80 rounded-lg cursor-pointer hover:bg-morita-sand/5 transition-colors">
                    <div className="flex items-center space-x-2">
                      <Upload className="h-4 w-4 text-morita-charcoal/40" />
                      <span className="text-xs text-morita-charcoal/60 font-medium">Seleccionar imagen</span>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarFileChange} 
                      className="hidden" 
                    />
                  </label>
                </div>
              )}

              {activeAvatarSource === 'camera' && (
                <div className="space-y-2 text-center">
                  {cameraError && (
                    <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-2 text-[10px] font-bold text-left">
                      ⚠️ {cameraError}
                    </div>
                  )}

                  {!cameraStream ? (
                    <div className="py-3 flex flex-col items-center justify-center border border-dashed border-morita-sand rounded-lg bg-morita-sand/5">
                      <Camera className="h-6 w-6 text-morita-charcoal/30 mb-1" />
                      <button
                        type="button"
                        onClick={startCamera}
                        disabled={isCameraStarting}
                        className="px-3 py-1.5 bg-morita-mulberry text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center space-x-1"
                      >
                        {isCameraStarting ? (
                          <>
                            <RefreshCw className="h-3 w-3 animate-spin" />
                            <span>Iniciando...</span>
                          </>
                        ) : (
                          <>
                            <Camera className="h-3 w-3" />
                            <span>Encender Cámara 📷</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative rounded-lg overflow-hidden border border-morita-sand/80 bg-black max-w-xs mx-auto aspect-square h-36 flex items-center justify-center">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover transform -scale-x-100"
                        />
                      </div>
                      <div className="flex justify-center space-x-2">
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="px-3 py-1 bg-morita-leaf text-white text-xs font-bold rounded-lg cursor-pointer flex items-center space-x-1"
                        >
                          <Check className="h-3 w-3" />
                          <span>Tomar Foto 📸</span>
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="px-3 py-1 bg-morita-charcoal/10 text-morita-charcoal text-xs font-bold rounded-lg cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeAvatarSource === 'link' && (
                <div className="space-y-1.5">
                  <p className="text-[10px] text-morita-charcoal/55 font-medium leading-none">
                    Pegá un enlace web a tu foto de perfil:
                  </p>
                  <div className="relative">
                    <Link className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-morita-charcoal/40" />
                    <input
                      type="url"
                      placeholder="Ej: https://mis-fotos.com/mi-perfil.jpg"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      className="w-full text-xs rounded-lg border border-morita-sand pl-8 pr-2.5 py-1.5 bg-white placeholder:text-morita-charcoal/30 focus:ring-1 focus:ring-morita-mulberry/40"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Name & Phone & Email */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-morita-charcoal/70 mb-1.5 uppercase tracking-wider">
                Nombre y Apellido *
              </label>
              <div className="relative">
                <UserIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-morita-charcoal/40" />
                <input
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs rounded-lg border border-morita-sand pl-8 pr-2.5 py-2 bg-white focus:ring-1 focus:ring-morita-mulberry/40"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-morita-charcoal/70 mb-1.5 uppercase tracking-wider">
                  Teléfono (WhatsApp) *
                </label>
                <div className="relative">
                  <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-morita-charcoal/40" />
                  <input
                    type="tel"
                    placeholder="Ej: 70406010 o 77045678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs rounded-lg border border-morita-sand pl-8 pr-2.5 py-2 bg-white focus:ring-1 focus:ring-morita-mulberry/40"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-morita-charcoal/70 mb-1.5 uppercase tracking-wider">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-morita-charcoal/40" />
                  <input
                    type="email"
                    placeholder="juan@lamorita.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs rounded-lg border border-morita-sand pl-8 pr-2.5 py-2 bg-white focus:ring-1 focus:ring-morita-mulberry/40"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Neighborhood zone */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-morita-charcoal/70 uppercase tracking-wider">
                Tu cuadra / Referencia dentro del barrio *
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowMapAssistant(!showMapAssistant);
                  if (!mapSearchText) {
                    setMapSearchText(zone || 'Barrio La Morita, Santa Cruz de la Sierra, Bolivia');
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
              <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-morita-terracotta" />
              <input
                type="text"
                placeholder="Ej: Calle Las Acacias al 200, Esquina Los Sauces"
                value={zone}
                onChange={(e) => {
                  setZone(e.target.value);
                  setMapSearchText(e.target.value);
                }}
                className="w-full text-xs rounded-lg border border-morita-sand pl-8 pr-2.5 py-2 bg-white focus:ring-1 focus:ring-morita-mulberry/40"
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

                {/* GPS and Search Controls */}
                <div className="flex flex-col gap-2">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Buscar dirección en La Morita / Escobar..."
                      value={mapSearchText}
                      onChange={(e) => setMapSearchText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSearchAddress();
                        }
                      }}
                      className="flex-1 text-[11px] rounded-lg border border-morita-sand/60 px-2 py-1.5 bg-white focus:outline-hidden focus:ring-1 focus:ring-morita-mulberry/40"
                    />
                    <button
                      type="button"
                      onClick={handleSearchAddress}
                      disabled={isGeocoding}
                      className="bg-morita-mulberry hover:bg-morita-mulberry/90 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Search className="h-3.5 w-3.5" />
                      <span>{isGeocoding ? 'Buscando...' : 'Buscar'}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleUseGPS}
                    disabled={isLocating}
                    className="w-full bg-morita-leaf/10 hover:bg-morita-leaf/20 disabled:opacity-50 text-morita-leaf border border-morita-leaf/20 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <MapPin className="h-3.5 w-3.5 animate-bounce" />
                    <span>{isLocating ? 'Obteniendo GPS...' : '📍 Usar mi ubicación actual (GPS)'}</span>
                  </button>
                </div>

                {/* Feedback / status messages */}
                {locationFeedback && (
                  <p className="text-[10px] text-morita-terracotta font-semibold leading-normal">
                    {locationFeedback}
                  </p>
                )}

                {/* Search Results / Suggestions */}
                {locationResults.length > 0 && (
                  <div className="space-y-1">
                    <span className="block text-[8px] font-bold text-morita-charcoal/40 uppercase">Direcciones encontradas:</span>
                    <div className="flex flex-col gap-1 max-h-24 overflow-y-auto">
                      {locationResults.map((result, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setZone(result.name);
                            setMapSearchText(result.name);
                            setLocationFeedback(`Seleccionado: ${result.name}`);
                          }}
                          className="w-full text-left px-2 py-1 rounded text-[10px] bg-white border border-morita-sand/50 hover:border-morita-mulberry/50 hover:bg-morita-sand/10 transition-colors text-morita-charcoal/85 flex items-center gap-1 cursor-pointer truncate"
                        >
                          <MapPin className="h-3 w-3 text-morita-terracotta shrink-0" />
                          <span className="truncate">{result.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular street presets in La Morita */}
                <div className="space-y-1">
                  <span className="block text-[8px] font-bold text-morita-charcoal/40 uppercase">Lugares comunes en La Morita:</span>
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
                          setLocationResults([]);
                          setLocationFeedback(`Sugerencia seleccionada: ${preset}`);
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
                    src={`https://maps.google.com/maps?q=${encodeURIComponent((zone || 'La Morita, Escobar') + ', Buenos Aires, Argentina')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  ></iframe>
                </div>

                <p className="text-[9px] text-morita-charcoal/50 leading-normal">
                  💡 El mapa se cambia con la ubicación elegida. Podés usar el buscador o el GPS para guardar la ubicación exacta en tu perfil.
                </p>
              </div>
            )}

            <p className="text-[10px] text-morita-charcoal/40 mt-1 leading-snug">
              Los vecinos verán esto en tus publicaciones para estimar distancias. ¡No es necesario poner altura exacta!
            </p>
          </div>

          {/* Neighborhood Bio */}
          <div>
            <label className="block text-xs font-bold text-morita-charcoal/70 mb-1.5 uppercase tracking-wider">
              Biografía / Sobre vos
            </label>
            <div className="relative">
              <AlignLeft className="absolute left-2.5 top-3 h-3.5 w-3.5 text-morita-charcoal/40" />
              <textarea
                rows={2}
                placeholder="Contales un poco a tus vecinos sobre vos. ¿Qué hacés? ¿Qué te gusta ofrecer o pedir en el barrio?"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full text-xs rounded-lg border border-morita-sand pl-8 pr-2.5 py-2 bg-white focus:ring-1 focus:ring-morita-mulberry/40"
              />
            </div>
          </div>

          {/* Skills / Hobbies Selection */}
          <div>
            <label className="block text-xs font-bold text-morita-charcoal/70 mb-1.5 uppercase tracking-wider flex items-center justify-between">
              <span>Habilidades, Oficios o Intereses</span>
              <span className="text-[10px] font-normal text-morita-charcoal/40">(Elegí las que correspondan)</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {popularSkills.map((skill) => {
                const isSelected = skills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleToggleSkill(skill)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-morita-mulberry text-white border-morita-mulberry'
                        : 'bg-morita-beige/30 hover:bg-morita-sand/20 text-morita-charcoal/80 border-morita-sand'
                    }`}
                  >
                    {skill} {isSelected ? '✓' : '+'}
                  </button>
                );
              })}
              {/* Render custom skills that are selected */}
              {skills.filter(s => !popularSkills.includes(s)).map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleToggleSkill(skill)}
                  className="px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer transition-all border bg-morita-mulberry text-white border-morita-mulberry flex items-center space-x-1"
                >
                  <span>{skill}</span>
                  <span className="text-[10px] bg-white/20 rounded-full w-3.5 h-3.5 inline-flex items-center justify-center font-normal">×</span>
                </button>
              ))}
            </div>

            {/* Custom skill input */}
            <div className="bg-morita-sand/15 p-3 rounded-xl border border-morita-sand/40">
              <label className="block text-[11px] font-bold text-morita-charcoal/65 mb-1.5 uppercase tracking-wide">
                ➕ Agregar otra habilidad u oficio personalizado
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej: Fotógrafo, Gasista, Vendedor de autos"
                  value={customSkill}
                  onChange={(e) => {
                    setCustomSkill(e.target.value);
                    if (customSkillError) setCustomSkillError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomSkill(e);
                    }
                  }}
                  className="flex-1 text-xs rounded-lg border border-morita-sand px-3 py-1.5 bg-white focus:ring-1 focus:ring-morita-mulberry/40"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSkill}
                  className="bg-morita-mulberry hover:bg-morita-mulberry-dark text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Agregar
                </button>
              </div>
              {customSkillError ? (
                <p className="text-[10px] text-red-600 font-bold mt-1">⚠️ {customSkillError}</p>
              ) : (
                <p className="text-[10px] text-morita-charcoal/40 mt-1 leading-snug">
                  Escribí solo un par de palabras (máximo 3 palabras y 30 caracteres).
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-morita-sand/40 flex justify-end space-x-2.5 sticky bottom-0 bg-white pb-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg hover:bg-morita-sand/50 text-morita-charcoal/70 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-morita-mulberry hover:bg-morita-mulberry-dark text-white text-xs font-bold px-5 py-2 rounded-lg cursor-pointer transition-colors shadow-2xs"
            >
              {isRegister ? 'Registrarme y Activar Perfil' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
