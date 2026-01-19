/**
 * Letter generation system
 */

const LetterSystem = (function() {
    // Letter frequency weights for fallback generation
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

    function generateLetters(date = new Date(), wordList = null) {
        const seed = getDateSeed(date);
        const rng = mulberry32(seed);

        // If we have a word list, use word-based generation
        if (wordList && wordList.length > 0) {
            const result = generateFromWords(rng, wordList);
            if (result) return result;
        }

        // Fallback to random generation
        return generateRandom(rng);
    }

    function generateFromWords(rng, wordList) {
        // Group words by length (2-9 letters only)
        const byLength = {};
        for (const word of wordList) {
            if (word.length >= 2 && word.length <= 9) {
                if (!byLength[word.length]) byLength[word.length] = [];
                byLength[word.length].push(word);
            }
        }

        // Shuffle each length group
        for (const len in byLength) {
            shuffle(byLength[len], rng);
        }

        // Patterns that sum to 18 letters
        const patterns = [
            [6, 6, 6],
            [6, 6, 4, 2],
            [6, 5, 5, 2],
            [6, 5, 4, 3],
            [5, 5, 5, 3],
            [5, 5, 4, 4],
            [7, 6, 5],
            [7, 5, 4, 2],
            [8, 6, 4],
            [8, 5, 5],
            [9, 5, 4],
            [9, 6, 3],
            [4, 4, 4, 4, 2],
            [4, 4, 4, 3, 3],
            [3, 3, 3, 3, 3, 3]
        ];

        // Shuffle patterns for variety
        shuffle(patterns, rng);

        // Try each pattern
        for (const pattern of patterns) {
            const words = [];
            const indices = {};
            let valid = true;

            for (const len of pattern) {
                if (!byLength[len] || byLength[len].length === 0) {
                    valid = false;
                    break;
                }

                const idx = indices[len] || 0;
                if (idx >= byLength[len].length) {
                    valid = false;
                    break;
                }

                words.push(byLength[len][idx]);
                indices[len] = idx + 1;
            }

            if (valid) {
                // Extract letters from words and shuffle
                const letters = words.join('').split('');
                shuffle(letters, rng);
                return letters;
            }
        }

        return null;
    }

    function generateRandom(rng) {
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

        shuffle(letters, rng);
        return letters;
    }

    function shuffle(arr, rng) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    return {
        generateLetters,
        getDateSeed
    };
})();
