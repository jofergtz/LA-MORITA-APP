import React, { useState } from 'react';
import { User, Notification } from '../types';
import { Leaf, Bell, User as UserIcon, HelpCircle, MessageSquare, Check, Sparkles, PlusCircle, ShieldAlert, Heart, Menu, X, Edit } from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  allUsers: User[];
  notifications: Notification[];
  activeTab: string;
  isAdmin?: boolean;
  onNavigate: (tab: string) => void;
  onSwitchUser: (userId: string) => void;
  onOpenProfile: (userId: string) => void;
  onOpenPublish: () => void;
  onClearNotifications: () => void;
  onSelectNotification: (requestId: string) => void;
  onRegisterNewUserClick?: () => void;
  onEditProfileClick?: () => void;
  onOpenAdminLogin?: () => void;
}

export default function Header({
  currentUser,
  allUsers,
  notifications,
  activeTab,
  isAdmin = false,
  onNavigate,
  onSwitchUser,
  onOpenProfile,
  onOpenPublish,
  onClearNotifications,
  onSelectNotification,
  onRegisterNewUserClick,
  onEditProfileClick,
  onOpenAdminLogin
}: HeaderProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.read);
  const otherUsers = allUsers.filter(u => u.id !== currentUser.id);

  return (
    <header id="app-header" className="sticky top-0 z-40 w-full bg-white border-b border-morita-sand/60 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 min-w-0 gap-2">
          
          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden mr-1 p-1.5 rounded-lg hover:bg-morita-sand/50 text-morita-charcoal transition-colors cursor-pointer shrink-0"
            aria-label="Abrir menú"
          >
            {showMobileMenu ? <X className="h-5 w-5 text-morita-mulberry" /> : <Menu className="h-5 w-5 text-morita-charcoal" />}
          </button>
          
          {/* Logo & Slogan */}
          <div 
            id="logo-container" 
            className="flex items-center space-x-2 cursor-pointer shrink-0 min-w-0"
            onClick={() => onNavigate('feed')}
          >
            <div className="bg-morita-mulberry text-white p-1.5 sm:p-2 rounded-full shadow-xs transition-transform hover:scale-105 shrink-0">
              <Leaf className="h-4.5 w-4.5 sm:h-5 sm:w-5 fill-current text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-lg sm:text-xl font-display font-bold tracking-tight text-morita-charcoal truncate">
                La Morita
              </span>
              <span className="text-[9px] sm:text-[10px] font-medium tracking-wider text-morita-terracotta uppercase -mt-1 hidden sm:inline-block truncate">
                Red Vecinal Colaborativa
              </span>
            </div>
          </div>

          {/* Navigation Links for Large Screens */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              id="nav-feed"
              onClick={() => onNavigate('feed')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'feed'
                  ? 'bg-morita-sand text-morita-mulberry font-semibold'
                  : 'text-morita-charcoal/70 hover:text-morita-mulberry hover:bg-morita-sand/40'
              }`}
            >
              Explorar Barrio
            </button>
            <button
              id="nav-requests"
              onClick={() => onNavigate('requests')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors relative cursor-pointer ${
                activeTab === 'requests'
                  ? 'bg-morita-sand text-morita-mulberry font-semibold'
                  : 'text-morita-charcoal/70 hover:text-morita-mulberry hover:bg-morita-sand/40'
              }`}
            >
              Mis Solicitudes
            </button>
            <button
              id="nav-favorites"
              onClick={() => onNavigate('favorites')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors relative cursor-pointer flex items-center gap-1 ${
                activeTab === 'favorites'
                  ? 'bg-morita-sand text-morita-mulberry font-semibold'
                  : 'text-morita-charcoal/70 hover:text-morita-mulberry hover:bg-morita-sand/40'
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${activeTab === 'favorites' ? 'fill-morita-mulberry text-morita-mulberry' : 'text-morita-charcoal/50'}`} />
              <span>Mis Favoritos</span>
            </button>
            <button
              id="nav-profile"
              onClick={() => onOpenProfile(currentUser.id)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-morita-charcoal/70 hover:text-morita-mulberry hover:bg-morita-sand/40 transition-colors cursor-pointer"
            >
              Mi Perfil
            </button>

            {/* Panel Admin: Strictly CONDITIONAL - ONLY rendered if authenticated user is admin */}
            {isAdmin && (
              <button
                id="nav-admin"
                onClick={() => onNavigate('admin')}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-purple-700 text-white shadow-2xs'
                    : 'text-purple-800 hover:bg-purple-100 bg-purple-50/80 border border-purple-200/60'
                }`}
                title="Panel de Administración del barrio"
              >
                <ShieldAlert className="h-4 w-4" />
                <span>Panel Admin 🛡️</span>
              </button>
            )}
          </nav>

          {/* Utility Buttons Container */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0 min-w-0">
            
            {/* User / Account Switcher Dropdown */}
            <div className="relative">
              <button
                id="btn-user-account"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className={`flex items-center space-x-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                  currentUser.id === 'currentUser' || isAdmin
                    ? 'border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-950'
                    : currentUser.id === 'guest'
                    ? 'border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950'
                    : 'border-morita-sand bg-white hover:bg-morita-beige/50 text-morita-charcoal'
                }`}
                title="Cambiar de usuario o cuenta"
              >
                {isAdmin ? (
                  <Sparkles className="h-3.5 w-3.5 text-purple-700 shrink-0" />
                ) : (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="h-6 w-6 rounded-full object-cover border border-purple-200 shrink-0"
                  />
                )}
                <span className="text-xs font-bold max-w-[85px] truncate hidden sm:inline">
                  {isAdmin ? 'Admin' : currentUser.id === 'guest' ? 'Visitante' : currentUser.name.split(' ')[0]}
                </span>
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-xl bg-white shadow-xl border border-purple-200 py-2 z-50 animate-fade-in">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-purple-900 uppercase tracking-wider border-b border-purple-100 pb-2 mb-1 flex items-center justify-between">
                    <span>Cambiar de Cuenta / Vecino:</span>
                  </div>

                  {/* List of Registered Neighbors */}
                  <div className="max-h-56 overflow-y-auto">
                    {allUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          onSwitchUser(u.id);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full flex items-center space-x-2 px-3 py-2 text-left text-xs hover:bg-purple-50 transition-colors cursor-pointer ${
                          u.id === currentUser.id ? 'bg-purple-100/70 font-bold text-purple-950' : 'text-morita-charcoal'
                        }`}
                      >
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="h-6 w-6 rounded-full object-cover border border-purple-200 shrink-0"
                        />
                        <div className="flex-1 truncate">
                          <div className="font-semibold">{u.name} {u.isAdmin && '(Admin)'}</div>
                          <div className="text-[10px] text-morita-charcoal/60 truncate">{u.zone}</div>
                        </div>
                        {u.id === currentUser.id && <Check className="h-3.5 w-3.5 text-purple-700 shrink-0" />}
                      </button>
                    ))}
                  </div>

                  {/* Option: View as Guest / Visitante */}
                  {currentUser.id !== 'guest' && (
                    <div className="border-t border-purple-100 pt-1">
                      <button
                        onClick={() => {
                          onSwitchUser('guest');
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-50 flex items-center space-x-2 transition-colors cursor-pointer"
                      >
                        <UserIcon className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                        <span>Ver como Visitante 👤</span>
                      </button>
                    </div>
                  )}

                  {/* Option: Admin Portal Access link */}
                  {!isAdmin && onOpenAdminLogin && (
                    <div className="border-t border-purple-100 pt-1 mt-1">
                      <button
                        onClick={() => {
                          onOpenAdminLogin();
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-purple-900 bg-purple-50 hover:bg-purple-100 flex items-center space-x-2 transition-colors cursor-pointer"
                      >
                        <ShieldAlert className="h-3.5 w-3.5 text-purple-700 shrink-0" />
                        <span>Acceso Administrador 🔐</span>
                      </button>
                    </div>
                  )}

                  {/* Option: Register new user */}
                  {onRegisterNewUserClick && (
                    <div className="px-2 py-1.5 border-t border-purple-100">
                      <button
                        onClick={() => {
                          onRegisterNewUserClick();
                          setShowUserDropdown(false);
                        }}
                        className="w-full py-1.5 px-2 bg-morita-mulberry hover:bg-morita-mulberry/90 text-white font-bold text-[11px] rounded-lg transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <PlusCircle className="h-3 w-3 text-white shrink-0" />
                        <span>Registrar Nuevo Vecino</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notification bell */}
            <div className="relative">
              <button
                id="btn-notifications"
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                className="p-1.5 sm:p-2 rounded-full hover:bg-morita-sand/50 text-morita-charcoal/70 hover:text-morita-mulberry transition-colors relative cursor-pointer shrink-0"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-morita-terracotta text-[9px] font-bold text-white animate-pulse">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              {showNotificationDropdown && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] rounded-xl bg-white shadow-lg border border-morita-sand py-2 z-50">
                  <div className="flex justify-between items-center px-4 py-2 border-b border-morita-sand pb-2 mb-1">
                    <span className="text-xs font-bold text-morita-charcoal uppercase tracking-wider">
                      Notificaciones ({unreadNotifications.length})
                    </span>
                    {notifications.length > 0 && (
                      <button
                        onClick={() => {
                          onClearNotifications();
                          setShowNotificationDropdown(false);
                        }}
                        className="text-[11px] text-morita-mulberry hover:underline cursor-pointer"
                      >
                        Marcar como leídas
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-morita-charcoal/50">
                        No tenés notificaciones nuevas
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            onSelectNotification(n.requestId);
                            setShowNotificationDropdown(false);
                          }}
                          className={`px-4 py-2.5 hover:bg-morita-sand/20 cursor-pointer transition-colors border-b border-morita-sand/30 last:border-0 ${
                            !n.read ? 'bg-morita-sand/10 font-medium' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            <div className={`p-1 rounded-full mt-0.5 shrink-0 ${
                              n.type === 'new_request' ? 'bg-morita-terracotta/10 text-morita-terracotta' :
                              n.type === 'status_change' ? 'bg-morita-leaf/10 text-morita-leaf' :
                              'bg-morita-mulberry/10 text-morita-mulberry'
                            }`}>
                              {n.type === 'new_request' ? <HelpCircle className="h-3 w-3" /> :
                               n.type === 'status_change' ? <Check className="h-3 w-3" /> :
                               <MessageSquare className="h-3 w-3" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-morita-charcoal font-semibold truncate">{n.title}</p>
                              <p className="text-[11px] text-morita-charcoal/70 line-clamp-2 mt-0.5">{n.message}</p>
                              <span className="text-[9px] text-morita-charcoal/40 block mt-1">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="border-t border-morita-sand pt-2 mt-1 px-4 text-center">
                    <button
                      onClick={() => {
                        onNavigate('requests');
                        setShowNotificationDropdown(false);
                      }}
                      className="text-xs text-morita-mulberry font-semibold hover:underline cursor-pointer"
                    >
                      Ver todas en Solicitudes
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Thumbnail */}
            <div className="flex items-center space-x-1.5 pl-1 border-l border-morita-sand shrink-0">
              <button
                id="btn-user-profile"
                onClick={() => onOpenProfile(currentUser.id)}
                className="flex items-center space-x-1.5 focus:outline-hidden group cursor-pointer shrink-0"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover border-2 border-morita-mulberry group-hover:border-morita-terracotta transition-colors shrink-0"
                />
                <span className="hidden lg:inline-block text-xs font-semibold text-morita-charcoal group-hover:text-morita-mulberry truncate max-w-[100px]">
                  {currentUser.name}
                </span>
              </button>
            </div>

            {/* Quick Publish button */}
            <button
              id="btn-publish-quick"
              onClick={onOpenPublish}
              className="flex items-center justify-center p-1.5 sm:px-3 sm:py-1.5 bg-morita-mulberry hover:bg-morita-mulberry-dark text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <PlusCircle className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline ml-1">Publicar</span>
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu Dropdown */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-morita-sand/50 bg-white px-4 py-3 space-y-1 shadow-xs animate-fade-in max-w-[100vw] overflow-x-hidden">
          <button
            onClick={() => {
              onNavigate('feed');
              setShowMobileMenu(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer block ${
              activeTab === 'feed'
                ? 'bg-morita-sand text-morita-mulberry'
                : 'text-morita-charcoal/75 hover:bg-morita-sand/35 hover:text-morita-mulberry'
            }`}
          >
            Explorar Barrio
          </button>
          <button
            onClick={() => {
              onNavigate('requests');
              setShowMobileMenu(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer block ${
              activeTab === 'requests'
                ? 'bg-morita-sand text-morita-mulberry'
                : 'text-morita-charcoal/75 hover:bg-morita-sand/35 hover:text-morita-mulberry'
            }`}
          >
            Mis Solicitudes
          </button>
          <button
            onClick={() => {
              onNavigate('favorites');
              setShowMobileMenu(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'favorites'
                ? 'bg-morita-sand text-morita-mulberry'
                : 'text-morita-charcoal/75 hover:bg-morita-sand/35 hover:text-morita-mulberry'
            }`}
          >
            <Heart className={`h-4 w-4 ${activeTab === 'favorites' ? 'fill-morita-mulberry text-morita-mulberry' : 'text-morita-charcoal/50'}`} />
            <span>Mis Favoritos</span>
          </button>
          <button
            onClick={() => {
              onOpenProfile(currentUser.id);
              setShowMobileMenu(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-morita-charcoal/75 hover:bg-morita-sand/35 hover:text-morita-mulberry transition-all cursor-pointer block"
          >
            Mi Perfil
          </button>

          {/* Panel Admin: Strictly CONDITIONAL for authenticated admins only */}
          {isAdmin ? (
            <button
              onClick={() => {
                onNavigate('admin');
                setShowMobileMenu(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'admin'
                  ? 'bg-purple-700 text-white'
                  : 'text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200/60'
              }`}
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Panel de Administración 🛡️</span>
            </button>
          ) : (
            onOpenAdminLogin && (
              <button
                onClick={() => {
                  onOpenAdminLogin();
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200/50 transition-all cursor-pointer flex items-center gap-2 mt-1"
              >
                <ShieldAlert className="h-4 w-4 text-purple-700" />
                <span>Acceso Administrador 🔐</span>
              </button>
            )
          )}
        </div>
      )}
    </header>
  );
}
