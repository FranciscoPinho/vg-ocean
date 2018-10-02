let pool = require('../../db')


exports.getGameFromPlatform = (req,res) => {
    pool.getConnection((err,connection)=>{
        if (err) 
            return res.status(500).json({"error":"Connection to database failed, try again"})
        pool.query("SELECT gameplatform.id,title,cover_platform_uri FROM `game` LEFT JOIN gameplatform on gameID=game.id WHERE platformID=? ORDER BY game.title LIMIT ?,30",[req.params.platformID,parseInt(req.params.offset)],(err, results) => {
            if (err) {
                connection.release()
                console.log(err)
                return res.status(500).json({"error":"Connection to database failed, try again"})
            }
            let main_results=results
            connection.query("SELECT COUNT(*) as count from gameplatform WHERE platformID=?;",req.params.platformID,(err,results)=>{
                if (err) {
                    connection.release()
                    return res.status(500).json({"error":"Connection to database failed, try again"})
                }
                connection.release()
                return res.status(200).json({"games":main_results,"count":results[0].count})
            })
            
        })  
    })
    
}

//second order by needs to be replaced by number of people who have game in their list
exports.getGameFromPlatformWithSearchQuery = (req,res) => {
    pool.getConnection((err,connection)=>{
        if (err)
            return res.status(500).json({"error":"Connection to database failed, try again"})
        connection.query(`SELECT SQL_CALC_FOUND_ROWS gameplatform.id as id,title,cover_platform_uri,
        (SELECT platform.short FROM platform WHERE gameplatform.platformID=platform.id) as platform,
        MATCH(title) AGAINST (? IN NATURAL LANGUAGE MODE) as relevance,
        MATCH(title,alt_title,alt_title2) AGAINST (? IN NATURAL LANGUAGE MODE) as sec_relevance
        FROM game
        LEFT JOIN gameplatform ON game.id=gameplatform.gameID
        WHERE MATCH(title,alt_title,alt_title2) AGAINST (? IN NATURAL LANGUAGE MODE) AND platformID=?
        ORDER BY relevance DESC, sec_relevance DESC
        LIMIT ?,30`,[req.params.searchQuery,req.params.searchQuery,req.params.searchQuery,req.params.platformID,parseInt(req.params.offset)],(err, results) => {
            if (err) {
                connection.release()
                return res.status(500).json({"error":"Connection to database failed, try again"})
            }
            let main_results=results
            connection.query("SELECT FOUND_ROWS() as count;",(err,results)=>{
                if (err) {
                    connection.release()
                    return res.status(500).json({"error":"Connection to database failed, try again"})
                }
                connection.release()
                return res.status(200).json({"games":main_results,"count":results[0].count})
            })
        })
    })
}

//second order by needs to be replaced by number of people who have game in their list
exports.getGameFromSearchQuery = (req,res) => {
    pool.getConnection((err,connection)=>{
        if (err)
            return res.status(500).json({"error":"Connection to database failed, try again"})
        connection.query(`SELECT SQL_CALC_FOUND_ROWS gameplatform.id as id,title,cover_platform_uri,
        (SELECT platform.short FROM platform WHERE gameplatform.platformID=platform.id) as platform,
        MATCH(title) AGAINST (? IN NATURAL LANGUAGE MODE) as relevance,
        MATCH(title,alt_title,alt_title2) AGAINST (? IN NATURAL LANGUAGE MODE) as sec_relevance
        FROM game
        LEFT JOIN gameplatform ON game.id=gameplatform.gameID
        WHERE MATCH(title,alt_title,alt_title2) AGAINST (? IN NATURAL LANGUAGE MODE) 
        ORDER BY relevance DESC, sec_relevance DESC
        LIMIT ?,30`,[req.params.searchQuery,req.params.searchQuery,req.params.searchQuery,parseInt(req.params.offset)],(err, results) => {
            if (err) {
                connection.release()
                return res.status(500).json({"error":"Connection to database failed, try again"})
            }
            let main_results=results
            connection.query("SELECT FOUND_ROWS() as count;",(err,results)=>{
                if (err) {
                    connection.release()
                    return res.status(500).json({"error":"Connection to database failed, try again"})
                }
                connection.release()
                return res.status(200).json({"games":main_results,"count":results[0].count})
            })
        })
    })
}