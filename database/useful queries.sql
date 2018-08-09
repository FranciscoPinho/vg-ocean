-- find games without genres
SELECT id,title FROM `game` WHERE NOT EXISTS(SELECT * FROM gamegenre WHERE gamegenre.gameID=id)
-- find games without desc
SELECT id,title FROM `game` WHERE description is NULL