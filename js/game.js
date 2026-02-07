/**
 * Spellstacks - Daily word game
 */
(function() {
    let letters = [];
    let used = new Set();
    let current = [];
    let words = [];
    let done = false;
    let stats = { played: 0, streak: 0, best: 0, fewest: null, lastDate: null };
    let calculatedPar = null;

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

    function confetti() {
        const container = document.createElement('div');
        container.className = 'confetti-container';
        document.body.appendChild(container);

        const colors = ['#4a90d9', '#00a67d', '#f4b400', '#e02c2c', '#9c27b0'];
        for (let i = 0; i < 50; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti';
            piece.style.left = Math.random() * 100 + '%';
            piece.style.top = -10 + 'px';
            piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            piece.style.animation = `confetti-fall ${1.5 + Math.random()}s ease-out ${Math.random() * 0.5}s forwards`;
            container.appendChild(piece);
        }

        setTimeout(() => container.remove(), 3000);
    }

    async function init() {
        const today = new Date();
        document.getElementById('date').textContent = today.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric'
        });

        loadStats();
        await Dictionary.load();
        cacheDom();

        const seed = LetterSystem.getDateSeed();
        const saved = load();

        if (saved && saved.seed === seed) {
            letters = saved.letters;
            used = new Set(saved.used);
            words = saved.words;
            done = saved.done;
            lastWordCount = words.length; // Prevent animation on restore
        } else {
            letters = LetterSystem.generateLetters(new Date(), Dictionary.getCommonWords());
        }

        render();

        // Calculate par in background
        setTimeout(() => {
            calculatedPar = Dictionary.calculatePar(letters);
        }, 100);

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

        if (done) showComplete();
    }

    function render() {
        renderRack();
        renderBuilder();
        renderWords();

        // Show/hide elements based on game state
        document.getElementById('actions').style.display = done ? 'none' : 'flex';
        rackEl.style.display = done ? 'none' : 'grid';
        document.getElementById('completedMessage').style.display = done ? 'flex' : 'none';

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

    function sparkle(element) {
        const rect = element.getBoundingClientRect();
        const colors = [
            '#3b7dd8', '#5b9ae8', '#7bb0f0', '#4a88d4',
            '#2d6bc4', '#6ba3ec', '#8bbef4', '#5590dc'
        ];

        for (let i = 0; i < 10; i++) {
            const spark = document.createElement('div');
            spark.className = 'sparkle';
            spark.style.left = rect.left + Math.random() * rect.width + 'px';
            spark.style.top = rect.top + Math.random() * rect.height + 'px';
            spark.style.color = colors[Math.floor(Math.random() * colors.length)];
            spark.style.setProperty('--tx', (Math.random() - 0.5) * 80 + 'px');
            spark.style.setProperty('--ty', (Math.random() - 0.5) * 50 - 25 + 'px');
            spark.style.setProperty('--size', (8 + Math.random() * 14) + 'px');
            spark.style.setProperty('--rot', (120 + Math.random() * 240) + 'deg');
            document.body.appendChild(spark);

            spark.addEventListener('animationend', () => spark.remove(), { once: true });
        }
    }

    function renderWords() {
        if (words.length === 0) {
            wordsEl.innerHTML = '';
            lastWordCount = 0;
            return;
        }

        const isNewWord = words.length > lastWordCount;
        lastWordCount = words.length;

        wordsEl.innerHTML = words.map((w, i) =>
            `<div class="word${isNewWord && i === 0 ? ' new' : ''}" data-word="${w.word}"><span class="word-text">${w.word}</span>${!done ? `<button data-i="${i}">&times;</button>` : ''}</div>`
        ).join('');

        if (isNewWord) {
            const newWordEl = wordsEl.querySelector('.word.new');
            if (newWordEl) {
                requestAnimationFrame(() => sparkle(newWordEl));
            }
        }
    }

    function toggleTile(i) {
        if (done || used.has(i) || current.includes(i)) return;
        current.push(i);
        haptic(10);
        renderRack();
        renderBuilder();
    }

    function deleteLetter() {
        if (current.length === 0) return;
        current.pop();
        renderRack();
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
        confetti();
        showComplete();
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

        // Display par (or loading message if still calculating)
        const parMessage = document.getElementById('parMessage');
        if (calculatedPar !== null) {
            parMessage.innerHTML = `Top players completed this puzzle in <b>${calculatedPar}</b> word${calculatedPar !== 1 ? 's' : ''}`;
        } else {
            parMessage.textContent = 'Loading top scores...';
            // Check again when calculation finishes
            const checkPar = setInterval(() => {
                if (calculatedPar !== null) {
                    parMessage.innerHTML = `Top players completed this puzzle in <b>${calculatedPar}</b> word${calculatedPar !== 1 ? 's' : ''}`;
                    clearInterval(checkPar);
                }
            }, 100);
        }

        document.getElementById('completeModal').classList.add('show');
    }

    function replay() {
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
