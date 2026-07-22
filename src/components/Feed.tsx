import React, { useState, useMemo } from 'react';
import { Publication, PublicationType, CategoryType, User, Announcement, Request } from '../types';
import { Search, SlidersHorizontal, MapPin, Coins, Calendar, Sparkles, AlertTriangle, ArrowUpDown, ChevronRight, Eye, EyeOff, Users, Edit, Megaphone, Pin, BookOpen, MessageSquare, Plus, Heart, BarChart3, Award, CheckCircle2, TrendingUp, Send, Share2, Trash2 } from 'lucide-react';

// Helper function to dynamically generate automatic tags based on title/description text
export function getAutoTags(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const tags: string[] = [];

  const ruleMap: { keywords: string[]; tag: string }[] = [
    { keywords: ['empanada', 'pan ', 'panes', 'tarta', 'caser', 'comida', 'bizcocho', 'pastel', 'queque', 'alfajor', 'sabor', 'cocina', 'hornear', 'dulce', 'salado', 'pizza', 'vianda', 'cena', 'almuerzo'], tag: 'Comida' },
    { keywords: ['limp', 'planch', 'aseo', 'lavar', 'limpieza', 'barrer', 'lavado', 'organiza'], tag: 'Limpieza' },
    { keywords: ['clase', 'tutor', 'enseñ', 'aprende', 'matemática', 'física', 'química', 'inglés', 'guitarra', 'música', 'taller', 'tutoría', 'colegio', 'lección'], tag: 'Clases' },
    { keywords: ['jardín', 'pasto', 'césped', 'cortar', 'planta', 'árbol', 'maleza', 'desmalez', 'tijera', 'podar', 'manguera', 'sembrar', 'jardinería'], tag: 'Jardinería' },
    { keywords: ['repar', 'arregl', 'plomer', 'electric', 'gas', 'pint', 'albañil', 'caño', 'gotera', 'enchufe', 'cable', 'mantenimiento'], tag: 'Reparaciones' },
    { keywords: ['perro', 'gato', 'mascota', 'pase', 'veterin', 'alimento para', 'cuidado de', 'canino', 'felino'], tag: 'Mascotas' },
    { keywords: ['prest', 'prestar', 'escalera', 'herramienta', 'taladro', 'máquina', 'alquiler', 'prestado'], tag: 'Préstamos' },
    { keywords: ['flete', 'viaje', 'auto', 'camioneta', 'llevar', 'transporte', 'mudanza', 'envío'], tag: 'Transporte' },
    { keywords: ['ropa', 'costura', 'tejer', 'vestido', 'lana', 'hilo', 'reparar prenda', 'modista', 'sastre'], tag: 'Costura' },
    { keywords: ['niño', 'bebé', 'cuid', 'niñera', 'juego', 'infantil'], tag: 'Cuidado Infantil' },
    { keywords: ['salud', 'enfermer', 'presión', 'médic', 'inyect', 'curación', 'terapia', 'masaje', 'gimnasio', 'entrenamiento'], tag: 'Salud' }
  ];

  for (const rule of ruleMap) {
    if (rule.keywords.some(kw => text.includes(kw))) {
      tags.push(rule.tag);
    }
  }

  return tags.length > 0 ? tags : ['General'];
}

interface FeedProps {
  publications: Publication[];
  allUsers: User[];
  onOpenProfile: (userId: string) => void;
  onRequestHelp: (pub: Publication) => void;
  currentUser: User;
  announcements: Announcement[];
  onToggleActive?: (publicationId: string) => void;
  onEditPublication?: (pub: Publication) => void;
  onDeletePublication?: (publicationId: string) => void;
  onOpenPublish?: () => void;
  favorites?: string[];
  onToggleFavorite?: (pubId: string) => void;
  isFavoritesTab?: boolean;
  requests?: Request[];
  isAdmin?: boolean;
  onGuestAction?: (actionDescription: string) => void;
}

export default function Feed({
  publications,
  allUsers,
  onOpenProfile,
  onRequestHelp,
  currentUser,
  announcements,
  onToggleActive,
  onEditPublication,
  onDeletePublication,
  onOpenPublish,
  favorites = [],
  onToggleFavorite,
  isFavoritesTab = false,
  requests = [],
  isAdmin = false,
  onGuestAction
}: FeedProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);
  const [selectedType, setSelectedType] = useState<PublicationType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const [selectedZone, setSelectedZone] = useState('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'monto' | 'a-consultar' | 'intercambio'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'title'>('recent');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showNeighborDirectory, setShowNeighborDirectory] = useState(false);
  const [selectedAutoTag, setSelectedAutoTag] = useState<string | 'all'>('all');

  const [highlightedPubId, setHighlightedPubId] = useState<string | null>(() => {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    return params.get('pubId');
  });

  const highlightedPub = useMemo(() => {
    if (!highlightedPubId) return null;
    return publications.find(p => p.id === highlightedPubId);
  }, [highlightedPubId, publications]);

  const handleClearHighlight = () => {
    setHighlightedPubId(null);
    if (typeof window !== 'undefined' && window.history.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.delete('pubId');
      window.history.replaceState({}, document.title, url.pathname);
    }
  };

  const getWhatsAppShareUrl = (p: Publication) => {
    const siteUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://red-la-morita.net';
    const shareUrl = `${siteUrl}?pubId=${p.id}`;
    const typeText = p.type === 'ofrezco' ? 'Ofrecido' : 'Necesitado';
    const priceText = p.priceType === 'intercambio' 
      ? 'Intercambio o Favor 🤝' 
      : p.priceType === 'monto' 
      ? `Valor: ${p.priceValue}` 
      : 'A consultar 💬';

    const text = `🏡 *La Morita - Red Vecinal de Confianza*\n\n¡Hola! Te comparto esta publicación en nuestro barrio:\n\n*${p.title}* (${typeText} por *${p.authorName}*)\n\n"${p.description.slice(0, 130)}${p.description.length > 130 ? '...' : ''}"\n\n📍 Zona: ${p.zone}\n💰 ${priceText}\n\n👉 Ver detalles y coordinar en La Morita:\n${shareUrl}`;
    
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  // Dynamic extraction of tags present in the current publications
  const allActiveTags = useMemo(() => {
    const tags = new Set<string>();
    publications.forEach(p => {
      getAutoTags(p.title, p.description).forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [publications]);

  const [isStatsOpen, setIsStatsOpen] = useState(true);
  const [isMobileCarteleraOpen, setIsMobileCarteleraOpen] = useState(true);

  // Compute neighborhood statistics for the admin dashboard
  const stats = useMemo(() => {
    if (!requests) return null;

    // 1. Total completed exchanges
    const completedRequests = requests.filter(r => r.status === 'completada');
    const totalCompleted = completedRequests.length;

    // 2. Neighbors activity score
    // Score = number of publications + number of requests completed (either as publisher or requester)
    const userScores: { [userId: string]: { user: User; pubCount: number; reqCount: number; score: number } } = {};

    // Initialize all users
    allUsers.forEach(u => {
      userScores[u.id] = { user: u, pubCount: 0, reqCount: 0, score: 0 };
    });

    // Count publications
    publications.forEach(p => {
      if (userScores[p.userId]) {
        userScores[p.userId].pubCount += 1;
        userScores[p.userId].score += 2; // Each publication gets 2 points
      }
    });

    // Count completed requests
    requests.forEach(r => {
      if (r.status === 'completada') {
        if (userScores[r.publisherId]) {
          userScores[r.publisherId].reqCount += 1;
          userScores[r.publisherId].score += 3; // Publisher gets 3 points
        }
        if (userScores[r.requesterId]) {
          userScores[r.requesterId].reqCount += 1;
          userScores[r.requesterId].score += 3; // Requester gets 3 points
        }
      } else {
        // Any other requests also count a bit for activity
        if (userScores[r.requesterId]) {
          userScores[r.requesterId].score += 1;
        }
      }
    });

    const sortedUsers = Object.values(userScores)
      .filter(u => u.user.id !== 'admin' && u.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4); // Top 4 active neighbors

    // 3. Most requested categories
    const categoryRequestCounts: { [cat: string]: number } = {};
    const categoriesList = ['Productos', 'Servicios', 'Comida', 'Reparaciones', 'Clases/Tutorías', 'Ayuda vecinal', 'Otros'];
    categoriesList.forEach(c => {
      categoryRequestCounts[c] = 0;
    });

    requests.forEach(r => {
      const pub = publications.find(p => p.id === r.publicationId);
      const cat = pub ? pub.category : 'Otros';
      if (categoryRequestCounts[cat] !== undefined) {
        categoryRequestCounts[cat] += 1;
      } else {
        categoryRequestCounts['Otros'] += 1;
      }
    });

    const categoryData = Object.entries(categoryRequestCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const maxCount = Math.max(...categoryData.map(d => d.count), 1);

    return {
      totalCompleted,
      totalPublications: publications.length,
      topNeighbors: sortedUsers,
      categoryData,
      maxCount
    };
  }, [requests, publications, allUsers]);

  // Check if current user has any publications in history
  const hasHistory = useMemo(() => {
    return publications.some(p => p.userId === currentUser.id);
  }, [publications, currentUser.id]);

  // If user has no history, we show the guide by default.
  // Otherwise we keep it collapsed or allow them to open it.
  const [isGuideOpen, setIsGuideOpen] = useState(!hasHistory);

  // Find neighbors matching search query
  const matchedNeighbors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return allUsers.filter(u => u.name.toLowerCase().includes(query));
  }, [allUsers, searchQuery]);

  // Compute real-time suggestions as user types
  const suggestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return { publications: [], neighbors: [] };

    const matchedPubs = publications.filter(p => 
      p.title.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query) ||
      p.authorName.toLowerCase().includes(query)
    ).slice(0, 5);

    const matchedNeighborsList = allUsers.filter(u => 
      u.name.toLowerCase().includes(query)
    ).slice(0, 4);

    return { publications: matchedPubs, neighbors: matchedNeighborsList };
  }, [publications, allUsers, searchQuery]);

  // Click outside listener to close search suggestions dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Categories list
  const categories: (CategoryType | 'all')[] = [
    'all',
    'Productos',
    'Servicios',
    'Comida',
    'Reparaciones',
    'Clases/Tutorías',
    'Ayuda vecinal',
    'Otros'
  ];

  // Zones extracted from actual data
  const zonesList = useMemo(() => {
    const zones = new Set<string>();
    publications.forEach(p => {
      // simplify street names for filtering
      if (p.zone.includes('Acacias')) zones.add('Calle Las Acacias');
      else if (p.zone.includes('Ombú')) zones.add('Pasaje El Ombú');
      else if (p.zone.includes('San Martín')) zones.add('Av. San Martín');
      else if (p.zone.includes('Sauces')) zones.add('Calle Los Sauces');
      else if (p.zone.includes('Jazmines')) zones.add('Calle Los Jazmines');
    });
    return Array.from(zones);
  }, [publications]);

  // Filter and Search logic
  const filteredPublications = useMemo(() => {
    if (highlightedPubId) {
      const match = publications.find(p => p.id === highlightedPubId);
      if (match) {
        return [match];
      }
    }

    return publications
      .filter(p => {
        // Search query
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery = 
          p.title.toLowerCase().includes(query) || 
          p.description.toLowerCase().includes(query) ||
          p.authorName.toLowerCase().includes(query);

        // Type filter
        const matchesType = selectedType === 'all' || p.type === selectedType;

        // Category filter
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

        // Zone filter
        const matchesZone = !selectedZone || p.zone.toLowerCase().includes(selectedZone.toLowerCase().replace('calle ', '').replace('pasaje ', '').replace('av. ', ''));

        // Price type filter
        const matchesPrice = priceFilter === 'all' || p.priceType === priceFilter;

        // Auto tag filter
        const matchesAutoTag = selectedAutoTag === 'all' || getAutoTags(p.title, p.description).includes(selectedAutoTag);

        return matchesQuery && matchesType && matchesCategory && matchesZone && matchesPrice && matchesAutoTag;
      })
      .sort((a, b) => {
        if (sortBy === 'recent') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else {
          return a.title.localeCompare(b.title);
        }
      });
  }, [publications, searchQuery, selectedType, selectedCategory, selectedZone, priceFilter, sortBy, selectedAutoTag, highlightedPubId]);

  // Category Colors
  const getTypeStyles = (type: PublicationType) => {
    switch (type) {
      case 'vendo':
        return {
          bg: 'bg-morita-leaf/10 text-morita-leaf border-morita-leaf/20',
          badge: 'bg-morita-leaf text-white',
          label: 'Vendo / Producto'
        };
      case 'ofrezco':
        return {
          bg: 'bg-vibrant-blue/10 text-vibrant-blue border-vibrant-blue/20',
          badge: 'bg-vibrant-blue text-white',
          label: 'Ofrezco / Servicio'
        };
      case 'necesito':
        return {
          bg: 'bg-vibrant-red/10 text-vibrant-red border-vibrant-red/20',
          badge: 'bg-vibrant-red text-white',
          label: 'Necesito / Pedido'
        };
    }
  };

  // Nice Category Fallbacks Gradients
  const getCategoryFallbackGradient = (category: CategoryType) => {
    switch (category) {
      case 'Comida':
        return 'from-amber-100 to-orange-200 text-orange-800';
      case 'Reparaciones':
        return 'from-blue-100 to-slate-200 text-slate-800';
      case 'Clases/Tutorías':
        return 'from-violet-100 to-purple-200 text-purple-800';
      case 'Servicios':
        return 'from-teal-100 to-emerald-200 text-emerald-800';
      case 'Ayuda vecinal':
        return 'from-emerald-50 to-green-150 text-green-850';
      case 'Productos':
        return 'from-yellow-100 to-amber-200 text-amber-800';
      default:
        return 'from-rose-50 to-pink-100 text-pink-900';
    }
  };

  return (
    <div id="feed-screen" className="pb-16">
      
      {/* Friendly Neighborhood Banner / Favorites Banner */}
      <div className="bg-morita-sand/50 rounded-2xl p-6 sm:p-8 mb-8 border border-morita-sand flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-xl text-center md:text-left">
          {isFavoritesTab ? (
            <>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-morita-mulberry/15 text-morita-mulberry text-xs font-semibold mb-3">
                <Heart className="h-3.5 w-3.5 fill-morita-mulberry text-morita-mulberry animate-pulse" />
                <span>Tus publicaciones preferidas guardadas</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-morita-charcoal leading-tight">
                Mis Favoritos
              </h1>
              <p className="text-xs sm:text-sm text-morita-charcoal/70 mt-2 leading-relaxed">
                Aquí podés ver y hacer seguimiento de los productos, servicios o pedidos que guardaste como favoritos en el barrio.
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-morita-terracotta/15 text-morita-terracotta text-xs font-semibold mb-3">
                <Sparkles className="h-3.5 w-3.5 animate-bounce" />
                <span>La confianza de ser del mismo barrio</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-morita-charcoal leading-tight">
                ¿Qué hay hoy por La Morita?
              </h1>
              <p className="text-xs sm:text-sm text-morita-charcoal/70 mt-2 leading-relaxed">
                Comprá casero, contratá ayuda confiable y respondé a los pedidos de auxilio de tus vecinos. Sin intermediarios, cara a cara, a solo una cuadra de distancia.
              </p>
            </>
          )}
        </div>
        <div className="hidden lg:flex items-center space-x-2 bg-white/80 p-4 rounded-xl border border-morita-sand shadow-xs text-xs max-w-xs">
          <MapPin className="h-8 w-8 text-morita-mulberry shrink-0" />
          <div>
            <span className="font-bold block text-morita-charcoal">Barrio La Morita</span>
            <span className="text-morita-charcoal/60 leading-snug">
              Coordiná entregas, retiros o favores caminando. ¡Menos flete, más comunidad!
            </span>
          </div>
        </div>
      </div>



      {/* Administrador - Panel de Estadísticas del Barrio */}
      {isAdmin && stats && (
        <div id="admin-neighborhood-stats" className="bg-white rounded-2xl border-2 border-morita-mulberry/30 p-6 mb-8 shadow-xs animate-fade-in relative overflow-hidden">
          {/* Subtle background graphic */}
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-5 text-morita-mulberry">
            <BarChart3 className="h-48 w-48" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-morita-sand/50 mb-6">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-morita-mulberry/10 rounded-xl text-morita-mulberry">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-semibold text-morita-charcoal flex items-center gap-1.5">
                  Estadísticas del Barrio <span className="text-xs bg-morita-mulberry text-white px-2 py-0.5 rounded-full font-sans font-bold uppercase tracking-wider">Admin</span>
                </h2>
                <p className="text-xs text-morita-charcoal/60">
                  Resumen de actividad vecinal y flujos de colaboración en La Morita.
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setIsStatsOpen(!isStatsOpen)}
              className="text-xs font-semibold text-morita-mulberry hover:text-morita-mulberry-dark hover:underline flex items-center gap-1 cursor-pointer"
            >
              {isStatsOpen ? 'Ocultar gráficos 🙈' : 'Mostrar gráficos 📊'}
            </button>
          </div>

          {isStatsOpen && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: KPI Metric summary - 4 cols */}
              <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
                <div className="bg-morita-sand/20 border border-morita-sand/65 p-4 rounded-xl flex flex-col justify-center items-center text-center">
                  <div className="p-3 bg-morita-leaf/15 rounded-full text-morita-leaf mb-2.5">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <span className="text-3xl font-bold text-morita-charcoal leading-none">
                    {stats.totalCompleted}
                  </span>
                  <span className="text-xs font-bold text-morita-charcoal/70 mt-1 uppercase tracking-wider">
                    Intercambios Completados
                  </span>
                  <p className="text-[10px] text-morita-charcoal/50 mt-1">
                    Favores, transacciones y préstamos finalizados con éxito.
                  </p>
                </div>

                <div className="bg-morita-sand/20 border border-morita-sand/65 p-4 rounded-xl flex flex-col justify-center items-center text-center">
                  <div className="p-3 bg-morita-terracotta/15 rounded-full text-morita-terracotta mb-2.5">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <span className="text-3xl font-bold text-morita-charcoal leading-none">
                    {stats.totalPublications}
                  </span>
                  <span className="text-xs font-bold text-morita-charcoal/70 mt-1 uppercase tracking-wider">
                    Publicaciones Activas
                  </span>
                  <p className="text-[10px] text-morita-charcoal/50 mt-1">
                    Anuncios de productos, servicios y necesidades en el feed.
                  </p>
                </div>
              </div>

              {/* Middle Column: Categorías más solicitadas (Custom SVG / Bar visualization) - 4 cols */}
              <div className="lg:col-span-4 bg-morita-sand/10 border border-morita-sand/40 p-4 rounded-xl">
                <h3 className="text-xs font-bold text-morita-charcoal/70 uppercase tracking-wider mb-3.5 flex items-center gap-1.5 border-b border-morita-sand/40 pb-2">
                  <BarChart3 className="h-3.5 w-3.5 text-morita-mulberry" />
                  Categorías más solicitadas
                </h3>
                <div className="space-y-3">
                  {stats.categoryData.slice(0, 5).map((cat) => {
                    const pct = Math.max(5, Math.min(100, (cat.count / stats.maxCount) * 100));
                    return (
                      <div key={cat.name} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-morita-charcoal/85 truncate max-w-[150px]" title={cat.name}>
                            {cat.name}
                          </span>
                          <span className="font-bold text-morita-mulberry shrink-0">
                            {cat.count} {cat.count === 1 ? 'solicitud' : 'solicitudes'}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-morita-sand/40 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-morita-mulberry rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Vecinos más activos - 4 cols */}
              <div className="lg:col-span-4 bg-morita-sand/10 border border-morita-sand/40 p-4 rounded-xl">
                <h3 className="text-xs font-bold text-morita-charcoal/70 uppercase tracking-wider mb-3.5 flex items-center gap-1.5 border-b border-morita-sand/40 pb-2">
                  <Award className="h-3.5 w-3.5 text-morita-terracotta" />
                  Vecinos más activos
                </h3>
                <div className="space-y-2.5">
                  {stats.topNeighbors.length === 0 ? (
                    <p className="text-xs text-morita-charcoal/50 text-center py-6">
                      Aún no hay suficiente actividad de vecinos registrada.
                    </p>
                  ) : (
                    stats.topNeighbors.map((item, index) => (
                      <button
                        key={item.user.id}
                        onClick={() => onOpenProfile(item.user.id)}
                        className="w-full flex items-center justify-between p-1.5 hover:bg-morita-sand/30 rounded-lg transition-all text-left group cursor-pointer animate-fade-in"
                      >
                        <div className="flex items-center space-x-2 min-w-0">
                          <div className="relative">
                            <img
                              src={item.user.avatar}
                              alt={item.user.name}
                              className="h-8 w-8 rounded-full object-cover border border-morita-sand/80 shrink-0"
                            />
                            <span className="absolute -top-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full bg-morita-terracotta text-[9px] font-bold text-white shadow-xs">
                              {index + 1}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <span className="block text-xs font-bold text-morita-charcoal group-hover:text-morita-mulberry transition-colors truncate">
                              {item.user.name}
                            </span>
                            <span className="block text-[10px] text-morita-charcoal/55 truncate">
                              {item.user.zone}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0 pl-1">
                          <span className="block text-xs font-bold text-morita-terracotta">
                            {item.score} pts
                          </span>
                          <span className="block text-[9px] text-morita-charcoal/40">
                            {item.pubCount} pub • {item.reqCount} rtas
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* Primary Search and Filters Bar */}
      <div className="bg-white rounded-xl border border-morita-sand p-4 shadow-xs mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Search Box with Real-Time Suggestions */}
          <div className="relative flex-1" ref={searchContainerRef}>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-morita-charcoal/40" />
            <input
              id="search-input"
              type="text"
              placeholder="Buscar empanadas, cortar césped, préstamo de escalera..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-morita-sand/80 focus:outline-hidden focus:ring-2 focus:ring-morita-mulberry/40 text-sm placeholder:text-morita-charcoal/40"
            />

            {/* Suggestions Dropdown Popover */}
            {isSearchFocused && searchQuery.trim().length > 0 && (suggestions.publications.length > 0 || suggestions.neighbors.length > 0) && (
              <div 
                className="absolute left-0 right-0 mt-1.5 bg-white border border-morita-sand rounded-xl shadow-lg z-50 overflow-hidden divide-y divide-morita-sand/40 max-h-[420px] overflow-y-auto animate-fade-in"
                id="search-suggestions-popover"
              >
                {/* Publications Suggestions Group */}
                {suggestions.publications.length > 0 && (
                  <div className="p-3">
                    <span className="block text-[10px] font-bold text-morita-charcoal/50 uppercase tracking-wider mb-2 px-1">
                      📢 Publicaciones Recomendadas
                    </span>
                    <div className="space-y-1.5">
                      {suggestions.publications.map((p) => {
                        const styles = getTypeStyles(p.type);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setIsSearchFocused(false);
                              onRequestHelp(p);
                            }}
                            className="w-full text-left p-2 hover:bg-morita-sand/15 rounded-lg transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                          >
                            <div className="min-w-0 flex-1">
                              <span className="block text-xs font-bold text-morita-charcoal group-hover:text-morita-mulberry transition-colors truncate">
                                {p.title}
                              </span>
                              <span className="block text-[10px] text-morita-charcoal/55 truncate">
                                por <span className="font-semibold">{p.authorName}</span> • {p.zone}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1.5 shrink-0">
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md border uppercase tracking-wider ${styles.bg}`}>
                                {p.type}
                              </span>
                              <span className="text-[10px] font-bold text-morita-mulberry bg-morita-beige border border-morita-sand/35 px-1.5 py-0.5 rounded-md">
                                {p.priceType === 'monto' ? (
                                  p.priceValue
                                    ? p.priceValue.replace(/\$/g, 'Bs.').replace(/Bs\.\s*Bs\./i, 'Bs.').toLowerCase().includes('bs')
                                      ? p.priceValue.replace(/\$/g, 'Bs.').replace(/Bs\.\s*Bs\./i, 'Bs.')
                                      : `Bs. ${p.priceValue}`
                                    : ''
                                ) : p.priceType === 'a-consultar' ? 'Consultar' : 'Favor'}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Neighbors Suggestions Group */}
                {suggestions.neighbors.length > 0 && (
                  <div className="p-3">
                    <span className="block text-[10px] font-bold text-morita-charcoal/50 uppercase tracking-wider mb-2 px-1">
                      👥 Vecinos Coincidentes
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {suggestions.neighbors.map((neighbor) => {
                        const isMe = neighbor.id === currentUser.id;
                        return (
                          <button
                            key={neighbor.id}
                            type="button"
                            onClick={() => {
                              setIsSearchFocused(false);
                              onOpenProfile(neighbor.id);
                            }}
                            className="w-full text-left p-2 hover:bg-morita-sand/15 rounded-lg transition-colors flex items-center gap-2.5 cursor-pointer group"
                          >
                            <img
                              src={neighbor.avatar}
                              alt={neighbor.name}
                              className="h-7 w-7 rounded-full object-cover border border-morita-sand/60"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="block text-xs font-bold text-morita-charcoal group-hover:text-morita-mulberry transition-colors truncate">
                                {neighbor.name} {isMe && <span className="text-[8px] bg-morita-sand px-1 rounded-full text-morita-mulberry font-bold">Tú</span>}
                              </span>
                              <span className="block text-[9px] text-morita-charcoal/50 truncate">
                                📍 {neighbor.zone}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Footer bar for search query */}
                <div className="bg-morita-beige/30 p-2 text-center text-[10px] font-medium text-morita-charcoal/50">
                  Mostrando sugerencias para "<span className="font-bold text-morita-mulberry">{searchQuery}</span>". Presioná <span className="font-bold">Enter</span> o hacé clic afuera para ver la lista completa.
                </div>
              </div>
            )}
          </div>

          {/* Quick Type Filter Tabs */}
          <div className="flex bg-morita-beige p-1 rounded-lg border border-morita-sand overflow-x-auto gap-1">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap transition-all ${
                selectedType === 'all'
                  ? 'bg-white text-morita-mulberry shadow-xs font-bold'
                  : 'text-morita-charcoal/70 hover:text-morita-mulberry'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedType('vendo')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap transition-all ${
                selectedType === 'vendo'
                  ? 'bg-morita-terracotta text-white shadow-xs font-bold'
                  : 'text-morita-charcoal/70 hover:text-morita-terracotta'
              }`}
            >
              Vendo (Productos)
            </button>
            <button
              onClick={() => setSelectedType('ofrezco')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap transition-all ${
                selectedType === 'ofrezco'
                  ? 'bg-morita-mulberry text-white shadow-xs font-bold'
                  : 'text-morita-charcoal/70 hover:text-morita-mulberry'
              }`}
            >
              Ofrezco (Servicios)
            </button>
            <button
              onClick={() => setSelectedType('necesito')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap transition-all ${
                selectedType === 'necesito'
                  ? 'bg-morita-leaf text-white shadow-xs font-bold'
                  : 'text-morita-charcoal/70 hover:text-morita-leaf'
              }`}
            >
              Necesito (Pedidos)
            </button>
          </div>

          {/* Advanced Filter Toggle Button */}
          <button
            id="toggle-filters"
            onClick={() => {
              setShowAdvancedFilters(!showAdvancedFilters);
              if (showNeighborDirectory) setShowNeighborDirectory(false);
            }}
            className={`flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-lg border text-sm font-semibold cursor-pointer transition-colors ${
              showAdvancedFilters || selectedZone || priceFilter !== 'all' || sortBy !== 'recent'
                ? 'bg-morita-sand text-morita-mulberry border-morita-mulberry'
                : 'border-morita-sand text-morita-charcoal/80 hover:bg-morita-sand/30'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filtros</span>
          </button>

          {/* Neighbors Directory Toggle Button */}
          <button
            onClick={() => {
              setShowNeighborDirectory(!showNeighborDirectory);
              if (showAdvancedFilters) setShowAdvancedFilters(false);
            }}
            className={`flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-lg border text-sm font-semibold cursor-pointer transition-colors ${
              showNeighborDirectory
                ? 'bg-morita-sand text-morita-mulberry border-morita-mulberry'
                : 'border-morita-sand text-morita-charcoal/80 hover:bg-morita-sand/30'
            }`}
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Directorio</span>
          </button>
        </div>

        {/* Advanced Filter Drawer */}
        {showAdvancedFilters && (
          <div id="advanced-filters" className="mt-4 pt-4 border-t border-morita-sand/50 grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Filter by neighborhood zone */}
            <div>
              <label className="block text-xs font-bold text-morita-charcoal/75 mb-1.5 uppercase tracking-wider">
                Filtrar por Zona / Calle
              </label>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full text-xs rounded-lg border border-morita-sand p-2 bg-white focus:ring-2 focus:ring-morita-mulberry/40"
              >
                <option value="">Todas las calles del barrio</option>
                {zonesList.map(zone => (
                  <option key={zone} value={zone.replace('Calle ', '').replace('Pasaje ', '').replace('Av. ', '')}>
                    {zone}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by price mode */}
            <div>
              <label className="block text-xs font-bold text-morita-charcoal/75 mb-1.5 uppercase tracking-wider">
                Modalidad de Pago
              </label>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value as any)}
                className="w-full text-xs rounded-lg border border-morita-sand p-2 bg-white focus:ring-2 focus:ring-morita-mulberry/40"
              >
                <option value="all">Todas las modalidades</option>
                <option value="monto">Precio fijo / Monto</option>
                <option value="a-consultar">Precio a consultar</option>
                <option value="intercambio">Intercambio de favores / Gratis</option>
              </select>
            </div>

            {/* Sort options */}
            <div>
              <label className="block text-xs font-bold text-morita-charcoal/75 mb-1.5 uppercase tracking-wider">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full text-xs rounded-lg border border-morita-sand p-2 bg-white focus:ring-2 focus:ring-morita-mulberry/40"
              >
                <option value="recent">Más recientes primero</option>
                <option value="title">Título (A-Z)</option>
              </select>
            </div>
          </div>
        )}

        {/* Neighbors Directory Drawer */}
        {showNeighborDirectory && (
          <div id="neighbor-directory-drawer" className="mt-4 pt-4 border-t border-morita-sand/50 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <h4 className="text-xs font-bold text-morita-charcoal uppercase tracking-wider flex items-center gap-1.5">
                <Users className="h-4 w-4 text-morita-mulberry" />
                <span>Directorio de Vecinos de La Morita ({allUsers.length})</span>
              </h4>
              <span className="text-[10px] text-morita-charcoal/50 font-medium">Hacé clic en un vecino para ver su muro y publicaciones</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {allUsers.map((neighbor) => {
                const isMe = neighbor.id === currentUser.id;
                return (
                  <button
                    key={neighbor.id}
                    onClick={() => onOpenProfile(neighbor.id)}
                    className="p-3 bg-morita-sand/10 border border-morita-sand/40 hover:border-morita-mulberry/50 hover:bg-morita-sand/20 rounded-xl flex items-center gap-2.5 transition-all text-left cursor-pointer group"
                  >
                    <img
                      src={neighbor.avatar}
                      alt={neighbor.name}
                      className="h-9 w-9 rounded-full object-cover border border-morita-sand/80 shadow-3xs shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="block text-xs font-bold text-morita-charcoal truncate group-hover:text-morita-mulberry transition-colors">
                        {neighbor.name} {isMe && <span className="text-[9px] bg-morita-sand px-1 rounded-full text-morita-mulberry font-bold">Tú</span>}
                      </span>
                      <span className="block text-[10px] text-morita-charcoal/50 truncate flex items-center gap-0.5 mt-0.5">
                        <MapPin className="h-2.5 w-2.5 text-morita-terracotta shrink-0" />
                        <span>{neighbor.zone}</span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Category Tags Scroller */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-4 no-scrollbar">
        <span className="text-xs font-bold text-morita-charcoal/50 uppercase tracking-wider shrink-0 mr-1">
          Categoría:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap active:scale-95 transition-all ${
              selectedCategory === cat
                ? 'bg-morita-mulberry text-white font-bold shadow-xs'
                : 'bg-white border border-morita-sand text-morita-charcoal/75 hover:border-morita-mulberry hover:text-morita-mulberry'
            }`}
          >
            {cat === 'all' ? 'Ver todas' : cat}
          </button>
        ))}
      </div>

      {/* Automatic Tags Scroller */}
      {allActiveTags.length > 0 && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-8 no-scrollbar border-b border-morita-sand/30">
          <span className="text-xs font-bold text-morita-charcoal/50 uppercase tracking-wider shrink-0 mr-1">
            Etiqueta Automática:
          </span>
          <button
            onClick={() => setSelectedAutoTag('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap active:scale-95 transition-all ${
              selectedAutoTag === 'all'
                ? 'bg-morita-terracotta text-white font-bold shadow-xs'
                : 'bg-white border border-morita-sand text-morita-charcoal/75 hover:border-morita-terracotta hover:text-morita-terracotta'
            }`}
          >
            Todas
          </button>
          {allActiveTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedAutoTag(tag)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap active:scale-95 transition-all ${
                selectedAutoTag === tag
                  ? 'bg-morita-terracotta text-white font-bold shadow-xs'
                  : 'bg-white border border-morita-sand text-morita-charcoal/75 hover:border-morita-terracotta hover:text-morita-terracotta'
              }`}
            >
              🏷️ {tag}
            </button>
          ))}
        </div>
      )}

      {/* Matching Neighbors Section */}
      {searchQuery && matchedNeighbors.length > 0 && (
        <div id="matched-neighbors-section" className="bg-morita-sand/15 border border-morita-sand/40 p-4 rounded-2xl mb-6">
          <div className="flex items-center space-x-1.5 mb-2.5">
            <Users className="h-4 w-4 text-morita-mulberry" />
            <h3 className="text-xs font-bold text-morita-charcoal uppercase tracking-wider">
              Vecinos que coinciden con tu búsqueda ({matchedNeighbors.length})
            </h3>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {matchedNeighbors.map((neighbor) => {
              const isMe = neighbor.id === currentUser.id;
              return (
                <button
                  key={neighbor.id}
                  onClick={() => onOpenProfile(neighbor.id)}
                  className="px-3 py-2 bg-white hover:border-morita-mulberry/50 hover:bg-morita-sand/10 border border-morita-sand rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer text-left shadow-3xs"
                >
                  <img
                    src={neighbor.avatar}
                    alt={neighbor.name}
                    className="h-8 w-8 rounded-full object-cover border border-morita-sand"
                  />
                  <div className="min-w-0">
                    <span className="block text-xs font-bold text-morita-charcoal leading-none">
                      {neighbor.name} {isMe && <span className="text-[8px] bg-morita-sand px-1 rounded-full text-morita-mulberry font-bold">Tú</span>}
                    </span>
                    <span className="block text-[10px] text-morita-charcoal/50 leading-none mt-1">
                      📍 {neighbor.zone}
                    </span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-morita-mulberry shrink-0 ml-1" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2-Column Responsive Layout: Main Feed + Junta Vecinal Billboard */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start mt-6">
        
        {/* Left Column: Publications Feed */}
        <div className="lg:col-span-3 space-y-6">

          {/* Primeros Pasos / Getting Started Section */}
          {isGuideOpen && (
            <div className="bg-gradient-to-br from-amber-50/75 to-orange-50/50 rounded-2xl border border-amber-250 p-5 shadow-3xs animate-fade-in relative overflow-hidden">
              {/* Subtle background decoration */}
              <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 pointer-events-none">
                <BookOpen className="h-44 w-44 text-amber-950" />
              </div>

              <div className="flex items-center justify-between gap-4 border-b border-amber-200 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 bg-amber-500/10 text-amber-800 rounded-lg">
                    <BookOpen className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-xs font-serif font-bold text-morita-charcoal uppercase tracking-wider">
                      Primeros pasos en La Morita
                    </h2>
                    <p className="text-[10px] text-morita-charcoal/60">
                      Una guía rápida para vecinos nuevos. ¡Hacé tu parte por la comunidad!
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsGuideOpen(false)}
                  className="text-[10px] text-morita-charcoal/60 hover:text-morita-mulberry font-bold px-2.5 py-1 rounded-lg hover:bg-amber-100/60 transition-colors cursor-pointer flex items-center gap-1 border border-amber-200/50 bg-white/60"
                  title="Minimizar u ocultar los primeros pasos"
                >
                  <span>Minimizar / Ocultar guía</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Paso 1 */}
                <div className="bg-white/90 p-4 rounded-xl border border-amber-200/50 flex flex-col justify-between shadow-4xs">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="flex items-center justify-center h-5 w-5 rounded-full bg-amber-500/10 text-amber-800 text-[10px] font-extrabold">
                        1
                      </span>
                      <h3 className="text-[11px] font-bold text-morita-charcoal uppercase tracking-wide">Completá tu Perfil</h3>
                    </div>
                    <p className="text-[11px] text-morita-charcoal/70 leading-relaxed font-sans">
                      Asegurá que tu teléfono, correo y calle/zona del barrio estén listos para que tus vecinos puedan contactarte fácilmente.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenProfile(currentUser.id)}
                    className="mt-3 w-full text-center text-[10px] font-bold py-1.5 rounded-lg bg-morita-sand/30 hover:bg-morita-sand/60 text-morita-charcoal transition-all border border-morita-sand/40 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Ver Mi Perfil</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>

                {/* Paso 2 */}
                <div className="bg-white/90 p-4 rounded-xl border border-amber-200/50 flex flex-col justify-between shadow-4xs">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="flex items-center justify-center h-5 w-5 rounded-full bg-amber-500/10 text-amber-800 text-[10px] font-extrabold">
                        2
                      </span>
                      <h3 className="text-[11px] font-bold text-morita-charcoal uppercase tracking-wide">Publicá un Anuncio</h3>
                    </div>
                    <p className="text-[11px] text-morita-charcoal/70 leading-relaxed font-sans">
                      ¿Ofrecés repostería, reparación o necesitás prestada una escalera? Creá tu primera publicación para darte a conocer.
                    </p>
                  </div>
                  {currentUser.id !== 'guest' && onOpenPublish ? (
                    <button
                      type="button"
                      onClick={onOpenPublish}
                      className="mt-3 w-full text-center text-[10px] font-bold py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-4xs font-sans"
                    >
                      <span>Hacer Publicación</span>
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <div className="mt-3 text-center text-[10px] font-bold text-amber-900 bg-amber-500/10 rounded-lg py-1.5 border border-amber-300/50">
                      Creá una cuenta para publicar
                    </div>
                  )}
                </div>

                {/* Paso 3 */}
                <div className="bg-white/90 p-4 rounded-xl border border-amber-200/50 flex flex-col justify-between shadow-4xs">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="flex items-center justify-center h-5 w-5 rounded-full bg-amber-500/10 text-amber-800 text-[10px] font-extrabold">
                        3
                      </span>
                      <h3 className="text-[11px] font-bold text-morita-charcoal uppercase tracking-wide">Pedir o Ayudar</h3>
                    </div>
                    <p className="text-[11px] text-morita-charcoal/70 leading-relaxed font-sans">
                      Explorá el muro. Al presionar <strong>"Pedir"</strong> o <strong>"Ayudar"</strong> en una tarjeta, se iniciará un chat privado para coordinar el favor o intercambio.
                    </p>
                  </div>
                  <div className="mt-3 text-center text-[10px] font-bold text-amber-800 bg-amber-500/10 rounded-lg py-1.5 flex items-center justify-center gap-1 border border-amber-200/30">
                    <MessageSquare className="h-3 w-3" />
                    <span>¡Coordiná cara a cara!</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Button to show guide if hidden */}
          {!isGuideOpen && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsGuideOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-300 hover:bg-amber-500/20 text-amber-900 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs uppercase tracking-wide active:scale-95"
              >
                <BookOpen className="h-3.5 w-3.5 text-amber-700" />
                <span>Desplegar guía de primeros pasos</span>
              </button>
            </div>
          )}

          {/* Grid Results count */}
          <div className="flex justify-between items-center px-1">
            <p className="text-xs font-semibold text-morita-charcoal/65">
              Mostrando {filteredPublications.length} publicaciones {selectedType !== 'all' ? `de tipo "${selectedType.toUpperCase()}"` : ''}
            </p>
            {(searchQuery || selectedType !== 'all' || selectedCategory !== 'all' || selectedZone || priceFilter !== 'all' || highlightedPubId) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                  setSelectedCategory('all');
                  setSelectedZone('');
                  setPriceFilter('all');
                  if (highlightedPubId) handleClearHighlight();
                }}
                className="text-xs text-morita-mulberry font-bold hover:underline cursor-pointer"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {/* Banner de Publicación Compartida por WhatsApp */}
          {highlightedPubId && highlightedPub && (
            <div className="bg-green-50/70 border border-green-200/90 rounded-2xl p-4 mt-4 mb-6 shadow-4xs animate-fade-in flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start space-x-3 min-w-0">
                <div className="p-2 bg-green-100 rounded-xl text-green-700 shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-serif font-bold text-green-800 flex items-center gap-1.5">
                    Anuncio compartido por un vecino 📲
                  </h4>
                  <p className="text-xs text-green-700 leading-relaxed mt-1">
                    Te enviaron un enlace de confianza de La Morita para ver este anuncio de <strong>{highlightedPub.authorName}</strong>. ¡Podés coordinar o ayudar directamente!
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearHighlight}
                className="w-full md:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-all shadow-3xs cursor-pointer flex items-center justify-center space-x-1 shrink-0"
              >
                <span>Explorar todo el barrio 🏡</span>
              </button>
            </div>
          )}

      {/* Cards Grid */}
      {filteredPublications.length === 0 ? (
        isFavoritesTab ? (
          <div className="bg-white rounded-2xl border border-morita-sand p-12 text-center max-w-lg mx-auto shadow-xs">
            <Heart className="h-10 w-10 text-morita-mulberry/30 mx-auto mb-4" />
            <h3 className="text-lg font-serif font-bold text-morita-charcoal">No tenés favoritos guardados</h3>
            <p className="text-xs text-morita-charcoal/70 mt-2 max-w-sm mx-auto leading-relaxed">
              Para guardar publicaciones interesantes, hacé clic en el corazón de las tarjetas de cualquier publicación en la sección "Explorar Barrio".
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-morita-sand p-12 text-center max-w-lg mx-auto shadow-xs">
            <AlertTriangle className="h-10 w-10 text-morita-terracotta mx-auto mb-4" />
            <h3 className="text-lg font-serif font-bold text-morita-charcoal">No se encontraron publicaciones</h3>
            <p className="text-xs text-morita-charcoal/70 mt-2 max-w-sm mx-auto leading-relaxed">
              Probá buscando otra palabra clave o cambiando las categorías de los filtros arriba. ¡O sé el primero del barrio en publicar algo sobre esto!
            </p>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPublications.map((p) => {
            const styles = getTypeStyles(p.type);
            const isOwnPublication = p.userId === currentUser.id;

            return (
              <article
                key={p.id}
                className={`bg-white rounded-2xl border transition-all flex flex-col overflow-hidden group ${
                  p.isActive === false
                    ? 'border-amber-200 bg-amber-50/5 opacity-90 shadow-2xs'
                    : 'border-morita-sand/70 shadow-xs hover:shadow-md'
                }`}
              >
                
                {/* Author Info Bar */}
                <div className="px-4 py-3 border-b border-morita-sand/40 flex items-center justify-between">
                  <button
                    onClick={() => onOpenProfile(p.userId)}
                    className="flex items-center space-x-2 text-left group/author cursor-pointer"
                  >
                    <img
                      src={p.authorAvatar}
                      alt={p.authorName}
                      className="h-7 w-7 rounded-full object-cover border border-morita-sand"
                    />
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-morita-charcoal group-hover/author:text-morita-mulberry truncate">
                        {p.authorName} {isOwnPublication && <span className="text-[10px] text-morita-terracotta italic">(Tú)</span>}
                      </span>
                      <span className="block text-[10px] text-morita-charcoal/50 truncate">
                        {p.zone}
                      </span>
                    </div>
                  </button>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${styles.bg}`}>
                    {styles.label.split(' ')[0]}
                  </span>
                </div>

                {/* Publication Image */}
                <div className="relative aspect-video w-full bg-morita-beige overflow-hidden">
                  {p.photo ? (
                    <img
                      src={p.photo}
                      alt={p.title}
                      referrerPolicy="no-referrer"
                      className={`w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 ${
                        p.isActive === false ? 'opacity-40 saturate-50' : ''
                      }`}
                    />
                  ) : (
                    <div className={`w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br text-center ${getCategoryFallbackGradient(p.category)} ${
                      p.isActive === false ? 'opacity-50' : ''
                    }`}>
                      <span className="text-3xl mb-1">🏡</span>
                      <span className="text-xs font-bold tracking-wide uppercase opacity-75">{p.category}</span>
                    </div>
                  )}

                  {/* Absolute Badge Category */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-morita-charcoal border border-morita-sand shadow-xs">
                    {p.category}
                  </div>

                  {/* Absolute Favorite Button */}
                  {onToggleFavorite && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onToggleFavorite(p.id);
                      }}
                      className="absolute top-3 right-3 bg-white/95 hover:bg-white text-morita-charcoal p-1.5 rounded-full border border-morita-sand shadow-xs hover:scale-110 transition-all cursor-pointer z-10 group/fav"
                      title={favorites?.includes(p.id) ? "Quitar de favoritos" : "Guardar en favoritos"}
                    >
                      <Heart
                        className={`h-4 w-4 transition-colors ${
                          favorites?.includes(p.id)
                            ? 'fill-morita-terracotta text-morita-terracotta'
                            : 'text-morita-charcoal/60 group-hover/fav:text-morita-terracotta'
                        }`}
                      />
                    </button>
                  )}

                  {/* Absolute Inactive Banner */}
                  {p.isActive === false && (
                    <div className="absolute inset-0 bg-morita-charcoal/40 flex items-center justify-center p-3 text-center">
                      <span className="bg-amber-600 border border-amber-400 text-white font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                        ⚠️ Sin stock / Horario pausado
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-serif font-bold text-morita-charcoal leading-tight group-hover:text-morita-mulberry transition-colors">
                      {p.title}
                    </h3>
                    
                    {/* Render Auto Tags */}
                    <div className="flex flex-wrap gap-1 mt-2 mb-1.5">
                      {getAutoTags(p.title, p.description).map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedAutoTag(tag);
                          }}
                          className={`inline-flex items-center text-[9px] px-2 py-0.5 rounded-full font-semibold border cursor-pointer hover:bg-morita-terracotta hover:text-white transition-all ${
                            selectedAutoTag === tag
                              ? 'bg-morita-terracotta text-white border-morita-terracotta'
                              : 'bg-morita-sand/20 text-morita-charcoal/70 border-morita-sand/60'
                          }`}
                        >
                          🏷️ {tag}
                        </button>
                      ))}
                    </div>

                    <p className="text-xs text-morita-charcoal/70 line-clamp-3 mt-1 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-morita-sand/40">
                    
                    {/* Price and Availability Info */}
                    <div className="flex flex-col gap-1 mb-3">
                      <div className="flex items-center space-x-1.5 text-morita-charcoal">
                        <span className="text-[11px] font-bold text-morita-charcoal/50 uppercase tracking-wider">Pago/Valor:</span>
                        <span className="text-sm font-bold text-morita-mulberry">
                          {p.priceType === 'monto' && (() => {
                            const cleaned = p.priceValue ? p.priceValue.replace(/\$/g, 'Bs.').replace(/Bs\.\s*Bs\./i, 'Bs.') : '';
                            return cleaned.toLowerCase().includes('bs') ? cleaned : `Bs. ${cleaned}`;
                          })()}
                          {p.priceType === 'a-consultar' && 'A consultar 💬'}
                          {p.priceType === 'intercambio' && 'Intercambio / Favor 🤝'}
                        </span>
                      </div>

                      {p.availability && (
                        <div className="flex items-center space-x-1 text-morita-charcoal/60 text-[11px]">
                          <Calendar className="h-3.5 w-3.5 text-morita-terracotta shrink-0" />
                          <span className="truncate">{p.availability}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="space-y-2">
                      {isOwnPublication ? (
                        <div className="space-y-1.5">
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => onToggleActive && onToggleActive(p.id)}
                              className={`py-2 px-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                                p.isActive !== false
                                  ? 'bg-morita-leaf/10 hover:bg-morita-leaf/20 border-morita-leaf/30 text-morita-leaf'
                                  : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-600'
                              }`}
                            >
                              {p.isActive !== false ? (
                                <>
                                  <Eye className="h-3 w-3 shrink-0" />
                                  <span>Pausar</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="h-3 w-3 shrink-0" />
                                  <span>Activar</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => onEditPublication && onEditPublication(p)}
                              className="py-2 px-1.5 rounded-lg text-[10px] font-bold border border-morita-sand bg-white text-morita-charcoal hover:bg-morita-sand/30 hover:text-morita-mulberry transition-all cursor-pointer flex items-center justify-center space-x-1 shadow-2xs"
                            >
                              <Edit className="h-3.5 w-3.5 text-morita-mulberry shrink-0" />
                              <span>Editar</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm('¿Estás seguro de que querés borrar esta publicación definitivamente?')) {
                                  onDeletePublication && onDeletePublication(p.id);
                                }
                              }}
                              className="py-2 px-1.5 rounded-lg text-[10px] font-bold border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-all cursor-pointer flex items-center justify-center space-x-1 shadow-2xs"
                              title="Borrar publicación"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-600 shrink-0" />
                              <span>Borrar</span>
                            </button>
                          </div>
                          <p className="text-[9px] text-center text-morita-charcoal/40 leading-none font-medium">
                            {p.isActive !== false ? 'Tus vecinos pueden pedir ahora' : 'Publicación pausada temporalmente'}
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={() => onRequestHelp(p)}
                          className={`w-full py-2 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center space-x-1 ${
                            p.isActive === false
                              ? 'bg-amber-600 hover:bg-amber-700 text-white'
                              : p.type === 'necesito'
                              ? 'bg-morita-leaf hover:bg-morita-leaf-dark text-white'
                              : 'bg-morita-mulberry hover:bg-morita-mulberry-dark text-white'
                          }`}
                        >
                          {p.isActive === false ? (
                            <>
                              <span>💬 Encargar / Coordinar horario</span>
                              <ChevronRight className="h-3.5 w-3.5" />
                            </>
                          ) : (
                            <>
                              <span>
                                {p.type === 'necesito' ? '🤝 Puedo ayudar con esto' : '💬 Me interesa'}
                              </span>
                              <ChevronRight className="h-3.5 w-3.5" />
                            </>
                          )}
                        </button>
                      )}

                      {/* Admin Quick Moderation Controls for any user's publication */}
                      {isAdmin && !isOwnPublication && (
                        <div className="flex items-center gap-1.5 pt-1 border-t border-purple-100 mt-2">
                          <button
                            type="button"
                            onClick={() => onEditPublication && onEditPublication(p)}
                            className="flex-1 py-1 px-2 rounded-lg text-[10px] font-bold bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            title="Editar o corregir esta publicación como Administrador"
                          >
                            <Edit className="h-3 w-3 text-purple-700" />
                            <span>Editar (Admin)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onToggleActive && onToggleActive(p.id)}
                            className="py-1 px-2 rounded-lg text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            title="Pausar o activar publicación como Administrador"
                          >
                            {p.isActive !== false ? <Eye className="h-3 w-3 text-amber-700" /> : <EyeOff className="h-3 w-3 text-amber-700" />}
                            <span>{p.isActive !== false ? 'Pausar' : 'Activar'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('¿Estás seguro de borrar esta publicación definitivamente de Supabase?')) {
                                onDeletePublication && onDeletePublication(p.id);
                              }
                            }}
                            className="py-1 px-2 rounded-lg text-[10px] font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            title="Borrar publicación definitivamente como Administrador"
                          >
                            <Trash2 className="h-3 w-3 text-red-600" />
                            <span>Borrar (Admin)</span>
                          </button>
                        </div>
                      )}

                      {/* Compartir por WhatsApp Link */}
                      <a
                        href={getWhatsAppShareUrl(p)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-1.5 rounded-lg text-[10px] font-bold border border-green-200 bg-green-50/50 hover:bg-green-100/70 text-green-700 hover:text-green-800 transition-all cursor-pointer flex items-center justify-center space-x-1 shadow-4xs"
                      >
                        <Share2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                        <span>Compartir en WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Relative timestamp in footer */}
                <div className="px-4 py-2 bg-morita-beige/30 border-t border-morita-sand/20 text-[9px] text-morita-charcoal/40 text-right font-medium">
                  Publicado hace {Math.max(1, Math.round((Date.now() - new Date(p.createdAt).getTime()) / 3600000))} {Math.round((Date.now() - new Date(p.createdAt).getTime()) / 3600000) === 1 ? 'hora' : 'horas'}
                </div>

              </article>
            );
          })}
        </div>
      )}
    </div> {/* Closes Left Column */}

    {/* Right Column: Cartelera de la Junta Vecinal */}
    <aside className="lg:col-span-1 space-y-5 lg:sticky lg:top-6 self-start">
      <div className="bg-white rounded-2xl border border-morita-sand/80 p-5 shadow-3xs">
        <div className="flex items-center space-x-2 border-b border-morita-sand pb-3 mb-4">
          <Megaphone className="h-4.5 w-4.5 text-morita-terracotta shrink-0 animate-bounce" />
          <div className="min-w-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-morita-charcoal">Cartelera del Barrio</h3>
            <span className="block text-[10px] text-morita-charcoal/50 leading-none">Junta Vecinal Morita Cre</span>
          </div>
        </div>

        {announcements.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-xs font-semibold text-morita-charcoal/55">No hay comunicados activos</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[70vh] lg:max-h-[75vh] overflow-y-auto pr-1 scrollbar-thin">
            {announcements.map((ann) => (
              <div 
                key={ann.id}
                className={`p-4 rounded-xl border relative transition-all duration-200 ${
                  ann.important 
                    ? 'bg-amber-500/5 border-amber-300 shadow-3xs' 
                    : 'bg-morita-sand/15 border-morita-sand/50 hover:bg-morita-sand/25'
                }`}
              >
                {ann.important && (
                  <div className="absolute top-2.5 right-2.5 flex items-center space-x-0.5 text-[8px] bg-amber-500/15 text-amber-800 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    <Pin className="h-2 w-2 text-amber-800 rotate-45 shrink-0" />
                    <span>Fijado</span>
                  </div>
                )}

                <h4 className="text-[11px] font-bold text-morita-charcoal pr-12 leading-snug">
                  {ann.title}
                </h4>

                <span className="block text-[8px] text-morita-charcoal/40 font-semibold uppercase tracking-wider mt-1 mb-2.5">
                  {new Date(ann.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>

                <div className="whitespace-pre-wrap text-[11px] text-morita-charcoal/80 leading-relaxed font-sans bg-white/75 p-3 rounded-lg border border-morita-sand/30">
                  {ann.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>

  </div> {/* Closes Outer Grid */}
    </div>
  );
}
