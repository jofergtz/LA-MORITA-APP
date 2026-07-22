-- ============================================================================
-- ESQUEMA DE BASE DE DATOS SUPABASE PARA LA MORITA COMUNIDAD
-- Ejecuta este script en el Editor SQL de tu panel de Supabase (SQL Editor)
-- Project ID: xldbwdvzsfduomioziol
-- ============================================================================

-- 1. Tabla de Perfiles de Usuarios / Vecinos
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar TEXT,
  zone TEXT,
  bio TEXT,
  skills TEXT[],
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Publicaciones (Ofrecimientos y Necesidades)
CREATE TABLE IF NOT EXISTS public.publications (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name TEXT,
  author_avatar TEXT,
  type TEXT NOT NULL, -- 'ofresco' | 'necesito'
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  price_type TEXT,
  price_value TEXT,
  photo TEXT,
  zone TEXT,
  availability TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Solicitudes de Interés / Intercambios
CREATE TABLE IF NOT EXISTS public.requests (
  id TEXT PRIMARY KEY,
  publication_id TEXT REFERENCES public.publications(id) ON DELETE CASCADE,
  publication_title TEXT,
  publication_type TEXT,
  publisher_id TEXT,
  requester_id TEXT,
  requester_name TEXT,
  requester_avatar TEXT,
  comment TEXT,
  quantity INTEGER DEFAULT 1,
  proposed_date_time TEXT,
  status TEXT DEFAULT 'pending', -- 'pending' | 'accepted' | 'declined' | 'completed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de Mensajes del Chat Privado
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  request_id TEXT REFERENCES public.requests(id) ON DELETE CASCADE,
  sender_id TEXT,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabla de Notificaciones
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  type TEXT,
  title TEXT,
  message TEXT,
  request_id TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabla de Comunicados de la Junta Vecinal
CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  important BOOLEAN DEFAULT false
);

-- Habilitar Políticas RLS públicas (permite lectura/escritura anónima para desarrollo rápido)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas anteriores si existen para evitar errores al reejecutar
DROP POLICY IF EXISTS "Permitir todo en profiles" ON public.profiles;
DROP POLICY IF EXISTS "Permitir todo en publications" ON public.publications;
DROP POLICY IF EXISTS "Permitir todo en requests" ON public.requests;
DROP POLICY IF EXISTS "Permitir todo en messages" ON public.messages;
DROP POLICY IF EXISTS "Permitir todo en notifications" ON public.notifications;
DROP POLICY IF EXISTS "Permitir todo en announcements" ON public.announcements;

-- Crear políticas limpiamente
CREATE POLICY "Permitir todo en profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en publications" ON public.publications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en requests" ON public.requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en messages" ON public.messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en announcements" ON public.announcements FOR ALL USING (true) WITH CHECK (true);
