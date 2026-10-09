-- The data source ID is the filename without the .sql suffix.
WITH editable AS (
    SELECT
        CASE
            WHEN dummy_table.status = 'draft'
                AND instr(',' || dummy_table.can_edit_group || ',', ',admin,') > 0
            THEN 1
            ELSE 0
        END AS can_edit
    FROM dummy_table
)
SELECT
    *
FROM editable

{# Note: order has to be the same as in dumm_sql #}
ORDER BY kreis, amt, haushaltstelle, konto;
