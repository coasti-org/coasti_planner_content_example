from __future__ import annotations

from datetime import date

from table_base import Column, ColumnStyle, Table


"""
Alternative to the yml based meta data

Benefits:
- type checking
- can_edit directly function implemented directly here
- could even link sql source directly here
    (enables arbitrary naming)
- easy to add functional properties
- validation is easier than for yaml.
"""

def can_edit(table: Table):
    pass

dummy_table = Table(
    id="dummy_table",
    name="My Awesome Filter",
    description="My Awesome Filter Description",
    can_edit = can_edit,
    sql_path = "./dummy_table.sql",
    columns=[
        Column[int](
            id="row_id",
            name="Row ID",
            description="Stabile ID des Datensatzes",
        ),
        Column[str](
            id="kreis",
            name="Kreis",
            description="Kreis, dem die Buchung zugeordnet ist",
        ),
        Column[str](
            id="amt",
            name="Amt",
            description="Zuständiges Amt",
        ),
        Column[str](
            id="haushaltstelle",
            name="Haushaltstelle",
            description="Haushaltsstelle der Buchung",
        ),
        Column[str](
            id="konto",
            name="Konto",
            description="Sachkonto der Buchung",
            style=ColumnStyle(width=120),
        ),
        Column[float](
            id="betrag",
            name="Betrag",
            description="Betrag der Buchung in Euro",
            style=ColumnStyle(width=120),
            editable=True,
            validator=lambda x: float(round(x, 2)),
        ),
        Column[date](
            id="datum",
            name="Datum",
            description="Datum der Buchung im ISO-Format",
            style=ColumnStyle(width=120),
        ),
        Column[bool](
            id="is_active",
            name="On?",
            description="Gibt an, ob der Datensatz aktiv ist",
            style=ColumnStyle(width=60),
        ),
        Column[str](
            id="can_edit_group",
            name="Bearbeitungsgruppen",
            description=(
                "Kommagetrennte Liste der Gruppen, die den Datensatz bearbeiten dürfen"
            ),
        ),
        Column[str](
            id="status",
            name="Status",
            description="Status des Datensatzes: draft, locked oder done",
        ),
    ],
)
