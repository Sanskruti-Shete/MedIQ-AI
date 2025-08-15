-- Seed the medical database with initial data

-- Insert common medical conditions and symptoms
INSERT INTO public.medical_conditions (name, category, description, severity_level, body_system, icd_10_code) VALUES
-- Cardiovascular
('Chest Pain', 'symptom', 'Pain or discomfort in the chest area', 4, 'cardiovascular', 'R06.02'),
('Hypertension', 'condition', 'High blood pressure', 3, 'cardiovascular', 'I10'),
('Heart Palpitations', 'symptom', 'Feeling of rapid, fluttering or pounding heartbeats', 2, 'cardiovascular', 'R00.2'),

-- Respiratory
('Shortness of Breath', 'symptom', 'Difficulty breathing or feeling breathless', 4, 'respiratory', 'R06.00'),
('Cough', 'symptom', 'Sudden, forceful expulsion of air from the lungs', 2, 'respiratory', 'R05'),
('Asthma', 'condition', 'Chronic respiratory condition causing breathing difficulties', 3, 'respiratory', 'J45.9'),

-- Neurological
('Headache', 'symptom', 'Pain in the head or neck area', 2, 'neurological', 'R51'),
('Dizziness', 'symptom', 'Feeling of unsteadiness or lightheadedness', 2, 'neurological', 'R42'),
('Migraine', 'condition', 'Severe recurring headaches', 4, 'neurological', 'G43.9'),

-- Gastrointestinal
('Nausea', 'symptom', 'Feeling of sickness with inclination to vomit', 2, 'gastrointestinal', 'R11.0'),
('Abdominal Pain', 'symptom', 'Pain in the stomach area', 3, 'gastrointestinal', 'R10.9'),
('Diarrhea', 'symptom', 'Loose, watery bowel movements', 2, 'gastrointestinal', 'K59.1'),

-- Musculoskeletal
('Back Pain', 'symptom', 'Pain in the back area', 3, 'musculoskeletal', 'M54.9'),
('Joint Pain', 'symptom', 'Pain in joints', 3, 'musculoskeletal', 'M25.50'),
('Arthritis', 'condition', 'Inflammation of joints', 3, 'musculoskeletal', 'M13.9'),

-- General
('Fever', 'symptom', 'Elevated body temperature', 3, 'general', 'R50.9'),
('Fatigue', 'symptom', 'Extreme tiredness or exhaustion', 2, 'general', 'R53'),
('Weight Loss', 'symptom', 'Unintentional loss of body weight', 3, 'general', 'R63.4');

-- Insert common drug interactions
INSERT INTO public.drug_interactions (drug_a, drug_b, interaction_type, description, clinical_significance, management_strategy) VALUES
('Warfarin', 'Aspirin', 'major', 'Increased risk of bleeding', 'High risk of serious bleeding complications', 'Monitor INR closely, consider alternative antiplatelet therapy'),
('Metformin', 'Contrast Dye', 'major', 'Risk of lactic acidosis', 'Can cause serious metabolic complications', 'Discontinue metformin before contrast procedures'),
('ACE Inhibitors', 'Potassium Supplements', 'moderate', 'Risk of hyperkalemia', 'Elevated potassium levels can affect heart rhythm', 'Monitor potassium levels regularly'),
('Statins', 'Grapefruit Juice', 'moderate', 'Increased statin levels', 'Higher risk of muscle toxicity', 'Avoid grapefruit juice or use alternative statin'),
('Digoxin', 'Furosemide', 'moderate', 'Increased digoxin toxicity', 'Electrolyte imbalances can increase digoxin effects', 'Monitor digoxin levels and electrolytes');

-- Insert medical knowledge base entries
INSERT INTO public.medical_knowledge (title, category, content, tags, references) VALUES
('Hypertension Management', 'treatment', 'Hypertension is managed through lifestyle modifications and medications. First-line treatments include ACE inhibitors, ARBs, calcium channel blockers, and thiazide diuretics.', ARRAY['hypertension', 'blood pressure', 'cardiovascular'], ARRAY['AHA/ACC Hypertension Guidelines 2017']),
('Diabetes Type 2 Overview', 'disease', 'Type 2 diabetes is a chronic condition affecting blood sugar regulation. Management includes diet, exercise, and medications like metformin.', ARRAY['diabetes', 'blood sugar', 'endocrine'], ARRAY['ADA Standards of Care 2023']),
('Chest Pain Evaluation', 'procedure', 'Chest pain evaluation requires assessment of cardiac, pulmonary, and other causes. Initial workup includes ECG, chest X-ray, and cardiac enzymes.', ARRAY['chest pain', 'cardiac', 'emergency'], ARRAY['ACC/AHA Chest Pain Guidelines']),
('Antibiotic Resistance', 'treatment', 'Antibiotic resistance is a growing concern. Proper antibiotic stewardship includes appropriate selection, dosing, and duration of therapy.', ARRAY['antibiotics', 'resistance', 'infectious disease'], ARRAY['CDC Antibiotic Stewardship Guidelines']);
