SELECT
    COUNT(*) > 0 AS has_draft_rows
FROM dummy_table
WHERE status = 'draft';
