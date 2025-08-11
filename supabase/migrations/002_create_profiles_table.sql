-- Create profiles table for user metadata
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table profiles enable row level security;

-- Create policy to allow users to view their own profile
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

-- Create policy to allow users to update their own profile
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to update updated_at on profile changes
create trigger update_profiles_updated_at
  before update on profiles
  for each row execute procedure update_updated_at_column();