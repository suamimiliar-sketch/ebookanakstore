"use client";
export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="mb-4 font-display text-3xl">Pengaturan Situs</h1>
      <p className="text-ink/60">
        Kelola hero, testimonial, FAQ, dan informasi kontak. (Endpoint: <code>/api/v1/settings/{'{key}'}</code>)
      </p>
      <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
        <p className="text-sm text-ink/50">
          Form editor untuk setiap `SiteSetting` key — akan ditambahkan saat datanya sudah
          dimigrasi dari v1.
        </p>
      </div>
    </div>
  );
}
