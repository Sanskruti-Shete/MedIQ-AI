-- Medical Expert System Database Schema
-- Create all necessary tables for the comprehensive medical platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'admin')),
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients table
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  patient_id TEXT UNIQUE NOT NULL, -- Human readable ID like P001
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  blood_type TEXT CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  allergies TEXT[],
  chronic_conditions TEXT[],
  current_medications TEXT[],
  height_cm INTEGER,
  weight_kg DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical conditions/symptoms database
CREATE TABLE IF NOT EXISTS public.medical_conditions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'symptom', 'disease', 'condition'
  description TEXT,
  severity_level INTEGER CHECK (severity_level BETWEEN 1 AND 5),
  body_system TEXT, -- 'cardiovascular', 'respiratory', 'neurological', etc.
  icd_10_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consultations table
CREATE TABLE IF NOT EXISTS public.consultations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  consultation_id TEXT UNIQUE NOT NULL, -- Human readable ID like C001
  chief_complaint TEXT NOT NULL,
  symptoms TEXT[] NOT NULL,
  symptom_duration TEXT,
  pain_scale INTEGER CHECK (pain_scale BETWEEN 0 AND 10),
  vital_signs JSONB, -- {"temperature": 98.6, "blood_pressure": "120/80", "heart_rate": 72}
  preliminary_diagnosis TEXT[],
  recommended_tests TEXT[],
  treatment_plan TEXT,
  medications_prescribed JSONB[],
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  urgency_level TEXT CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
  appointment_id TEXT UNIQUE NOT NULL, -- Human readable ID like A001
  appointment_type TEXT NOT NULL, -- 'consultation', 'follow-up', 'emergency'
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no-show')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drug interactions database
CREATE TABLE IF NOT EXISTS public.drug_interactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  drug_a TEXT NOT NULL,
  drug_b TEXT NOT NULL,
  interaction_type TEXT CHECK (interaction_type IN ('major', 'moderate', 'minor')),
  description TEXT NOT NULL,
  clinical_significance TEXT,
  management_strategy TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical knowledge base
CREATE TABLE IF NOT EXISTS public.medical_knowledge (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- 'disease', 'treatment', 'drug', 'procedure'
  content TEXT NOT NULL,
  tags TEXT[],
  references TEXT[],
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat sessions for AI consultations
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
  session_title TEXT,
  messages JSONB[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical records table for storing uploaded documents and prescriptions
CREATE TABLE IF NOT EXISTS public.medical_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  record_id TEXT UNIQUE NOT NULL, -- Human readable ID like MR001
  title TEXT NOT NULL,
  description TEXT,
  record_type TEXT NOT NULL CHECK (record_type IN ('prescription', 'lab_result', 'imaging', 'discharge_summary', 'vaccination', 'other')),
  file_url TEXT, -- Supabase storage URL
  file_name TEXT,
  file_size INTEGER,
  file_type TEXT, -- MIME type
  doctor_name TEXT,
  hospital_name TEXT,
  record_date DATE,
  tags TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON public.consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_medical_conditions_category ON public.medical_conditions(category);
CREATE INDEX IF NOT EXISTS idx_medical_conditions_body_system ON public.medical_conditions(body_system);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_patient_id ON public.chat_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON public.medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_type ON public.medical_records(record_type);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Patients can only see their own data
CREATE POLICY "Patients can view own data" ON public.patients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Patients can update own data" ON public.patients
  FOR UPDATE USING (auth.uid() = user_id);

-- Consultations - patients can only see their own
CREATE POLICY "Patients can view own consultations" ON public.consultations
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

-- Appointments - patients can only see their own
CREATE POLICY "Patients can view own appointments" ON public.appointments
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

-- Chat sessions - patients can only see their own
CREATE POLICY "Patients can view own chat sessions" ON public.chat_sessions
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

-- Medical records - patients can only see their own
CREATE POLICY "Patients can view own medical records" ON public.medical_records
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Patients can insert own medical records" ON public.medical_records
  FOR INSERT WITH CHECK (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Patients can update own medical records" ON public.medical_records
  FOR UPDATE USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Patients can delete own medical records" ON public.medical_records
  FOR DELETE USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

-- Allow public read access to medical knowledge and drug interactions
CREATE POLICY "Public read access to medical conditions" ON public.medical_conditions
  FOR SELECT USING (true);

CREATE POLICY "Public read access to drug interactions" ON public.drug_interactions
  FOR SELECT USING (true);

CREATE POLICY "Public read access to medical knowledge" ON public.medical_knowledge
  FOR SELECT USING (true);
