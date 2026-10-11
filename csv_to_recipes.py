#!/usr/bin/env python3
"""Convert construction.csv → src/data/recipes.json.

Column layout (tab-separated):
  1  Item name with location appended  e.g. "Timber stockpileYard"
  2  Location(s), comma-separated       e.g. "Yard, Sawmill"
  3  Ingredients, comma-separated       e.g. "6 Stick, 2 Board"
  4  Notes (ignored)
"""

import csv
import io
import json
import re
import sys
from pathlib import Path

CSV_FILE = Path(__file__).parent / "construction.csv"
RECIPES_FILE = Path(__file__).parent / "src" / "data" / "recipes.json"


def parse_ingredients(raw: str) -> list[dict]:
    ingredients = []
    for token in raw.split(","):
        token = token.strip()
        if not token:
            continue
        m = re.match(r"^(\d+)\s+(.+)$", token)
        if not m:
            print(f"  WARNING: could not parse ingredient {token!r}", file=sys.stderr)
            continue
        ingredients.append({"item": m.group(2).strip(), "quantity": int(m.group(1))})
    return ingredients


def strip_location(name: str, locations: list[str]) -> str:
    """Remove a known location suffix from name. Tries longest match first."""
    for loc in locations:
        if name.endswith(loc):
            return name[: -len(loc)].rstrip()
    return name  # no known suffix found; return as-is


def main() -> None:
    raw = CSV_FILE.read_text(encoding="utf-8-sig").replace("\r", "")
    rows = list(csv.reader(io.StringIO(raw), delimiter="\t"))

    # Collect all unique location names from column 2; sort longest-first so
    # multi-word names (e.g. "Alchemy Lab") match before their substrings.
    all_locations: set[str] = set()
    for row in rows:
        if len(row) >= 2:
            for loc in row[1].split(","):
                all_locations.add(loc.strip())
    locations_sorted = sorted(all_locations, key=len, reverse=True)

    recipes: dict = {}
    skipped = 0

    for i, row in enumerate(rows, 1):
        if len(row) < 3 or not row[0].strip():
            skipped += 1
            continue

        raw_name = row[0].strip()
        raw_locs = [l.strip() for l in row[1].split(",") if l.strip()]
        raw_ings = row[2].strip()
        if raw_ings.lower() == "free":
            skipped += 1
            continue

        item_name = strip_location(raw_name, locations_sorted)
        if not item_name:
            print(f"  WARNING: row {i}: empty name after stripping — skipping", file=sys.stderr)
            skipped += 1
            continue

        if not raw_locs:
            print(f"  WARNING: row {i}: no location for {item_name!r}", file=sys.stderr)

        location = raw_locs[0] if len(raw_locs) == 1 else "Multiple"
        ingredients = parse_ingredients(raw_ings)

        if not ingredients:
            print(f"  WARNING: row {i}: no ingredients for {item_name!r}", file=sys.stderr)

        if item_name in recipes:
            existing_loc = recipes[item_name].get("location", "")
            if existing_loc != location:
                location = "Multiple"
            recipes[item_name]["location"] = location
            # merge ingredients (keep existing, add new)
            existing_items = {ing["item"] for ing in recipes[item_name]["ingredients"]}
            for ing in ingredients:
                if ing["item"] not in existing_items:
                    recipes[item_name]["ingredients"].append(ing)
        else:
            recipes[item_name] = {"location": location, "ingredients": ingredients}

    RECIPES_FILE.write_text(json.dumps(recipes, indent=2) + "\n")

    print(f"Wrote {len(recipes)} recipes to {RECIPES_FILE}  ({skipped} rows skipped)")
    print(f"Locations: {', '.join(sorted(all_locations))}")


if __name__ == "__main__":
    main()
