import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return new Response(JSON.stringify({ error: 'Missing authorization' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  const { data: { user }, error: userError } = await adminClient.auth.getUser(token);
  if (userError || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  const { data: actor } = await adminClient.from('profiles').select('role, active').eq('id', user.id).single();
  if (actor?.role !== 'admin' || !actor.active) return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  const { email, password, fullName, role } = await request.json();
  if (!email || !password || !fullName || !['admin', 'waiter', 'kitchen', 'billing'].includes(role)) {
    return new Response(JSON.stringify({ error: 'Invalid staff payload' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({ email, password, email_confirm: true });
  if (createError || !created.user) return new Response(JSON.stringify({ error: createError?.message || 'Unable to create user' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  const { error: profileError } = await adminClient.from('profiles').insert({ id: created.user.id, full_name: fullName, role, active: true });
  if (profileError) {
    await adminClient.auth.admin.deleteUser(created.user.id);
    return new Response(JSON.stringify({ error: profileError.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({ id: created.user.id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
