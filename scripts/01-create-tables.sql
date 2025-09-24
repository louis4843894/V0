-- Create profiles table for authentication
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'resident' CHECK (role IN ('resident', 'committee', 'vendor')),
  phone TEXT,
  room TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  author TEXT NOT NULL,
  options JSONB DEFAULT '["同意", "反對"]',
  votes JSONB DEFAULT '{}',
  voters JSONB DEFAULT '{}',
  reads JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create maintenance table
CREATE TABLE IF NOT EXISTS maintenance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment TEXT NOT NULL,
  item TEXT NOT NULL,
  time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  handler TEXT DEFAULT '',
  cost DECIMAL DEFAULT 0,
  note TEXT DEFAULT '',
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'progress', 'closed')),
  assignee TEXT DEFAULT '',
  logs JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create fees table
CREATE TABLE IF NOT EXISTS fees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  due DATE NOT NULL,
  paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMP WITH TIME ZONE,
  invoice TEXT DEFAULT '',
  note TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create residents table
CREATE TABLE IF NOT EXISTS residents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  room TEXT NOT NULL,
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  role TEXT DEFAULT 'resident' CHECK (role IN ('resident', 'committee', 'vendor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create visitors table
CREATE TABLE IF NOT EXISTS visitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  room TEXT NOT NULL,
  "in" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "out" TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create packages table
CREATE TABLE IF NOT EXISTS packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  courier TEXT DEFAULT '',
  tracking TEXT DEFAULT '',
  room TEXT NOT NULL,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  picked_at TIMESTAMP WITH TIME ZONE,
  picker TEXT DEFAULT '',
  note TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic TEXT NOT NULL,
  time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  notes TEXT DEFAULT '',
  minutes_url TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create emergencies table
CREATE TABLE IF NOT EXISTS emergencies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  note TEXT DEFAULT '',
  by TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergencies ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since we're using custom auth)
CREATE POLICY "Allow all operations" ON profiles FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON announcements FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON maintenance FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON fees FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON residents FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON visitors FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON packages FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON meetings FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON emergencies FOR ALL USING (true);
