from __future__ import annotations

import random
import sqlite3
from datetime import date, timedelta
from pathlib import Path


KREIS_VALUES = ("Kreis Nord", "Kreis Süd", "Kreis Ost", "Kreis West", "Kreis Mitte")
AMT_VALUES = (
    "Bauamt",
    "Sozialamt",
    "Ordnungsamt",
    "Schulamt",
    "Kämmerei",
    "Umweltamt",
)
HAUSHALTSTELLE_VALUES = ("11101", "21102", "31103", "42104", "51105", "61106")
KONTO_VALUES = ("427100", "441100", "521100", "543100", "681100", "783100")
EDIT_GROUP_VALUES = ("admin", "user", "wheel")
STATUS_VALUES = ("draft", "locked", "done")
ROW_COUNT = 300
RANDOM_SEED = 20261008


def build_rows() -> list[tuple[int, str, str, str, str, float, str, int, str, str]]:
    """Build stable values so regenerated demo data is easy to compare."""
    random_generator = random.Random(RANDOM_SEED)
    return [
        (
            index + 1,
            KREIS_VALUES[index % len(KREIS_VALUES)],
            AMT_VALUES[(index // len(KREIS_VALUES)) % len(AMT_VALUES)],
            HAUSHALTSTELLE_VALUES[(index // 3) % len(HAUSHALTSTELLE_VALUES)],
            KONTO_VALUES[(index * 7) % len(KONTO_VALUES)],
            round(1250.0 + ((index * 187.35) % 48750.0), 2),
            (date(2025, 1, 1) + timedelta(days=index)).isoformat(),
            index % 2,
            ",".join(
                sorted(
                    random_generator.sample(
                        EDIT_GROUP_VALUES,
                        k=random_generator.randint(1, len(EDIT_GROUP_VALUES)),
                    ),
                ),
            ),
            STATUS_VALUES[index % len(STATUS_VALUES)],
        )
        for index in range(ROW_COUNT)
    ]


def sql_literal(value: str | float | int) -> str:
    if isinstance(value, str):
        return "'" + value.replace("'", "''") + "'"
    if isinstance(value, int):
        return str(value)
    return f"{value:.2f}"


def build_sql(rows: list[tuple[int, str, str, str, str, float, str, int, str, str]]) -> str:
    values = ",\n".join(
        "    (" + ", ".join(sql_literal(value) for value in row) + ")" for row in rows
    )
    return "\n".join(
        (
            "-- Deterministic demo data for the example content package.",
            "-- The generated SQLite database is ../data/dummy.sqlite.",
            "",
            "DROP TABLE IF EXISTS dummy_table;",
            "",
            "CREATE TABLE dummy_table (",
            "    row_id INTEGER PRIMARY KEY,",
            "    kreis TEXT NOT NULL,",
            "    amt TEXT NOT NULL,",
            "    haushaltstelle TEXT NOT NULL,",
            "    konto TEXT NOT NULL,",
            "    betrag REAL NOT NULL CHECK (betrag >= 0),",
            "    datum TEXT NOT NULL,",
            "    is_active INTEGER NOT NULL CHECK (is_active IN (0, 1)),",
            "    can_edit_group TEXT NOT NULL,",
            "    status TEXT NOT NULL CHECK (status IN ('draft', 'locked', 'done'))",
            ");",
            "",
            "INSERT INTO dummy_table (row_id, kreis, amt, haushaltstelle, konto, betrag, datum, is_active, can_edit_group, status) VALUES",
            values + ";",
            "",
        )
    )


def generate_database() -> None:
    extension_directory = Path(__file__).resolve().parents[1]
    data_directory = extension_directory / "data"
    data_directory.mkdir(parents=True, exist_ok=True)

    rows = build_rows()
    sql_text = build_sql(rows)
    database_path = data_directory / "dummy.sqlite"
    if database_path.exists():
        database_path.unlink()
    with sqlite3.connect(database_path) as connection:
        connection.executescript(sql_text)
        connection.execute("PRAGMA user_version = 1")
        connection.commit()

    print(f"Generated {database_path} with {len(rows)} rows.")


if __name__ == "__main__":
    generate_database()
