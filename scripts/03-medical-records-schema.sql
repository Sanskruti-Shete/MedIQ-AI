-- Create medical records table
CREATE TABLE IF NOT EXISTS medical_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('consultation', 'prescription', 'test', 'diagnosis', 'treatment')),
    description TEXT NOT NULL,
    diagnosis TEXT,
    treatment TEXT,
    prescription TEXT,
    notes TEXT,
    doctor VARCHAR(255),
    facility VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prescriptions table for detailed medication tracking
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    medical_record_id UUID REFERENCES medical_records(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(100),
    instructions TEXT,
    prescribed_by VARCHAR(255),
    prescribed_date DATE NOT NULL,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'discontinued')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medical history summary table
CREATE TABLE IF NOT EXISTS medical_history_summary (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    chronic_conditions TEXT[],
    allergies TEXT[],
    current_medications TEXT[],
    family_history TEXT,
    lifestyle_factors JSONB,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_date ON medical_records(date DESC);
CREATE INDEX IF NOT EXISTS idx_medical_records_type ON medical_records(type);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);

-- Enable Row Level Security
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_history_summary ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own medical records" ON medical_records
    FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Users can insert their own medical records" ON medical_records
    FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Users can update their own medical records" ON medical_records
    FOR UPDATE USING (patient_id = auth.uid());

CREATE POLICY "Users can delete their own medical records" ON medical_records
    FOR DELETE USING (patient_id = auth.uid());

CREATE POLICY "Users can view their own prescriptions" ON prescriptions
    FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Users can insert their own prescriptions" ON prescriptions
    FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Users can update their own prescriptions" ON prescriptions
    FOR UPDATE USING (patient_id = auth.uid());

CREATE POLICY "Users can view their own medical history summary" ON medical_history_summary
    FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Users can insert their own medical history summary" ON medical_history_summary
    FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Users can update their own medical history summary" ON medical_history_summary
    FOR UPDATE USING (patient_id = auth.uid());
