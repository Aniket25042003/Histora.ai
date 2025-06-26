// Define the mapping of historical figures to their allowed topics
export const figureTopicMapping: Record<string, string[]> = {
  'Albert Einstein': ['Science', 'Innovation', 'Philosophy'],
  'Cleopatra': ['Leadership', 'Philosophy', 'Historical Events'],
  'Leonardo da Vinci': ['Art & Creativity', 'Innovation', 'Science'],
  'Marie Curie': ['Science', 'Innovation', 'Personal Growth'],
  'William Shakespeare': ['Art & Creativity', 'Philosophy', 'Life Wisdom'],
  'Napoleon Bonaparte': ['Leadership', 'Historical Events', 'Philosophy'],
  'Socrates': ['Philosophy', 'Life Wisdom', 'Personal Growth'],
  'Nikola Tesla': ['Science', 'Innovation', 'Personal Growth'],
  'Maya Angelou': ['Art & Creativity', 'Life Wisdom', 'Personal Growth'],
  'Winston Churchill': ['Leadership', 'Historical Events', 'Life Wisdom'],
  'Benjamin Franklin': ['Innovation', 'Philosophy', 'Leadership', 'Science'],
  'Cleopatra VII': ['Leadership', 'Philosophy', 'Historical Events'],
  'Joan of Arc': ['Leadership', 'Historical Events', 'Personal Growth'],
  'Mahatma Gandhi': ['Leadership', 'Philosophy', 'Personal Growth', 'Historical Events']
}

// Get allowed topics for a specific figure
export const getAllowedTopicsForFigure = (figureName: string): string[] => {
  return figureTopicMapping[figureName] || []
}

// Check if a topic is allowed for a figure
export const isTopicAllowedForFigure = (figureName: string, topic: string): boolean => {
  const allowedTopics = getAllowedTopicsForFigure(figureName)
  return allowedTopics.includes(topic)
}

// Get all available topics
export const allTopics = [
  'Philosophy',
  'Leadership', 
  'Science',
  'Art & Creativity',
  'Innovation',
  'Life Wisdom',
  'Historical Events',
  'Personal Growth'
]