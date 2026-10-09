from __future__ import annotations

import inspect
import sqlite3
from abc import ABC, abstractmethod
from collections.abc import Sequence
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class ActionContext:
    connection: sqlite3.Connection
    user: str


class Action(ABC):
    id: str

    def __init__(self, id: str | None = None) -> None:
        self.id = id or Path(inspect.getfile(type(self))).stem

    @abstractmethod
    def run(self, context: ActionContext) -> None:
        """Run this action using the shared action context."""


class SqlAction(Action):
    def __init__(self, sql_file: str, id: str | None = None) -> None:
        super().__init__(id=id)
        self.sql_file = sql_file

    def run(self, context: ActionContext) -> None:
        sql_path = Path(__file__).with_name(self.sql_file)
        context.connection.executescript(sql_path.read_text(encoding="utf-8"))
        context.connection.commit()


class NotificationAction(Action):
    def __init__(self, message: str, id: str | None = None) -> None:
        super().__init__(id=id)
        self.message = message

    def run(self, context: ActionContext) -> None:
        print(f"Notification for: {self.message}")


class ActionSequence(Action):
    actions: Sequence[Action] = ()

    def __init__(
        self, actions: Sequence[Action] | None = None, id: str | None = None
    ) -> None:
        super().__init__(id=id)
        if actions is not None:
            self.actions = actions

    def run(self, context: ActionContext) -> None:
        for action in self.actions:
            action.run(context)
