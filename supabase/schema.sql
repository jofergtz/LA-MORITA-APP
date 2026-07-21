-- ============================================================================
-- BASE DE DATOS SUPABASE - LA MORITA BARRIO
-- Esquema relacional SQL completo con Row Level Security (RLS) y Triggers
-- ============================================================================

-- 1. TIPOS ENUMERADOS
CREATE TYPE publication_type AS ENUM ('vendo', 'ofrezco', 'necesito');
CREATE TYPE price_type AS ENUM ('monto', 'a-consultar', 'intercambio');
CREATE TYPE request_status AS ENUM ('pendiente', 'aceptada', 'rechazada', 'completada');
CREATE TYPE notification_type AS ENUM ('new_request', 'status_change', 'new_message');

-- 2. TABLA DE PERFILES / USUARIOS (vinculada con auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT DEFAULT '',
  avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  zone TEXT DEFAULT 'Barrio La Morita, Santa Cruz',
  bio TEXT DEFAULT '',
  skills TEXT[] DEFAULT '{}',
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS en profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Perfiles visibles por todos los usuarios autenticados" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Usuarios pueden actualizar su propio perfil" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger para crear perfil automáticamente al registrarse en Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. TABLA DE PUBLICACIONES
CREATE TABLE IF NOT EXISTS public.publications (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_avatar TEXT NOT NULL,
  type publication_type NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  price_type price_type NOT NULL DEFAULT 'monto',
  price_value TEXT DEFAULT '',
  photo TEXT DEFAULT '',
  zone TEXT DEFAULT 'Barrio La Morita',
  availability TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Publicaciones visibles para todos" 
  ON public.publications FOR SELECT USING (true);

CREATE POLICY "Usuarios pueden crear sus publicaciones" 
  ON public.publications FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden editar sus propias publicaciones" 
  ON public.publications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuarios o administradores pueden eliminar publicaciones" 
  ON public.publications FOR DELETE USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- 4. TABLA DE SOLICITUDES Y ENCUENTROS
CREATE TABLE IF NOT EXISTS public.requests (
  id TEXT PRIMARY KEY,
  publication_id TEXT REFERENCES public.publications(id) ON DELETE CASCADE,
  publication_title TEXT NOT NULL,
  publication_type publication_type NOT NULL,
  publisher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  requester_name TEXT NOT NULL,
  requester_avatar TEXT NOT NULL,
  comment TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  proposed_date_time TEXT DEFAULT '',
  status request_status NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Solicitudes visibles para los involucrados o admin" 
  ON public.requests FOR SELECT USING (
    auth.uid() = publisher_id OR 
    auth.uid() = requester_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Usuarios pueden crear solicitudes" 
  ON public.requests FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Partes involucradas pueden actualizar el estado" 
  ON public.requests FOR UPDATE USING (
    auth.uid() = publisher_id OR auth.uid() = requester_id
  );

-- 5. TABLA DE MENSAJES (CHAT DE SOLICITUD)
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  request_id TEXT REFERENCES public.requests(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mensajes visibles para participantes de la solicitud" 
  ON public.messages FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.requests r 
      WHERE r.id = request_id AND (r.publisher_id = auth.uid() OR r.requester_id = auth.uid())
    )
  );

CREATE POLICY "Participantes pueden enviar mensajes" 
  ON public.messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.requests r 
      WHERE r.id = request_id AND (r.publisher_id = auth.uid() OR r.requester_id = auth.uid())
    )
  );

-- 6. TABLA DE NOTIFICACIONES
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  request_id TEXT REFERENCES public.requests(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notificaciones privadas para cada usuario" 
  ON public.notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Modificación de notificaciones propias" 
  ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- 7. TABLA DE COMUNICADOS / ANUNCIOS OFICIALES DE LA JUNTA VECINAL
CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  important BOOLEAN DEFAULT FALSE
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anuncios visibles para todos" 
  ON public.announcements FOR SELECT USING (true);

CREATE POLICY "Solo administradores pueden publicar anuncios" 
  ON public.announcements FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- 8. TABLA DE FAVORITOS
CREATE TABLE IF NOT EXISTS public.favorites (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  publication_id TEXT REFERENCES public.publications(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, publication_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Favoritos administrados por el usuario" 
  ON public.favorites FOR ALL USING (auth.uid() = user_id);

-- 9. ÍNDICES DE RENDIMIENTO PARA CONSULTAS RÁPIDAS
CREATE INDEX IF NOT EXISTS idx_publications_category ON public.publications(category);
CREATE INDEX IF NOT EXISTS idx_publications_type ON public.publications(type);
CREATE INDEX IF NOT EXISTS idx_requests_publisher ON public.requests(publisher_id);
CREATE INDEX IF NOT EXISTS idx_requests_requester ON public.requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_messages_request ON public.messages(request_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
