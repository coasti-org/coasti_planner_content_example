from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass, field
from typing import Callable, Generic, TypeVar

from cp_example_extension.sql.tables.dummy_table import can_edit


ColumnType = TypeVar("ColumnType", covariant=True)


@dataclass(frozen=True)
class ColumnStyle:
    width: int = 160


@dataclass(frozen=True)
class Column(Generic[ColumnType]):
    id: str
    name: str
    description: str
    validator: Callable | None = None
    editable: bool = False
    style: ColumnStyle = field(default_factory=ColumnStyle)


@dataclass(frozen=True)
class Table:
    id: str
    name: str
    columns: Sequence[Column[object]]
    description: str | None = None
    can_edit: Callable | None = None
    sql_path: str | None = None
