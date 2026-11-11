window.HOUSE_STROY_SUPABASE = {
  url: "https://gdzklvlyoyzokhzldnte.supabase.co",
  // Публичный publishable key. Секретный/service-role ключ здесь не используется.
  anonKey: "sb_publishable_YQU4ZBrxyarvO7qyzs3TcA_84lzgwak"
};
window.houseStroyClient = window.supabase.createClient(
  window.HOUSE_STROY_SUPABASE.url,
  window.HOUSE_STROY_SUPABASE.anonKey,
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
);