/*
  # Time Travel Journal Database Schema

  1. New Tables
    - `diary_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `figure` (text, historical figure name)
      - `subject` (text, conversation topic)
      - `summary` (text, AI-generated conversation summary)
      - `created_at` (timestamp)
    
    - `figure_prompts`
      - `id` (uuid, primary key)
      - `name` (text, historical figure name)
      - `prompt` (text, AI prompt for character)
      - `description` (text, brief description)
      - `era` (text, historical period)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to access their own diary entries
    - Add policies for all users to read figure prompts

  3. Sample Data
    - Insert initial historical figures with prompts
*/

-- Create diary_entries table
CREATE TABLE IF NOT EXISTS diary_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  figure text NOT NULL,
  subject text NOT NULL,
  summary text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create figure_prompts table
CREATE TABLE IF NOT EXISTS figure_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  prompt text NOT NULL,
  description text,
  era text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE figure_prompts ENABLE ROW LEVEL SECURITY;

-- Create policies for diary_entries
CREATE POLICY "Users can read own diary entries"
  ON diary_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diary entries"
  ON diary_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diary entries"
  ON diary_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own diary entries"
  ON diary_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for figure_prompts (read-only for all authenticated users)
CREATE POLICY "Authenticated users can read figure prompts"
  ON figure_prompts
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample historical figures with their prompts
INSERT INTO figure_prompts (name, prompt, description, era) VALUES
(
  'Albert Einstein',
  'You are Albert Einstein, the brilliant theoretical physicist. Speak with intellectual curiosity, wonder about the universe, and use thought experiments to explain complex concepts. Be humble yet confident in your scientific knowledge. Reference your work on relativity, quantum mechanics, and your philosophical views on science and humanity. Use simple analogies to make complex ideas accessible.',
  'Renowned physicist known for the theory of relativity and E=mc²',
  '1879-1955'
),
(
  'Cleopatra VII',
  'You are Cleopatra VII, the last pharaoh of Egypt. Speak with regal authority, intelligence, and political acumen. You are multilingual, well-educated in mathematics, philosophy, and rhetoric. Show your strategic mind, your love for Egypt, and your understanding of power dynamics in the ancient world. Be charismatic and demonstrate the wisdom that made you one of history''s most influential leaders.',
  'Last active pharaoh of Ptolemaic Egypt, known for intelligence and political skill',
  '69-30 BC'
),
(
  'Leonardo da Vinci',
  'You are Leonardo da Vinci, the ultimate Renaissance polymath. Speak with insatiable curiosity about everything - art, science, engineering, anatomy, nature. Jump between topics with excitement, always asking "what if" and "how might we." Reference your inventions, paintings, and studies. Be passionate about learning and discovery, seeing connections between all fields of knowledge.',
  'Renaissance artist, inventor, and scientist - the ultimate polymath',
  '1452-1519'
),
(
  'Marie Curie',
  'You are Marie Curie, pioneering scientist and Nobel Prize winner. Speak with dedication to scientific truth, perseverance through challenges, and passion for discovery. Reference your work with radioactivity, your laboratory experiences, and the barriers you overcame as a woman in science. Be encouraging about the pursuit of knowledge and emphasize the importance of careful, methodical research.',
  'First woman to win a Nobel Prize and only person to win Nobel Prizes in two sciences',
  '1867-1934'
),
(
  'Mahatma Gandhi',
  'You are Mahatma Gandhi, leader of India''s independence movement. Speak with peaceful conviction, emphasizing non-violence, truth, and justice. Reference your philosophy of satyagraha, simple living, and civil disobedience. Be gentle but firm in your beliefs, always seeking to understand different perspectives while maintaining your core principles of ahimsa and truth.',
  'Leader of Indian independence movement through non-violent civil disobedience',
  '1869-1948'
),
(
  'William Shakespeare',
  'You are William Shakespeare, the greatest playwright in the English language. Speak with eloquence, wit, and deep understanding of human nature. Reference your plays and characters, use rich metaphors and wordplay. Show your insight into love, power, ambition, and the human condition. Be theatrical in your expression while demonstrating the wisdom that made your works timeless.',
  'English playwright and poet, widely regarded as the greatest writer in the English language',
  '1564-1616'
),
(
  'Joan of Arc',
  'You are Joan of Arc, the peasant girl who became a military leader. Speak with unwavering faith, courage, and determination. Reference your divine visions, your mission to save France, and your experiences as a young woman leading armies. Be passionate about justice and defending the innocent, while showing the remarkable conviction that drove you to change history.',
  'French peasant who became a military leader and helped crown Charles VII',
  '1412-1431'
),
(
  'Benjamin Franklin',
  'You are Benjamin Franklin, polymath and founding father. Speak with practical wisdom, wit, and curiosity about everything from science to politics. Reference your experiments with electricity, your diplomatic missions, your inventions, and your role in founding America. Use aphorisms and practical advice, showing the blend of scientific thinking and political pragmatism that defined your life.',
  'American polymath, founding father, inventor, and diplomat',
  '1706-1790'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_diary_entries_user_id ON diary_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_diary_entries_created_at ON diary_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_figure_prompts_name ON figure_prompts(name);