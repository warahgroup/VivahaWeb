import { useEffect, useRef } from "react";
import Fuse from "fuse.js";

const WEDDING_DICT = {
  corrections: {
    'deco': 'decoration', 'dec': 'decoration', 'decor': 'decoration',
    'mandp': 'mandap', 'mandpam': 'mandap',
    'mehndi': 'mehendi', 'mehendi': 'mehendi',
    'sivam': 'shivam', 'shiva': 'shivam',
    'genderal': 'general', 'genral': 'general',
    'tommorow': 'tomorrow', 'recieve': 'receive'
  },
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

// Create Fuse instance for fuzzy matching
// Only include individual words for spell correction, NOT full phrases
const createFuseInstance = () => {
  const allTerms: string[] = [
    ...Object.keys(WEDDING_DICT.corrections),
    ...Object.values(WEDDING_DICT.corrections),
    ...WEDDING_DICT.general,
    // DO NOT include starter phrases - they are only for suggestions, not auto-correction
  ];

  return new Fuse(allTerms, {
    threshold: 0.4, // Lower = more strict matching
    includeScore: true,
    minMatchCharLength: 2,
  });
};

export function useSpellCorrection() {
  const fuseRef = useRef<Fuse<string> | null>(null);

  useEffect(() => {
    fuseRef.current = createFuseInstance();
  }, []);

  const correctText = (inputText: string): string => {
    if (!inputText.trim() || !fuseRef.current) {
      return inputText;
    }

    let corrected = inputText;

    // Only correct individual words, not full phrases
    // Split by whitespace to get individual words
    const words = corrected.split(/\s+/);
    const spaces = corrected.match(/\s+/g) || [];
    
    // Process each word individually
    words.forEach((word, index) => {
      if (!word || word.length < 2) {
        return;
      }

      const wordLower = word.toLowerCase();

      // Only check direct corrections dictionary for typos
      // DO NOT auto-complete or suggest full phrases
      if (WEDDING_DICT.corrections[wordLower as keyof typeof WEDDING_DICT.corrections]) {
        const correctedWord = WEDDING_DICT.corrections[wordLower as keyof typeof WEDDING_DICT.corrections];
        // Escape special regex characters
        const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Use word boundary to match whole words only
        const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
        corrected = corrected.replace(regex, correctedWord);
        return;
      }

      // Use fuzzy matching only for individual single words (not phrases)
      // Only match if it's a single word (no spaces) and at least 3 chars
      if (wordLower.length >= 3 && !wordLower.includes(' ')) {
        const results = fuseRef.current!.search(wordLower);
        if (results.length > 0 && results[0].score! < 0.4) {
          const bestMatch = results[0].item;
          // Only replace single words, not phrases
          // Make sure the match is also a single word (no spaces)
          if (bestMatch !== wordLower && 
              results[0].score! < 0.3 && 
              !bestMatch.includes(' ')) {
            // Escape special regex characters
            const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
            corrected = corrected.replace(regex, bestMatch);
          }
        }
      }
    });

    return corrected;
  };

  return {
    correctText,
  };
}

