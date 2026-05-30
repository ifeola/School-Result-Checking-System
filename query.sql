create VIEW current_students AS
SELECT * from students where 
deleted_at is NULL;