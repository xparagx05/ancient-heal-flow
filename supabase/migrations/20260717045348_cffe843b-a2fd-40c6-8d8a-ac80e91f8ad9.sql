
-- ============ ROLES ============
create type public.app_role as enum ('patient', 'doctor', 'admin');

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "Users read own profile" on public.profiles for select to authenticated using (auth.uid() = user_id);
create policy "Users update own profile" on public.profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = user_id);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);
create policy "Admins read all roles" on public.user_roles for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins insert roles" on public.user_roles for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete roles" on public.user_roles for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- ============ DOCTOR APPLICATIONS ============
create type public.doctor_app_status as enum ('pending', 'approved', 'rejected', 'needs_info', 'suspended');

create table public.doctor_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text not null,
  photo_url text,
  registration_number text not null,
  specialization text not null,
  qualification text not null,
  experience_years int not null default 0,
  clinic_name text,
  consultation_fee int not null default 0,
  languages text[] not null default '{}',
  working_hours jsonb not null default '{}'::jsonb,
  gov_id_url text,
  license_url text,
  bio text,
  status public.doctor_app_status not null default 'pending',
  admin_notes text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.doctor_applications to authenticated;
grant all on public.doctor_applications to service_role;
alter table public.doctor_applications enable row level security;
create policy "Applicant reads own application" on public.doctor_applications for select to authenticated using (auth.uid() = user_id);
create policy "Applicant inserts own application" on public.doctor_applications for insert to authenticated with check (auth.uid() = user_id);
create policy "Applicant updates own application" on public.doctor_applications for update to authenticated using (auth.uid() = user_id and status in ('pending','needs_info')) with check (auth.uid() = user_id);
create policy "Admins read all applications" on public.doctor_applications for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update all applications" on public.doctor_applications for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- ============ DOCTORS (public directory of approved) ============
create table public.doctors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  application_id uuid references public.doctor_applications(id) on delete set null,
  full_name text not null,
  specialization text not null,
  qualification text,
  experience_years int not null default 0,
  photo_url text,
  bio text,
  consultation_fee int not null default 0,
  languages text[] not null default '{}',
  rating numeric(2,1) not null default 0,
  is_active boolean not null default true,
  verified boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.doctors to anon;
grant select, insert, update, delete on public.doctors to authenticated;
grant all on public.doctors to service_role;
alter table public.doctors enable row level security;
create policy "Public reads active doctors" on public.doctors for select using (is_active = true);
create policy "Doctor reads own row" on public.doctors for select to authenticated using (auth.uid() = user_id);
create policy "Doctor updates own row" on public.doctors for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Admins manage doctors" on public.doctors for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- ============ TIMESTAMP TRIGGER ============
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

create trigger t_profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger t_doctor_apps_updated before update on public.doctor_applications for each row execute function public.set_updated_at();
create trigger t_doctors_updated before update on public.doctors for each row execute function public.set_updated_at();

-- ============ NEW USER TRIGGER ============
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (user_id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'patient')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
