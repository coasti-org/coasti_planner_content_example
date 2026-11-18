"""Roles declared by the example content extension."""

from coasti_planner.extensions.models import Role

bearbeiter = Role(
    id="bearbeiter",
    name="Bearbeiter",
    description="May edit draft records assigned to an allowed role.",
)

politiker = Role(
    id="politiker",
    name="Politiker",
    description="May edit draft records assigned to an allowed role.",
)

controller = Role(
    id="controller",
    name="Controller",
    description="May edit draft records assigned to an allowed role.",
)
