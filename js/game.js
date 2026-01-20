/**
 * Wordweave - Simple word game
 */
(function() {
    let letters = [];
    let used = new Set();
    let current = [];
    let words = [];
    let done = false;
    let stats = { played: 0, streak: 0, best: 0, top: 0, lastDate: null };

    async function init() {
        const today = new Date();
        document.getElementById('date').textContent = today.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric'
        });

        loadStats();
        await Dictionary.load();

        const seed = LetterSystem.getDateSeed();
        const saved = load();

        if (saved && saved.seed === seed) {
            letters = saved.letters;
            used = new Set(saved.used);
            words = saved.words;
            done = saved.done;
        } else {
            letters = LetterSystem.generateLetters(new Date(), Dictionary.getCommonWords());
        }

        render();

        // Events
        document.getElementById('addBtn').addEventListener('click', addWord);
        document.getElementById('resetBtn').addEventListener('click', resetGame);

        document.getElementById('statsBtn').addEventListener('click', () => {
            document.getElementById('statPlayed').textContent = stats.played;
            document.getElementById('statStreak').textContent = stats.streak;
            document.getElementById('statBest').textContent = stats.best;
            document.getElementById('statTop').textContent = stats.top;
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

        if (done) showComplete();
    }

    function render() {
        renderRack();
        renderBuilder();
        renderWords();
        renderScore();

        // Show/hide buttons based on game state
        document.getElementById('resetBtn').style.display =
            (words.length > 0 && !done) ? 'block' : 'none';
        document.getElementById('actions').style.display = done ? 'none' : 'flex';
        document.getElementById('completedMessage').style.display = done ? 'block' : 'none';

        if (done) {
            updateCountdown();
        }
    }

    function renderRack() {
        const rack = document.getElementById('rack');
        rack.innerHTML = letters.map((l, i) => {
            const isUsed = used.has(i);
            const isSel = current.includes(i);
            const cls = isUsed ? 'tile used' : isSel ? 'tile sel' : 'tile';
            return `<button class="${cls}" data-i="${i}" ${isUsed || done ? 'disabled' : ''}>${l}</button>`;
        }).join('');

        rack.querySelectorAll('.tile:not(.used)').forEach(btn => {
            btn.addEventListener('click', () => toggleTile(parseInt(btn.dataset.i)));
        });
    }

    function renderBuilder() {
        const builder = document.getElementById('builder');

        if (done) {
            builder.style.display = 'none';
            return;
        }

        builder.style.display = 'flex';

        if (current.length === 0) {
            builder.innerHTML = '<span class="hint">Tap letters below</span>';
            builder.className = 'builder';
            return;
        }

        const word = current.map(i => letters[i]).join('');
        const valid = word.length >= 2 && Dictionary.isValidWord(word);

        builder.innerHTML = current.map(i =>
            `<span class="letter">${letters[i]}</span>`
        ).join('') + '<button class="delete-btn" id="deleteBtn">&larr;</button>';

        builder.className = 'builder' + (word.length >= 2 ? (valid ? ' valid' : ' invalid') : '');

        document.getElementById('deleteBtn').addEventListener('click', deleteLetter);
    }

    function renderWords() {
        const container = document.getElementById('words');
        if (words.length === 0) {
            container.innerHTML = '';
            return;
        }
        container.innerHTML = words.map((w, i) =>
            `<div class="word">${w.word}${!done ? `<button data-i="${i}">&times;</button>` : ''}</div>`
        ).join('');

        container.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => removeWord(parseInt(btn.dataset.i)));
        });
    }

    function renderScore() {
        const scoreEl = document.getElementById('score');
        const remaining = 18 - used.size;

        if (used.size === 18) {
            scoreEl.innerHTML = `<span class="complete">All letters used!</span>`;
        } else {
            scoreEl.innerHTML = `${used.size}/18 <span class="remaining">${remaining} left</span>`;
        }
    }

    function toggleTile(i) {
        if (done || used.has(i) || current.includes(i)) return;
        current.push(i);
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
        if (current.length < 2) return shake();

        const word = current.map(i => letters[i]).join('');

        if (!Dictionary.isValidWord(word)) return shake();
        if (words.some(w => w.word === word)) return shake();

        words.push({ word, indices: [...current] });
        current.forEach(i => used.add(i));
        current = [];

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
        words[idx].indices.forEach(i => used.delete(i));
        words.splice(idx, 1);
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
        const b = document.getElementById('builder');
        b.classList.add('shake');
        setTimeout(() => b.classList.remove('shake'), 300);
    }

    function finish() {
        done = true;
        updateStats();
        save();
        showComplete();
        render();
    }

    function showComplete() {
        const perfect = used.size === 18;
        document.getElementById('finalScore').textContent = `${used.size}/18`;

        let summary = `${words.length} word${words.length !== 1 ? 's' : ''}`;
        if (perfect) {
            summary = 'Perfect! ' + summary;
        }
        document.getElementById('summary').textContent = summary;
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
        const d = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const perfect = used.size === 18;
        let text = `Spellstacks ${d}`;
        if (perfect) {
            text += `\nPerfect! All 18 letters used`;
        } else {
            text += `\n${used.size}/18 letters`;
        }
        text += ` in ${words.length} word${words.length !== 1 ? 's' : ''}`;
        text += `\n\nhttps://spellstacks.com`;

        if (navigator.share) {
            navigator.share({ text }).catch(() => copy(text));
        } else {
            copy(text);
        }
    }

    function copy(text) {
        navigator.clipboard.writeText(text).then(() => {
            const btn = document.getElementById('shareBtn');
            btn.textContent = 'Copied!';
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
        if (used.size === 18) stats.top++;
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
