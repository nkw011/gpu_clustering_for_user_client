-- Create racks table
CREATE TABLE racks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  total_gpus INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create gpus table
CREATE TABLE gpus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model VARCHAR(255) NOT NULL,
  memory INTEGER NOT NULL, -- in GB
  cores INTEGER NOT NULL,
  clock_speed DECIMAL(4,2) NOT NULL, -- in GHz
  power INTEGER NOT NULL, -- in Watts
  rack_id UUID REFERENCES racks(id) ON DELETE CASCADE,
  status VARCHAR(20) CHECK (status IN ('available', 'in-use', 'maintenance')) DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for faster lookups
CREATE INDEX idx_gpus_model ON gpus(model);
CREATE INDEX idx_gpus_status ON gpus(status);
CREATE INDEX idx_gpus_rack_id ON gpus(rack_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_racks_updated_at
  BEFORE UPDATE ON racks
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_gpus_updated_at
  BEFORE UPDATE ON gpus
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Insert sample data
INSERT INTO racks (name, location, total_gpus) VALUES
  ('Rack A1', 'Server Room 1', 16),
  ('Rack B2', 'Server Room 1', 8),
  ('Rack C1', 'Server Room 2', 16),
  ('Rack D3', 'Server Room 2', 8);

INSERT INTO gpus (model, memory, cores, clock_speed, power, rack_id, status) 
SELECT 
  model,
  memory,
  cores,
  clock_speed,
  power,
  rack_id,
  status
FROM (
  VALUES 
    ('NVIDIA RTX 4090', 24, 16384, 2.52, 450, (SELECT id FROM racks WHERE name = 'Rack A1'), 'available'),
    ('NVIDIA A100', 80, 6912, 1.41, 400, (SELECT id FROM racks WHERE name = 'Rack B2'), 'available'),
    ('NVIDIA V100', 32, 5120, 1.53, 300, (SELECT id FROM racks WHERE name = 'Rack C1'), 'available'),
    ('NVIDIA T4', 16, 2560, 1.59, 70, (SELECT id FROM racks WHERE name = 'Rack D3'), 'available')
) AS v(model, memory, cores, clock_speed, power, rack_id, status); 