from __future__ import annotations

from pathlib import Path
from typing import TYPE_CHECKING

from coasti_planner.extensions.models import Column, ColumnStyle, Table, TableDtype

if TYPE_CHECKING:
    from collections.abc import Mapping


def can_edit(
    row_id: int,
    user_group: str,
    column_name: str,
    row: Mapping[str, object],
) -> bool:
    """Return whether a user may edit one cell in a dummy-table row."""
    if row.get("row_id") != row_id:
        return False
    return (
        user_group == "admin"
        and column_name in {"betrag", "is_active"}
        and row.get("status") == "draft"
    )


dummy_table = Table(
    id="dummy_table",
    name="My Awesome Filter",
    description="My Awesome Filter Description",
    sql_path=Path("./dummy_table.sql"),
    columns=[
        Column(
            id="row_id",
            name="Row ID",
            data_type=TableDtype.INTEGER,
            description="Stabile ID des Datensatzes",
        ),
        Column(
            id="kreis",
            name="Kreis",
            data_type=TableDtype.STRING,
            description="Kreis, dem die Buchung zugeordnet ist",
        ),
        Column(
            id="amt",
            name="Amt",
            data_type=TableDtype.STRING,
            description="Zuständiges Amt",
        ),
        Column(
            id="haushaltstelle",
            name="Haushaltstelle",
            data_type=TableDtype.STRING,
            description="Haushaltsstelle der Buchung",
        ),
        Column(
            id="konto",
            name="Konto",
            data_type=TableDtype.STRING,
            description="Sachkonto der Buchung",
            style=ColumnStyle(width=120),
        ),
        Column(
            id="betrag",
            name="Betrag",
            data_type=TableDtype.FLOAT,
            description="Betrag der Buchung in Euro",
            style=ColumnStyle(width=120),
        ),
        Column(
            id="datum",
            name="Datum",
            data_type=TableDtype.DATE,
            description="Datum der Buchung im ISO-Format",
            style=ColumnStyle(width=120),
        ),
        Column(
            id="is_active",
            name="On?",
            data_type=TableDtype.BOOLEAN,
            description="Gibt an, ob der Datensatz aktiv ist",
            style=ColumnStyle(width=60),
        ),
        Column(
            id="can_edit_group",
            name="Bearbeitungsgruppen",
            data_type=TableDtype.STRING,
            description=(
                "Kommagetrennte Liste der Gruppen, die den Datensatz bearbeiten dürfen"
            ),
        ),
        Column(
            id="status",
            name="Status",
            data_type=TableDtype.STRING,
            description="Status des Datensatzes: draft, locked oder done",
        ),
    ],
)
