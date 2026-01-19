/**
 * Letter generation and scoring system
 */

const LetterSystem = (function() {
    // Point values - more spread, still based on frequency
    // Lower = more common, Higher = rarer
    const POINT_VALUES = {
        'E': 1, 'A': 1,
        'I': 2, 'O': 2, 'N': 2, 'T': 2,
        'R': 3, 'S': 3, 'L': 3,
        'D': 4, 'U': 4, 'C': 4,
        'M': 5, 'G': 5, 'H': 5,
        'P': 6, 'B': 6, 'W': 6, 'F': 6, 'Y': 6,
        'K': 7, 'V': 7,
        'J': 8, 'X': 8,
        'Q': 10, 'Z': 10
    };

    // Bonus for using all 18 letters
    const ALL_LETTERS_BONUS = 25;

    // Letter frequency weights for selection
    const LETTER_WEIGHTS = {
        'E': 12.7, 'T': 9.1, 'A': 8.2, 'O': 7.5, 'I': 7.0, 'N': 6.7,
        'S': 6.3, 'H': 6.1, 'R': 6.0, 'D': 4.3, 'L': 4.0, 'C': 2.8,
        'U': 2.8, 'M': 2.4, 'W': 2.4, 'F': 2.2, 'G': 2.0, 'Y': 2.0,
        'P': 1.9, 'B': 1.5, 'V': 1.0, 'K': 0.8, 'J': 0.15, 'X': 0.15,
        'Q': 0.10, 'Z': 0.07
    };

    const VOWELS = ['A', 'E', 'I', 'O', 'U'];
    const COMMON_CONSONANTS = ['T', 'N', 'S', 'R', 'L'];

    // Mulberry32 seeded PRNG
    function mulberry32(seed) {
        return function() {
            let t = seed += 0x6D2B79F5;
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    }

    function getDateSeed(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return parseInt(`${year}${month}${day}`, 10);
    }

    function weightedSelect(rng, weights, exclude = []) {
        const available = Object.entries(weights).filter(([letter]) => !exclude.includes(letter));
        const totalWeight = available.reduce((sum, [, weight]) => sum + weight, 0);

        let random = rng() * totalWeight;
        for (const [letter, weight] of available) {
            random -= weight;
            if (random <= 0) return letter;
        }
        return available[available.length - 1][0];
    }

    function generateLetters(date = new Date()) {
        const seed = getDateSeed(date);
        const rng = mulberry32(seed);
        const letters = [];

        // Guarantee 5-6 vowels
        const numVowels = 5 + (rng() < 0.5 ? 1 : 0);
        const vowelWeights = {};
        VOWELS.forEach(v => vowelWeights[v] = LETTER_WEIGHTS[v]);

        for (let i = 0; i < numVowels; i++) {
            letters.push(weightedSelect(rng, vowelWeights));
        }

        // Add some common consonants
        for (const consonant of COMMON_CONSONANTS) {
            if (rng() < 0.7 && letters.length < 18) {
                letters.push(consonant);
            }
        }

        // Fill remaining with weighted random
        while (letters.length < 18) {
            const adjustedWeights = { ...LETTER_WEIGHTS };
            letters.forEach(l => {
                if (adjustedWeights[l]) adjustedWeights[l] *= 0.7;
            });
            letters.push(weightedSelect(rng, adjustedWeights));
        }

        // Shuffle
        for (let i = letters.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [letters[i], letters[j]] = [letters[j], letters[i]];
        }

        return letters;
    }

    function getPointValue(letter) {
        return POINT_VALUES[letter.toUpperCase()] || 0;
    }

    function calculateLetterPoints(letters) {
        return letters.reduce((sum, letter) => sum + getPointValue(letter), 0);
    }

    return {
        generateLetters,
        getPointValue,
        calculateLetterPoints,
        getDateSeed,
        POINT_VALUES,
        ALL_LETTERS_BONUS
    };
})();
