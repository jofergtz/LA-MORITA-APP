import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, payload, password } = await req.json();

    const ADMIN_PASSWORD = Deno.env.get('ADMIN_PASSWORD');
    const JUNTA_PASSWORD = Deno.env.get('JUNTA_PASSWORD');

    let isAuthorized = false;

    // Announcements accept both ADMIN_PASSWORD and JUNTA_PASSWORD
    if (['createAnnouncement', 'updateAnnouncement', 'deleteAnnouncement'].includes(action)) {
      if (password && ((ADMIN_PASSWORD && password === ADMIN_PASSWORD) || (JUNTA_PASSWORD && password === JUNTA_PASSWORD))) {
        isAuthorized = true;
      }
    } 
    // Deleting publications or users requires ADMIN_PASSWORD
    else if (['deletePublication', 'deleteUser'].includes(action)) {
      if (password && ADMIN_PASSWORD && password === ADMIN_PASSWORD) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ success: false, error: 'Contraseña o autorización inválida' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Configuración de Supabase no encontrada en el servidor' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    let dbError = null;

    if (action === 'deletePublication') {
      const { error } = await supabaseAdmin.from('publications').delete().eq('id', payload.id);
      dbError = error;
    } else if (action === 'deleteUser') {
      const { error } = await supabaseAdmin.from('profiles').delete().eq('id', payload.id);
      dbError = error;
    } else if (action === 'createAnnouncement') {
      const { error } = await supabaseAdmin.from('announcements').insert(payload);
      dbError = error;
    } else if (action === 'updateAnnouncement') {
      const { error } = await supabaseAdmin.from('announcements').update(payload).eq('id', payload.id);
      dbError = error;
    } else if (action === 'deleteAnnouncement') {
      const { error } = await supabaseAdmin.from('announcements').delete().eq('id', payload.id);
      dbError = error;
    } else {
      return new Response(
        JSON.stringify({ success: false, error: 'Acción no soportada' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (dbError) {
      return new Response(
        JSON.stringify({ success: false, error: dbError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
