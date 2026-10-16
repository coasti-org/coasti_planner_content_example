UPDATE dummy_table
SET status = CASE ABS(RANDOM()) % 3
	WHEN 0 THEN 'draft'
	WHEN 1 THEN 'locked'
	ELSE 'done'
END
WHERE row_id = 1;


