from __future__ import annotations

from pathlib import Path
from typing import TYPE_CHECKING

from coasti_planner.extensions.models import (
    CellAccess,
    Column,
    ColumnDType,
    ColumnStyle,
    Table,
)

if TYPE_CHECKING:
    from coasti_planner.extensions.models import User


def can_access(
    *,
    user: User,
    column: str,
    row: dict[str, object],
) -> CellAccess:
    """
    Return whether a user can read and/or write one cell in a table.

    # Arguments
    - ``rows`` contains the data of the row (mapping column names to values)
      and can be used to decide access based on the row's content.
    - ``column`` is the name of the column for which access is requested.
    - ``user`` contains details of the user requesting access, including their groups
      and rules.

    # Returns
    - ``CellAccess`` a tuple of two booleans (read, write)
    """

    can_read = True
    can_write = (
        "admin" in user.groups
        and column in {"betrag", "is_active"}
        and row.get("status") == "draft"
    )

    return CellAccess(can_read, can_write)


dummy_table = Table(
    id="dummy_table",
    name="My Awesome Filter",
    description="My Awesome Filter Description",
    sql_path=Path("./dummy_table.sql"),
    can_access=can_access,
    columns=[
        Column(
            id="row_id",
            name="Row ID",
            data_type=ColumnDType.INTEGER,
            description="Stabile ID des Datensatzes",
        ),
        Column(
            id="kreis",
            name="Kreis",
            data_type=ColumnDType.STRING,
            description="Kreis, dem die Buchung zugeordnet ist",
        ),
        Column(
            id="amt",
            name="Amt",
            data_type=ColumnDType.STRING,
            description="Zuständiges Amt",
        ),
        Column(
            id="haushaltstelle",
            name="Haushaltstelle",
            data_type=ColumnDType.STRING,
            description="Haushaltsstelle der Buchung",
        ),
        Column(
            id="konto",
            name="Konto",
            data_type=ColumnDType.STRING,
            description="Sachkonto der Buchung",
            style=ColumnStyle(width=120),
        ),
        Column(
            id="betrag",
            name="Betrag",
            data_type=ColumnDType.FLOAT,
            description="Betrag der Buchung in Euro",
            style=ColumnStyle(width=120),
        ),
        Column(
            id="datum",
            name="Datum",
            data_type=ColumnDType.DATE,
            description="Datum der Buchung im ISO-Format",
            style=ColumnStyle(width=120),
        ),
        Column(
            id="is_active",
            name="On?",
            data_type=ColumnDType.BOOLEAN,
            description="Gibt an, ob der Datensatz aktiv ist",
            style=ColumnStyle(width=60),
        ),
        Column(
            id="can_edit_group",
            name="Bearbeitungsgruppen",
            data_type=ColumnDType.STRING,
            description=(
                "Kommagetrennte Liste der Gruppen, die den Datensatz bearbeiten dürfen"
            ),
        ),
        Column(
            id="status",
            name="Status",
            data_type=ColumnDType.STRING,
            description="Status des Datensatzes: draft, locked oder done",
        ),
    ],
)
