export default function handler(_request, response) {
  const configured = {
    supabaseUrl: Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKey: Boolean(process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    serviceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    postgresUrl: Boolean(
      process.env.POSTGRES_URL ||
      process.env.DATABASE_URL ||
      process.env.SUPABASE_DATABASE_URL
    ),
    commissionerPassword: Boolean(process.env.COMMISSIONER_PASSWORD),
    sessionSecret: Boolean(process.env.SESSION_SECRET),
  };

  const ready = configured.postgresUrl && configured.commissionerPassword && configured.sessionSecret;
  response.status(ready ? 200 : 503).json({
    status: ready ? "ready" : "configuration-required",
    configured,
    version: "4.6-history-editor",
  });
}
