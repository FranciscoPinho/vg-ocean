-- find games without desc
SELECT id,title FROM `game` WHERE description is NULL
-- find games without genres
SELECT * FROM `game` WHERE NOT EXISTS (SELECT * from gamegenre WHERE gamegenre.gameID=game.id)
-- find games without genres and cover art
SELECT * FROM `game` WHERE NOT EXISTS (SELECT * from gamegenre WHERE gamegenre.gameID=game.id) AND cover_wikipedia_link is null
-- find games without genres but with cover art
SELECT * FROM `game` WHERE NOT EXISTS (SELECT * from gamegenre WHERE gamegenre.gameID=game.id) AND cover_wikipedia_link is not null

-- game info with credits
SET @gameid=64;
SELECT game.id,title,
(SELECT JSON_ARRAYAGG(genre.name) FROM genre LEFT JOIN gamegenre on genre.id=gamegenre.genreID WHERE gameID=@gameid) as 'genres',
(SELECT JSON_ARRAYAGG(publisher.name) FROM publisher LEFT JOIN gamepublisher on publisher.id=gamepublisher.publisherID WHERE gameID=@gameid) as 'publishers',
(SELECT JSON_ARRAYAGG(developer.name) FROM developer LEFT JOIN gamedeveloper on developer.id=gamedeveloper.devID WHERE gameID=@gameid) as 'developers',
(SELECT JSON_OBJECTAGG(credits.role,artist.name) FROM artist LEFT JOIN credits on artist.id=credits.artistID WHERE gameID=@gameid) as 'credits'
FROM game
WHERE game.id=@gameid
GROUP BY game.id

-- list all games with info
SELECT game.id,title,
(SELECT JSON_ARRAYAGG(genre.name) FROM genre LEFT JOIN gamegenre on genre.id=gamegenre.genreID WHERE gameID=game.id) as 'genres',
(SELECT JSON_ARRAYAGG(publisher.name) FROM publisher LEFT JOIN gamepublisher on publisher.id=gamepublisher.publisherID WHERE gameID=game.id) as 'publishers',
(SELECT JSON_ARRAYAGG(developer.name) FROM developer LEFT JOIN gamedeveloper on developer.id=gamedeveloper.devID WHERE gameID=game.id) as 'developers',
(SELECT JSON_OBJECTAGG(credits.role,artist.name) FROM artist LEFT JOIN credits on artist.id=credits.artistID WHERE gameID=game.id) as 'credits'
FROM game
GROUP BY game.id

-- select games with list of some useless genres
SET @toDeleteIDs='288';
SELECT game.id,title,
(SELECT JSON_OBJECTAGG(genre.id,genre.name) FROM genre LEFT JOIN gamegenre on genre.id=gamegenre.genreID WHERE gameID=game.id) as 'genres'
FROM game  
LEFT JOIN gamegenre on game.id=gamegenre.gameID 
WHERE FIND_IN_SET(gamegenre.genreID, @toDeleteIDs) > 0
LIMIT 100

-- merge genres and delete useless ones
SET @primaryGenreID=1;
SET @toDeleteIDs='41,30,575,44,169';
UPDATE gamegenre SET genreID=@primaryGenreID
WHERE FIND_IN_SET(genreID, @toDeleteIDs) > 0;
DELETE from genre WHERE FIND_IN_SET(id, @toDeleteIDs) > 0

