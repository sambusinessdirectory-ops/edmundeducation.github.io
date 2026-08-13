-- Video Class: supporting indexes for the final admin-library schema.
--
-- This migration mirrors the indexes already included in the clean-install
-- schema so an upgraded production database and a fresh installation remain
-- structurally equivalent.

begin;

create index if not exists video_class_admin_preview_grants_session_idx
  on public.video_class_admin_preview_grants (admin_session_hash, expires_at desc);

create index if not exists video_class_library_settings_updated_by_idx
  on public.video_class_library_settings (updated_by)
  where updated_by is not null;

commit;
