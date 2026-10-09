from __future__ import annotations

from collections.abc import Mapping
from typing import Any, Iterable


def can_edit(
    row_id: int,
    user_group: str,
    column_name: str,
    row: Mapping[str, object],
) -> bool:
    """Return whether a user may edit one cell of a dummy-table row."""
    if row.get("row_id") != row_id:
        return False
    return (
        user_group == "admin"
        and column_name in {"betrag", "is_active"}
        and row.get("status") == "draft"
    )



def can_edit_matrix(
    row_ids: Iterable[int],
    column_names: Iterable[str],
    user_group: str,
    database: Any
):
    """Retruns a (bool) mask of dimension m x n.

    m is len(rows)
    n is len(column_names)

    here you can query the database for more efficient logic.
    """
    pass
