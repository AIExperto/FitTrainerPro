/*
  # Complete database schema setup

  1. New Tables
    - `profiles` - User profiles with role-based access
    - `clients` - Extended client information
    - `progress_entries` - Client progress tracking
    - `exercises` - Exercise library
    - `workouts` - Workout sessions
    - `workout_exercises` - Exercises within workouts
    - `appointments` - Trainer-client appointments
    - `messages` - Communication system

  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for role-based access
    - Ensure data isolation between trainers and clients

  3. Sample Data
    - Insert default exercises for immediate use
</script>

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Drop all existing policies
  DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
  DROP POLICY IF EXISTS "Trainers can read their clients' profiles" ON profiles;
  DROP POLICY IF EXISTS "Trainers can manage their clients" ON clients;
  DROP POLICY IF EXISTS "Clients can read own data" ON clients;
  DROP POLICY IF EXISTS "Trainers and clients can manage progress" ON progress_entries;
  DROP POLICY IF EXISTS "Everyone can read exercises" ON exercises;
  DROP POLICY IF EXISTS "Trainers can manage exercises" ON exercises;
  DROP POLICY IF EXISTS "Trainers and clients can manage workouts" ON workouts;
  DROP POLICY IF EXISTS "Trainers and clients can manage workout exercises" ON workout_exercises;
  DROP POLICY IF EXISTS "Trainers and clients can manage appointments" ON appointments;
  DROP POLICY IF EXISTS "Users can read their messages" ON messages;
  DROP POLICY IF EXISTS "Users can send messages" ON messages;
  DROP POLICY IF EXISTS "Users can update their received messages" ON messages;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('trainer', 'client')),
  trainer_id uuid REFERENCES profiles(id),
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  age integer NOT NULL CHECK (age >= 16 AND age <= 100),
  gender text NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  height integer NOT NULL CHECK (height >= 100 AND height <= 250),
  current_weight decimal(5,2) NOT NULL CHECK (current_weight >= 30 AND current_weight <= 300),
  goals text[] DEFAULT '{}',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create function to calculate BMI
CREATE OR REPLACE FUNCTION calculate_bmi()
RETURNS TRIGGER AS $$
BEGIN
  -- Get height from clients table
  SELECT height INTO NEW.bmi 
  FROM clients 
  WHERE id = NEW.client_id;
  
  -- Calculate BMI: weight(kg) / (height(m))^2
  IF NEW.bmi IS NOT NULL THEN
    NEW.bmi := NEW.weight / ((NEW.bmi / 100.0) ^ 2);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create progress_entries table
CREATE TABLE IF NOT EXISTS progress_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  weight decimal(5,2) NOT NULL CHECK (weight >= 30 AND weight <= 300),
  body_fat decimal(4,1) CHECK (body_fat >= 5 AND body_fat <= 50),
  muscle_mass decimal(5,2) CHECK (muscle_mass >= 20 AND muscle_mass <= 100),
  bmi decimal(4,1),
  measurements jsonb DEFAULT '{}',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(client_id, date)
);

-- Create trigger for BMI calculation
DROP TRIGGER IF EXISTS calculate_bmi_trigger ON progress_entries;
CREATE TRIGGER calculate_bmi_trigger
  BEFORE INSERT OR UPDATE ON progress_entries
  FOR EACH ROW
  EXECUTE FUNCTION calculate_bmi();

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  description text DEFAULT '',
  instructions text[] DEFAULT '{}',
  target_muscles text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  completed boolean DEFAULT false,
  duration integer CHECK (duration >= 10 AND duration <= 300),
  feeling integer CHECK (feeling >= 1 AND feeling <= 5),
  energy integer CHECK (energy >= 1 AND energy <= 5),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create workout_exercises table
CREATE TABLE IF NOT EXISTS workout_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  sets integer NOT NULL CHECK (sets >= 1 AND sets <= 10),
  reps text NOT NULL,
  weight decimal(5,2) CHECK (weight >= 0),
  rest_seconds integer CHECK (rest_seconds >= 30 AND rest_seconds <= 600),
  notes text DEFAULT '',
  order_index integer NOT NULL DEFAULT 0
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  trainer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  location text NOT NULL,
  type text NOT NULL CHECK (type IN ('personal', 'group', 'consultation')),
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_select_clients"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    role = 'client' AND trainer_id = auth.uid()
    OR auth.uid() = id
  );

-- Clients policies
CREATE POLICY "clients_manage_by_trainer"
  ON clients FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'trainer'
      AND (
        clients.id IN (
          SELECT id FROM profiles 
          WHERE trainer_id = auth.uid()
        )
        OR auth.uid() = clients.id
      )
    )
  );

CREATE POLICY "clients_select_own"
  ON clients FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Progress entries policies
CREATE POLICY "progress_manage_by_trainer_client"
  ON progress_entries FOR ALL
  TO authenticated
  USING (
    client_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'trainer'
      AND client_id IN (
        SELECT id FROM profiles 
        WHERE trainer_id = auth.uid()
      )
    )
  );

-- Exercises policies
CREATE POLICY "exercises_select_all"
  ON exercises FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "exercises_manage_by_trainer"
  ON exercises FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'trainer'
    )
  );

-- Workouts policies
CREATE POLICY "workouts_manage_by_trainer_client"
  ON workouts FOR ALL
  TO authenticated
  USING (
    client_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'trainer'
      AND client_id IN (
        SELECT id FROM profiles 
        WHERE trainer_id = auth.uid()
      )
    )
  );

-- Workout exercises policies
CREATE POLICY "workout_exercises_manage_by_trainer_client"
  ON workout_exercises FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workouts w
      WHERE w.id = workout_id
      AND (
        w.client_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() 
          AND role = 'trainer'
          AND w.client_id IN (
            SELECT id FROM profiles 
            WHERE trainer_id = auth.uid()
          )
        )
      )
    )
  );

-- Appointments policies
CREATE POLICY "appointments_manage_by_trainer_client"
  ON appointments FOR ALL
  TO authenticated
  USING (
    client_id = auth.uid()
    OR trainer_id = auth.uid()
  );

-- Messages policies
CREATE POLICY "messages_select_own"
  ON messages FOR SELECT
  TO authenticated
  USING (from_id = auth.uid() OR to_id = auth.uid());

CREATE POLICY "messages_insert_own"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (from_id = auth.uid());

CREATE POLICY "messages_update_received"
  ON messages FOR UPDATE
  TO authenticated
  USING (to_id = auth.uid());

-- Insert default exercises only if they don't exist
INSERT INTO exercises (name, category, description, instructions, target_muscles) 
SELECT * FROM (VALUES
  ('Sentadillas', 'Piernas', 'Ejercicio fundamental para piernas y glúteos', 
   ARRAY['Mantén los pies separados al ancho de hombros', 'Desciende como si fueras a sentarte', 'Mantén la espalda recta'],
   ARRAY['Cuádriceps', 'Glúteos', 'Isquiotibiales']),
  ('Press de Banca', 'Pecho', 'Ejercicio básico para el desarrollo del pecho',
   ARRAY['Acuéstate en el banco', 'Agarra la barra con agarre medio', 'Baja controladamente al pecho'],
   ARRAY['Pectorales', 'Tríceps', 'Deltoides']),
  ('Dominadas', 'Espalda', 'Ejercicio para el desarrollo de la espalda y brazos',
   ARRAY['Cuelga de la barra', 'Tira hacia arriba hasta que el mentón pase la barra', 'Baja controladamente'],
   ARRAY['Dorsales', 'Bíceps', 'Romboides']),
  ('Press Militar', 'Hombros', 'Ejercicio para el desarrollo de hombros',
   ARRAY['Mantén la barra a la altura del pecho', 'Presiona hacia arriba', 'Baja controladamente'],
   ARRAY['Deltoides', 'Tríceps', 'Core']),
  ('Peso Muerto', 'Espalda', 'Ejercicio compuesto para espalda y piernas',
   ARRAY['Mantén la barra cerca del cuerpo', 'Levanta con la espalda recta', 'Extiende caderas y rodillas'],
   ARRAY['Dorsales', 'Glúteos', 'Isquiotibiales', 'Trapecios']),
  ('Flexiones', 'Pecho', 'Ejercicio de peso corporal para pecho y brazos',
   ARRAY['Mantén el cuerpo recto', 'Baja hasta que el pecho toque el suelo', 'Empuja hacia arriba'],
   ARRAY['Pectorales', 'Tríceps', 'Core']),
  ('Plancha', 'Core', 'Ejercicio isométrico para el core',
   ARRAY['Mantén el cuerpo recto', 'Apoya en antebrazos y pies', 'Contrae el abdomen'],
   ARRAY['Core', 'Hombros', 'Glúteos']),
  ('Remo con Barra', 'Espalda', 'Ejercicio para el desarrollo de la espalda',
   ARRAY['Inclínate hacia adelante', 'Tira de la barra hacia el abdomen', 'Mantén la espalda recta'],
   ARRAY['Dorsales', 'Romboides', 'Bíceps'])
) AS v(name, category, description, instructions, target_muscles)
WHERE NOT EXISTS (
  SELECT 1 FROM exercises WHERE exercises.name = v.name
);