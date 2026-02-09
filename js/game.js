/**
 * Spellstacks - Daily word game
 */
(function() {
    let letters = [];
    let used = new Set();
    let current = [];
    let words = [];
    let done = false;
    let previousWords = null;
    let stats = { played: 0, streak: 0, best: 0, fewest: null, lastDate: null };
    let calculatedPar = null;

    const DAILY_EMOJIS = ['🪄', '✨', '🎩', '🐇', '🔮', '🧙', '⭐', '🌙'];

    const MAGIC_WORDS = new Set([
        'SPELL', 'MAGIC', 'WAND', 'HEX', 'CHARM', 'CURSE', 'POTION', 'RUNE', 'ARCANE', 'MYSTIC',
        'ENCHANT', 'CONJURE', 'RITUAL', 'OMEN', 'ORACLE', 'AMULET', 'SORCERY', 'VOODOO',
        'WITCH', 'WIZARD', 'COVEN', 'BREW', 'ELIXIR', 'FAIRY',
        'HAUNT', 'GHOST', 'SPIRIT', 'PHANTOM', 'WRAITH', 'SPECTER', 'DEMON',
        'SUMMON', 'INVOKE', 'CAST', 'SCROLL', 'TOME', 'ORB', 'CRYSTAL', 'ALCHEMY', 'CAULDRON',
        'JINX', 'WISH', 'BLESS', 'SMITE', 'BANISH', 'SCRY', 'DISPEL', 'BEWITCH',
        'MORPH', 'WARP', 'BLINK', 'WARD',
        'MAGE', 'DRUID', 'SHAMAN',
        'PIXIE', 'SPRITE', 'GNOME', 'IMP', 'DRAGON', 'NYMPH', 'GOLEM', 'DJINN',
        'SIREN', 'FIEND', 'BANSHEE', 'ELF', 'GOBLIN', 'TROLL', 'OGRE',
        'HYDRA', 'WYRM', 'LICH', 'GHOUL', 'HARPY',
        'SIGIL', 'TOTEM', 'OCCULT', 'ASTRAL', 'MANA', 'AURA', 'CURSED', 'BLIGHT'
    ]);

    function haptic(pattern = 10) {
        if (navigator.vibrate) navigator.vibrate(pattern);
    }

    // Announce to screen readers
    function announce(message) {
        const el = document.getElementById('srAnnounce');
        if (el) {
            el.textContent = '';
            setTimeout(() => { el.textContent = message; }, 100);
        }
    }

    function celebrateComplete() {
        // Wait for modal to be visible, then sparkle from edges
        setTimeout(() => {
            const modal = document.querySelector('#completeModal .modal-content');
            if (!modal) return;

            const rect = modal.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const colors = [
                '#3b7dd8', '#5b9ae8', '#7bb0f0', '#4a88d4',
                '#2d6bc4', '#6ba3ec', '#8bbef4', '#5590dc'
            ];

            // Create sparkles on edges, animating outward
            for (let i = 0; i < 20; i++) {
                const spark = document.createElement('div');
                spark.className = 'sparkle';

                // Position on edge of modal
                const side = Math.floor(Math.random() * 4);
                let x, y, tx, ty;
                if (side === 0) { // top
                    x = rect.left + Math.random() * rect.width;
                    y = rect.top;
                    tx = (Math.random() - 0.5) * 60;
                    ty = -(40 + Math.random() * 40);
                } else if (side === 1) { // right
                    x = rect.right;
                    y = rect.top + Math.random() * rect.height;
                    tx = 40 + Math.random() * 40;
                    ty = (Math.random() - 0.5) * 60;
                } else if (side === 2) { // bottom
                    x = rect.left + Math.random() * rect.width;
                    y = rect.bottom;
                    tx = (Math.random() - 0.5) * 60;
                    ty = 40 + Math.random() * 40;
                } else { // left
                    x = rect.left;
                    y = rect.top + Math.random() * rect.height;
                    tx = -(40 + Math.random() * 40);
                    ty = (Math.random() - 0.5) * 60;
                }

                spark.style.left = x + 'px';
                spark.style.top = y + 'px';
                spark.style.color = colors[Math.floor(Math.random() * colors.length)];
                spark.style.setProperty('--tx', tx + 'px');
                spark.style.setProperty('--ty', ty + 'px');
                spark.style.setProperty('--size', (10 + Math.random() * 16) + 'px');
                spark.style.setProperty('--rot', (120 + Math.random() * 240) + 'deg');
                document.body.appendChild(spark);

                spark.addEventListener('animationend', () => spark.remove(), { once: true });
            }
        }, 50);
    }

    async function init() {
        const today = new Date();
        document.getElementById('date').textContent = today.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric'
        });

        // Show 18 empty placeholder tiles immediately
        const rackEl = document.getElementById('rack');
        rackEl.innerHTML = Array.from({ length: 18 }, (_, i) =>
            `<button class="tile tile-empty" data-i="${i}" disabled></button>`
        ).join('');

        loadStats();
        await Dictionary.load();
        cacheDom();

        const seed = LetterSystem.getDateSeed();
        const saved = load();

        const generated = LetterSystem.generateLetters(new Date(), Dictionary.getCommonWords(), MAGIC_WORDS);
        calculatedPar = generated.wordCount;

        let animate = false;
        if (saved && saved.seed === seed) {
            letters = saved.letters;
            used = new Set(saved.used);
            words = saved.words;
            done = saved.done;
            lastWordCount = words.length; // Prevent animation on restore
        } else {
            letters = generated.letters;
            animate = true;
        }

        // Set daily emoji
        const emojiEl = document.querySelector('.completed-emoji');
        if (emojiEl) emojiEl.textContent = DAILY_EMOJIS[seed % DAILY_EMOJIS.length];

        render();

        // Staggered letter reveal animation
        if (animate && !done) {
            const tiles = rackEl.querySelectorAll('.tile');
            tiles.forEach((tile, i) => {
                tile.classList.add('tile-reveal');
                tile.style.animationDelay = (i * 30) + 'ms';
                tile.addEventListener('animationend', () => tile.classList.remove('tile-reveal'), { once: true });
            });
        }

        // Events
        document.getElementById('addBtn').addEventListener('click', addWord);

        document.getElementById('statsBtn').addEventListener('click', () => {
            document.getElementById('statPlayed').textContent = stats.played;
            document.getElementById('statStreak').textContent = stats.streak;
            document.getElementById('statBest').textContent = stats.best;
            document.getElementById('statFewest').textContent = stats.fewest !== null ? stats.fewest : '-';
            document.getElementById('statsModal').classList.add('show');
        });

        document.getElementById('closeStats').addEventListener('click', () => {
            document.getElementById('statsModal').classList.remove('show');
        });
        document.getElementById('closeComplete').addEventListener('click', () => {
            document.getElementById('completeModal').classList.remove('show');
        });
        document.getElementById('completedMessage').addEventListener('click', showComplete);

        document.getElementById('shareBtn').addEventListener('click', share);
        document.getElementById('replayBtn').addEventListener('click', replay);

        document.querySelectorAll('.modal').forEach(m => {
            m.addEventListener('click', e => {
                if (e.target === m) m.classList.remove('show');
            });
        });

        // Keyboard support
        document.addEventListener('keydown', e => {
            // Escape closes any open modal
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.show').forEach(m => m.classList.remove('show'));
                return;
            }

            if (done) return;
            if (document.querySelector('.modal.show')) return;

            if (e.key === 'Backspace') {
                e.preventDefault();
                deleteLetter();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                addWord();
            } else if (/^[a-zA-Z]$/.test(e.key)) {
                const letter = e.key.toUpperCase();
                // Find first available tile with this letter
                const idx = letters.findIndex((l, i) =>
                    l === letter && !used.has(i) && !current.includes(i)
                );
                if (idx !== -1) {
                    toggleTile(idx);
                }
            }
        });

        initAmbientParticles();
        if (done) showComplete();
    }

    function initAmbientParticles() {
        const container = document.getElementById('ambientParticles');
        if (!container) return;
        for (let i = 0; i < 12; i++) {
            const p = document.createElement('div');
            p.className = 'ambient-particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.animationDuration = (15 + Math.random() * 10) + 's';
            p.style.animationDelay = -(Math.random() * 20) + 's';
            p.style.setProperty('--size', (10 + Math.random() * 16) + 'px');
            p.style.setProperty('--sway', (20 + Math.random() * 30) + 'px');
            container.appendChild(p);
        }
    }

    function render() {
        renderRack();
        renderBuilder();
        renderWords();

        // Show/hide elements based on game state
        document.getElementById('actions').style.display = done ? 'none' : 'flex';
        rackEl.style.display = done ? 'none' : 'grid';
        document.getElementById('completedMessage').style.display = done ? 'flex' : 'none';

        const progressBar = document.getElementById('progressBar');
        progressBar.style.display = done ? 'none' : 'block';
        document.getElementById('progressFill').style.width = ((used.size + current.length) / 18 * 100) + '%';

        if (done) {
            updateCountdown();
        }
    }

    // Cache DOM references
    let rackEl, builderEl, wordsEl, addBtnEl, builderGroupEl;

    function cacheDom() {
        rackEl = document.getElementById('rack');
        builderEl = document.getElementById('builder');
        wordsEl = document.getElementById('words');
        addBtnEl = document.getElementById('addBtn');
        builderGroupEl = document.querySelector('.builder-group');

        // Event delegation - single listener on parent
        rackEl.addEventListener('click', e => {
            const btn = e.target.closest('.tile');
            if (btn && !btn.disabled) {
                toggleTile(parseInt(btn.dataset.i));
            }
        });

        wordsEl.addEventListener('click', e => {
            const btn = e.target.closest('button[data-i]');
            if (btn) {
                removeWord(parseInt(btn.dataset.i));
            }
        });

        wordsEl.addEventListener('dblclick', e => {
            const wordEl = e.target.closest('.word');
            if (wordEl) {
                const word = wordEl.dataset.word.toLowerCase();
                window.open(`https://en.wiktionary.org/wiki/${word}#English`, '_blank', 'noopener');
            }
        });

        builderEl.addEventListener('click', e => {
            if (e.target.closest('.delete-btn')) {
                deleteLetter();
            }
        });
    }

    function renderRack() {
        rackEl.innerHTML = letters.map((l, i) => {
            const isUsed = used.has(i) || current.includes(i);
            const cls = isUsed ? 'tile used' : 'tile';
            return `<button class="${cls}" data-i="${i}" ${isUsed || done ? 'disabled' : ''}>${l}</button>`;
        }).join('');
    }

    function renderBuilder() {
        if (done) {
            builderGroupEl.style.display = 'none';
            return;
        }

        builderGroupEl.style.display = 'block';
        builderEl.style.display = 'flex';
        addBtnEl.disabled = current.length === 0;

        if (current.length === 0) {
            builderEl.innerHTML = '<span class="hint">Select letters below</span>';
            builderEl.className = 'builder';
            return;
        }

        const word = current.map(i => letters[i]).join('');
        const valid = word.length >= 2 && Dictionary.isValidWord(word);

        builderEl.innerHTML = current.map(i =>
            `<span class="letter">${letters[i]}</span>`
        ).join('') + '<button class="delete-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg></button>';

        builderEl.className = 'builder' + (word.length >= 2 ? (valid ? ' valid' : ' invalid') : '');
    }

    let lastWordCount = 0;

    function sparkle(element, magic) {
        const rect = element.getBoundingClientRect();
        const colors = magic
            ? ['#7b2ff7', '#9b59f7', '#c084fc', '#f5c542', '#ffd700', '#e8b828', '#a855f7', '#d4a017']
            : ['#3b7dd8', '#5b9ae8', '#7bb0f0', '#4a88d4', '#2d6bc4', '#6ba3ec', '#8bbef4', '#5590dc'];
        const count = magic ? 16 : 10;
        const sizeBase = magic ? 12 : 8;
        const sizeRange = magic ? 18 : 14;
        const spreadX = magic ? 100 : 80;
        const spreadY = magic ? 70 : 50;

        for (let i = 0; i < count; i++) {
            const spark = document.createElement('div');
            spark.className = 'sparkle';
            spark.style.left = rect.left + Math.random() * rect.width + 'px';
            spark.style.top = rect.top + Math.random() * rect.height + 'px';
            spark.style.color = colors[Math.floor(Math.random() * colors.length)];
            spark.style.setProperty('--tx', (Math.random() - 0.5) * spreadX + 'px');
            spark.style.setProperty('--ty', (Math.random() - 0.5) * spreadY - 25 + 'px');
            spark.style.setProperty('--size', (sizeBase + Math.random() * sizeRange) + 'px');
            spark.style.setProperty('--rot', (120 + Math.random() * 240) + 'deg');
            document.body.appendChild(spark);

            spark.addEventListener('animationend', () => spark.remove(), { once: true });
        }
    }

    function renderWords() {
        const previousHint = previousWords && !done
            ? `<div class="previous-words">Last time: ${previousWords.join(', ')}</div>`
            : '';

        if (words.length === 0) {
            wordsEl.innerHTML = previousHint;
            lastWordCount = 0;
            return;
        }

        const isNewWord = words.length > lastWordCount;
        lastWordCount = words.length;

        wordsEl.innerHTML = words.map((w, i) =>
            `<div class="word${isNewWord && i === 0 ? ' new' : ''}" data-word="${w.word}"><span class="word-text">${w.word}</span>${!done ? `<button data-i="${i}">&times;</button>` : ''}</div>`
        ).join('') + previousHint;

        if (isNewWord) {
            const newWordEl = wordsEl.querySelector('.word.new');
            if (newWordEl) {
                const isMagic = MAGIC_WORDS.has(words[0].word);
                requestAnimationFrame(() => sparkle(newWordEl, isMagic));
            }
        }
    }

    function toggleTile(i) {
        if (done || used.has(i) || current.includes(i)) return;

        // Animate the selected tile
        const tile = rackEl.querySelector(`.tile[data-i="${i}"]`);
        if (tile) {
            tile.classList.add('tile-select');
            tile.disabled = true;
        }

        current.push(i);
        haptic(10);
        renderBuilder();
    }

    function deleteLetter() {
        if (current.length === 0) return;
        const restored = current.pop();

        // Animate the tile back
        const tile = rackEl.querySelector(`.tile[data-i="${restored}"]`);
        if (tile) {
            tile.disabled = false;
            tile.classList.remove('tile-select');
            tile.classList.add('tile-restore');
            tile.addEventListener('animationend', () => tile.classList.remove('tile-restore'), { once: true });
        }

        renderBuilder();
    }

    function addWord() {
        if (current.length < 1) return shake();

        const word = current.map(i => letters[i]).join('');

        if (!Dictionary.isValidWord(word)) {
            announce(`${word} is not a valid word`);
            return shake();
        }
        if (words.some(w => w.word === word)) {
            announce(`${word} already used`);
            return shake();
        }

        words.unshift({ word, indices: [...current] });
        current.forEach(i => used.add(i));
        current = [];
        haptic(20);
        announce(`${word} added. ${18 - used.size} letters remaining.`);

        // Auto-finish if all 18 letters are used
        if (used.size === 18) {
            finish();
        } else {
            render();
            save();
        }
    }

    function removeWord(idx) {
        if (done) return;
        const word = words[idx].word;
        words[idx].indices.forEach(i => used.delete(i));
        words.splice(idx, 1);
        announce(`${word} removed`);
        render();
        save();
    }

    function resetGame() {
        if (done) return;
        if (!confirm('Start over with the same letters?')) return;

        used = new Set();
        current = [];
        words = [];

        render();
        save();
    }

    function shake() {
        builderEl.classList.add('shake');
        haptic([50, 30, 50]);
        setTimeout(() => builderEl.classList.remove('shake'), 300);
    }

    function finish() {
        done = true;
        updateStats();
        save();
        haptic([50, 50, 50, 50, 100]);
        showComplete();
        celebrateComplete();
        render();
        announce(`Puzzle complete! You used all letters in ${words.length} words.`);
    }

    function showComplete() {
        document.getElementById('finalScore').textContent = words.length;

        let summary = `word${words.length !== 1 ? 's' : ''}`;
        if (stats.fewest !== null && words.length < stats.fewest) {
            summary += ` — a new best!`;
        }
        document.getElementById('summary').textContent = summary;

        // Display par
        const parMessage = document.getElementById('parMessage');
        if (calculatedPar !== null) {
            parMessage.innerHTML = `Top players completed this puzzle in <b>${calculatedPar}</b> word${calculatedPar !== 1 ? 's' : ''}`;
        } else {
            parMessage.textContent = '';
        }

        document.getElementById('completeModal').classList.add('show');
    }

    function replay() {
        previousWords = words.map(w => w.word);
        used = new Set();
        current = [];
        words = [];
        done = false;
        document.getElementById('completeModal').classList.remove('show');
        render();
        save();
    }

    function share() {
        let text = `I completed today's Spellstacks puzzle in only ${words.length} word${words.length !== 1 ? 's' : ''}!`;
        text += `\n\nCan you do better? Come join me at https://spellstacks.com`;

        if (navigator.share) {
            navigator.share({ text }).catch(() => copy(text));
        } else {
            copy(text);
        }
    }

    function copy(text) {
        navigator.clipboard.writeText(text).then(() => {
            const btn = document.getElementById('shareBtn');
            btn.textContent = 'Copied';
            setTimeout(() => btn.textContent = 'Share', 1500);
        });
    }

    function updateStats() {
        const today = new Date().toISOString().split('T')[0];
        if (stats.lastDate === today) return;

        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        stats.played++;
        stats.streak = stats.lastDate === yesterday ? stats.streak + 1 : 1;
        stats.best = Math.max(stats.best, stats.streak);
        if (used.size === 18) {
            if (stats.fewest === null || words.length < stats.fewest) {
                stats.fewest = words.length;
            }
        }
        stats.lastDate = today;
        localStorage.setItem('ww_stats', JSON.stringify(stats));
    }

    function loadStats() {
        try {
            const s = JSON.parse(localStorage.getItem('ww_stats'));
            if (s) {
                stats = { ...stats, ...s };
                const today = new Date().toISOString().split('T')[0];
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                if (stats.lastDate && stats.lastDate !== today && stats.lastDate !== yesterday) {
                    stats.streak = 0;
                }
            }
        } catch {}
    }

    function save() {
        localStorage.setItem('ww_game', JSON.stringify({
            seed: LetterSystem.getDateSeed(),
            letters,
            used: Array.from(used),
            words,
            done
        }));
    }

    function load() {
        try { return JSON.parse(localStorage.getItem('ww_game')); }
        catch { return null; }
    }

    function updateCountdown() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const diff = tomorrow - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        const countdownEl = document.getElementById('countdown');
        if (countdownEl) {
            countdownEl.textContent = `${hours}h ${minutes}m`;
        }

        // Update every minute
        setTimeout(updateCountdown, 60000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
