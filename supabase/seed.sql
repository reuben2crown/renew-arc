-- Seed all 50 States
INSERT INTO public.states (name, abbreviation) VALUES
('Alabama', 'AL'), ('Alaska', 'AK'), ('Arizona', 'AZ'), ('Arkansas', 'AR'),
('California', 'CA'), ('Colorado', 'CO'), ('Connecticut', 'CT'), ('Delaware', 'DE'),
('Florida', 'FL'), ('Georgia', 'GA'), ('Hawaii', 'HI'), ('Idaho', 'ID'),
('Illinois', 'IL'), ('Indiana', 'IN'), ('Iowa', 'IA'), ('Kansas', 'KS'),
('Kentucky', 'KY'), ('Louisiana', 'LA'), ('Maine', 'ME'), ('Maryland', 'MD'),
('Massachusetts', 'MA'), ('Michigan', 'MI'), ('Minnesota', 'MN'), ('Mississippi', 'MS'),
('Missouri', 'MO'), ('Montana', 'MT'), ('Nebraska', 'NE'), ('Nevada', 'NV'),
('New Hampshire', 'NH'), ('New Jersey', 'NJ'), ('New Mexico', 'NM'), ('New York', 'NY'),
('North Carolina', 'NC'), ('North Dakota', 'ND'), ('Ohio', 'OH'), ('Oklahoma', 'OK'),
('Oregon', 'OR'), ('Pennsylvania', 'PA'), ('Rhode Island', 'RI'), ('South Carolina', 'SC'),
('South Dakota', 'SD'), ('Tennessee', 'TN'), ('Texas', 'TX'), ('Utah', 'UT'),
('Vermont', 'VT'), ('Virginia', 'VA'), ('Washington', 'WA'), ('West Virginia', 'WV'),
('Wisconsin', 'WI'), ('Wyoming', 'WY')
ON CONFLICT (abbreviation) DO NOTHING;

-- Seed Specific Rules for Target States (CA, TX, NY, FL, IL)
INSERT INTO public.jurisdiction_rules (state_id, license_type_id, required_hours, renewal_period_months, specific_requirements)
SELECT s.id, lt.id, 
  CASE 
    WHEN s.abbreviation = 'CA' THEN 36
    WHEN s.abbreviation = 'TX' THEN 30
    WHEN s.abbreviation = 'NY' THEN 36
    WHEN s.abbreviation = 'FL' THEN 30
    WHEN s.abbreviation = 'IL' THEN 30
    ELSE 20
  END,
  24,
  CASE 
    WHEN s.abbreviation = 'CA' THEN 'Must include 6 hours Law & Ethics'
    WHEN s.abbreviation = 'TX' THEN 'Must include 3 hours Ethics'
    WHEN s.abbreviation = 'NY' THEN 'Must include 3 hours Infection Control'
    WHEN s.abbreviation = 'FL' THEN 'Must include 2 hours Medical Errors'
    WHEN s.abbreviation = 'IL' THEN 'Must include 3 hours Sexual Harassment'
    ELSE NULL
  END
FROM public.states s
CROSS JOIN public.license_types lt
WHERE s.abbreviation IN ('CA', 'TX', 'NY', 'FL', 'IL')
ON CONFLICT DO NOTHING;
