#!/usr/bin/env python3
"""Merge public-domain Scrabble word lists into data/words.txt."""

import os
import urllib.request
import ssl

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WORDS_FILE = os.path.join(SCRIPT_DIR, "..", "data", "words.txt")

# Scrabble dictionary sources (word-per-line or word+definition format)
SOURCES = [
    # Collins Scrabble Words 2021 - most comprehensive international list (~279K)
    # Format: "WORD definition..." - extract first token
    {
        "url": "https://raw.githubusercontent.com/scrabblewords/scrabblewords/main/words/British/CSW21.txt",
        "parse": "first_token",
    },
    # NWL 2023 - North American tournament list (~197K)
    # Format: "WORD definition..." - extract first token
    {
        "url": "https://raw.githubusercontent.com/scrabblewords/scrabblewords/main/words/North-American/NWL2023.txt",
        "parse": "first_token",
    },
    # SOWPODS plain list as fallback (~268K)
    {
        "url": "https://raw.githubusercontent.com/jesstess/Scrabble/master/scrabble/sowpods.txt",
        "parse": "whole_line",
    },
]

MAX_LEN = 18


def fetch_words(source):
    """Download a word list from a URL, return set of lowercase words."""
    url = source["url"]
    parse = source["parse"]
    print(f"  Fetching {url} ...")
    ctx = ssl.create_default_context()
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
            text = resp.read().decode("utf-8", errors="ignore")
        words = set()
        for line in text.splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if parse == "first_token":
                w = line.split()[0].lower()
            else:
                w = line.lower()
            if w.isalpha() and 1 <= len(w) <= MAX_LEN:
                words.add(w)
        print(f"    Got {len(words):,} valid words")
        return words
    except Exception as e:
        print(f"    FAILED: {e}")
        return set()


def main():
    # Load existing words
    print(f"Loading existing words from {WORDS_FILE}")
    with open(WORDS_FILE, "r", encoding="utf-8") as f:
        existing = set(line.strip().lower() for line in f if line.strip())
    print(f"  Existing: {len(existing):,} words")

    # Fetch and merge remote sources
    print("\nFetching Scrabble dictionaries:")
    all_new = set()
    for source in SOURCES:
        all_new |= fetch_words(source)

    # Compute additions
    additions = all_new - existing
    print(f"\nNew words to add: {len(additions):,}")

    if additions:
        sample = sorted(additions)[:20]
        print(f"Sample new words: {', '.join(sample)}")

    # Merge and write
    merged = sorted(existing | all_new)
    with open(WORDS_FILE, "w", encoding="utf-8", newline="\n") as f:
        for word in merged:
            f.write(word + "\n")

    print(f"\nFinal word count: {len(merged):,}")
    print("Done!")


if __name__ == "__main__":
    main()
