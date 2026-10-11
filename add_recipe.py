#!/usr/bin/env python3
"""Add or update a recipe in src/data/recipes.json.

Usage:
  ./add_recipe.py "Assembly Bench" --location Factory --ing "Plank:4" --ing "Gear:2"
  ./add_recipe.py "Plank"          --ing "Wood Log:2"          # no location = intermediate
"""

import argparse
import json
import sys
from pathlib import Path

RECIPES_FILE = Path(__file__).parent / "src" / "data" / "recipes.json"


def parse_ingredient(raw: str) -> dict:
    parts = raw.rsplit(":", 1)
    if len(parts) != 2:
        sys.exit(f"Bad ingredient format {raw!r} — expected 'Item Name:quantity'")
    name, qty_str = parts[0].strip(), parts[1].strip()
    if not name:
        sys.exit(f"Empty item name in ingredient {raw!r}")
    try:
        qty = int(qty_str)
        if qty <= 0:
            raise ValueError
    except ValueError:
        sys.exit(f"Quantity must be a positive integer, got {qty_str!r}")
    return {"item": name, "quantity": qty}


def main() -> None:
    parser = argparse.ArgumentParser(description="Add or update a GYK2 recipe.")
    parser.add_argument("name", help="Item name (e.g. 'Assembly Bench')")
    parser.add_argument("--location", "-l", help="Zone where this is built (e.g. Factory, Church). Omit for intermediates.")
    parser.add_argument("--ing", "-i", metavar="ITEM:QTY", action="append", required=True,
                        help="Ingredient in 'Item Name:quantity' format. Repeat for multiple.")
    args = parser.parse_args()

    recipes: dict = json.loads(RECIPES_FILE.read_text())

    ingredients = [parse_ingredient(i) for i in args.ing]
    recipe: dict = {"location": args.location, "ingredients": ingredients} if args.location \
        else {"ingredients": ingredients}

    action = "Updated" if args.name in recipes else "Added"
    recipes[args.name] = recipe

    # Sort keys: located items first (by location then name), then intermediates by name
    def sort_key(item: tuple) -> tuple:
        name, rec = item
        loc = rec.get("location", "")
        return (0 if loc else 1, loc, name)

    recipes = dict(sorted(recipes.items(), key=sort_key))
    RECIPES_FILE.write_text(json.dumps(recipes, indent=2) + "\n")
    print(f"{action} '{args.name}'" + (f" [{args.location}]" if args.location else " [intermediate]"))


if __name__ == "__main__":
    main()
