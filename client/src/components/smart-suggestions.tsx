import { Button } from "@/components/ui/button";

// Import WEDDING_DICT from the spell correction hook
export const WEDDING_DICT = {
  starters: {
    'what is the': [
      'what is the best decoration for mandap?',
      'what is the cost of catering?',
      'what is the meaning of pheras?'
    ],
    'how to': [
      'how to make guest list?',
      'how to choose venue?',
      'how to save budget?'
    ],
    'show me': [
      'show me decoration ideas',
      'show me mandap designs',
      'show me bridal lehenga'
    ]
  },
  general: [
    'decoration', 'mandap', 'mehendi', 'catering', 'venue', 'budget',
    'guest list', 'invitation', 'photography', 'sangeet', 'haldi'
  ]
};

interface SmartSuggestionsProps {
  inputText: string;
  messageCount: number;
  onSuggestionClick: (suggestion: string) => void;
}

export function SmartSuggestions({ inputText, messageCount, onSuggestionClick }: SmartSuggestionsProps) {
  // Only show suggestions if user has typed 3+ characters
  if (!inputText || inputText.trim().length < 3) {
    return null;
  }

  // After 15 messages, don't show starter suggestions (only show for first 15 messages)
  const isWithinFirst15Messages = messageCount < 15;

  const getSuggestions = (): string[] => {
    const inputLower = inputText.toLowerCase().trim();

    // Only check for starter suggestions if within first 15 messages
    if (isWithinFirst15Messages) {
      // Check for starter phrases
      for (const [starter, suggestions] of Object.entries(WEDDING_DICT.starters)) {
        if (inputLower.startsWith(starter)) {
          return suggestions;
        }
      }
    }

    // For anything else or after 15 messages, pick 3 relevant from general
    // Filter general terms that match or are related to input
    const matchingGeneral = WEDDING_DICT.general.filter(term => 
      term.toLowerCase().includes(inputLower) || inputLower.includes(term.toLowerCase())
    );

    // Format general suggestions as actionable phrases
    const formatGeneralSuggestions = (terms: string[]): string[] => {
      return terms.slice(0, 3).map(term => `show me ${term} options`);
    };

    // If we have matches, format and return up to 3
    if (matchingGeneral.length > 0) {
      return formatGeneralSuggestions(matchingGeneral);
    }

    // Otherwise, return first 3 general terms formatted
    return formatGeneralSuggestions(WEDDING_DICT.general);
  };

  const suggestions = getSuggestions();

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 px-2 pb-2">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap"
          onClick={() => onSuggestionClick(suggestion)}
          type="button"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}

