#!/usr/bin/env python3
"""Fetch the NWL2023 (North American Scrabble) word list into data/words.txt."""

import os
import urllib.request
import ssl

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WORDS_FILE = os.path.join(SCRIPT_DIR, "..", "data", "words.txt")

# NWL 2023 - North American tournament list (~197K)
# Format: "WORD definition..." - extract first token
NWL_URL = "https://raw.githubusercontent.com/scrabblewords/scrabblewords/main/words/North-American/NWL2023.txt"

MAX_LEN = 18


def main():
    print(f"Fetching NWL2023 from {NWL_URL} ...")
    ctx = ssl.create_default_context()
    req = urllib.request.Request(NWL_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
        text = resp.read().decode("utf-8", errors="ignore")

    words = set()
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        w = line.split()[0].lower()
        if w.isalpha() and 1 <= len(w) <= MAX_LEN:
            words.add(w)

    print(f"  Got {len(words):,} valid words")

    merged = sorted(words)
    with open(WORDS_FILE, "w", encoding="utf-8", newline="\n") as f:
        for word in merged:
            f.write(word + "\n")

    print(f"Final word count: {len(merged):,}")
    print("Done!")


if __name__ == "__main__":
    main()
