"""Excel import and export of the dummy table.

Each rule list shows one step of the import: checks on the raw sheet, value
conversion while loading, checks on the loaded values, and the database types
used when writing.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from coasti_planner.extensions.models.excel import (
    ExcelImport,
    ExcelImportTemplate,
    LoadingRule,
    LoadMode,
    ValidationRule,
    WriteRule,
)

from .dummy_table import dummy_table

if TYPE_CHECKING:
    from coasti_planner.extensions.models import User

# Roles of this extension's development users (see README); the framework's
# own `admin` role is not visible to extensions.
IMPORT_ROLES = {"bearbeiter", "controller"}
EXPORT_ROLES = {"controller"}


def can_import(*, user: User) -> bool:
    """Editors may upload files and download the empty template."""
    return not IMPORT_ROLES.isdisjoint(user.roles)


def can_export(*, user: User) -> bool:
    """Only controllers may download the data.

    The export contains every row and column, so it is only granted to a role
    that may see all of them.
    """
    return not EXPORT_ROLES.isdisjoint(user.roles)


dummy_table_excel = ExcelImport(
    id="dummy_table_excel",
    name="Buchungen (Excel)",
    description=(
        "Buchungen als Excel-Datei bearbeiten: exportieren, ändern und wieder "
        "importieren. Abgeschlossene Buchungen (Status done) bleiben gesperrt."
    ),
    template=ExcelImportTemplate(
        table=dummy_table,
        sheet="Daten",
        mode=LoadMode.UPSERT,
        rules_pre_load_validation=[
            ValidationRule(column="row_id", required=True),
        ],
        rules_loading=[
            # Excel turns account numbers into numbers and drops leading zeros.
            LoadingRule(column="konto", pad=6),
            LoadingRule(column="betrag", decimal_sep=","),
        ],
        rules_post_load_validation=[
            ValidationRule(column="betrag", min=0),
            ValidationRule(column="status", allowed=["draft", "locked", "done"]),
        ],
        rules_write_to_db=[
            WriteRule(column="betrag", type="decimal(12,2)"),
        ],
    ),
    modes=[LoadMode.UPSERT, LoadMode.REPLACE],
    can_import=can_import,
    can_export=can_export,
)
