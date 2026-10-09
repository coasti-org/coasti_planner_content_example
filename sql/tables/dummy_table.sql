-- The data source ID is the filename without the .sql suffix.
SELECT
    row_id,
    kreis,
    amt,
    haushaltstelle,
    konto,
    betrag,
    datum,
    is_active,
    can_edit_group,
    status
FROM dummy_table

-- how and where to do filtering?
-- here via jinja:

-- where
--     1 = 1
-- for f_col, f_vals in filter
--     and f_col in (*f_vals)
-- end for

ORDER BY kreis, amt, haushaltstelle, konto;

