let pool = require('../../db')
let howlongtobeat = require("howlongtobeat")
let hltbService = new howlongtobeat.HowLongToBeatService()
let Bottleneck = require("bottleneck")
let limiter = new Bottleneck(100, 900, null, Bottleneck.strategy.LEAK, false)
let imageUtils=require('../utilities/ImageUtils')
let fs = require('fs')
/*
Doing a console's download of images(SNES as example)
http://localhost:3001/image/download/4
http://localhost:3001/image/download/general/4 -- modern consoles only --
http://localhost:3001/image/thumbs/4 
http://localhost:3001/image/thumbs/general/4 -- modern consoles only --
*/



let hltb_handler = (result,name) => {
    let hltb_main=null
    let hltb_complete=null
    for(let i=0, arrsize=result.length; i<arrsize;i++){
        if(result[i].similarity>0.8){
            if(result[i].gameplayMain>0)
                hltb_main=result[i].gameplayMain
            if(result[i].gameplayCompletionist>0)
                hltb_complete=result[i].gameplayCompletionist
            if(hltb_complete==null && hltb_main==null)
                continue
            if(result[i].imageUrl!=undefined && result[i].imageUrl!="")
                imageurl=result[i].imageUrl
            pool.query("UPDATE game SET time_to_beat=?,time_to_complete=? WHERE title=?",[hltb_main,hltb_complete,name],  (err, results) => {
                if (err) 
                    console.log(err)
                console.log("changed "+name)
            
            }) 
        }
    }
    
}

let hltb_promise = (name) => {
    return hltbService.search(name).then(result =>hltb_handler(result,name))
}

exports.getHLTBAll = (req, res) => {
    pool.query("SELECT title FROM game WHERE time_to_beat is null and cover_uri like \'%snes%\'", (err, results) => {
        if (err) 
            console.log(err)
        for(let i=0, arrsize=results.length; i<arrsize;i++){
            limiter.schedule(hltb_promise,results[i].title)
        }
     })
}


exports.createThumbsFromImages = async (req,res) => {
    let plat = determinePlatformFromParam(req.params.platformID)
    if(plat===-1){
        return res.status(500).send('Invalid platformID')
    }
    let consolepath=process.env.PUBLIC_DIR+'/images/'+plat+'/'
    pool.query('SELECT thumb_dim FROM platform WHERE id=?',[req.params.platformID], async (err,results) => {
        if(err)
            return res.status(500).send('Error connecting to database.');
        let dims = results[0].thumb_dim.split('x')
        let width = parseInt(dims[0])
        let height = parseInt(dims[1])
        await imageUtils.thumbAllSubdirectories(consolepath,width,height)
        return res.status(200).send('success')
    })
}

exports.createThumbsFromImagesGeneral = async (req,res) => {
    let path=process.env.PUBLIC_DIR+'/images/general/'
    pool.query('SELECT thumb_dim FROM platform WHERE id=?',[req.params.platformID], async (err,results) => {
        if(err)
            return res.status(500).send('Error connecting to database.');
        let dims = results[0].thumb_dim.split('x')
        let width = parseInt(dims[0])
        let height = parseInt(dims[1])
        await imageUtils.thumbAllSubdirectories(path,width,height)
        return res.status(200).send('success')
    })
}

exports.reThumbImageFromGameID = async(req,res) => {
    try{
        let plat = determinePlatformFromParam(req.params.platformID)
        let gameID = req.params.gameID
        if(plat===-1){
            return res.status(500).send('Invalid platformID')
        }
        let path=process.env.PUBLIC_DIR+'/images/'+plat+'/'+gameID+'/'
        await imageUtils.thumbImage(path,req.params.width,req.params.height)
        return res.status(200).send('success')
    }   
    catch(err){
        return res.status(500).send(err)
    }
}
    


exports.redownloadImageFromGameID = async(req,res) => {
    let plat = determinePlatformFromParam(req.params.platformID)
    let gameID = req.params.gameID
    pool.query("SELECT game.id,game.title,game.cover_wikipedia_link,gameplatform.cover_platform_link FROM `gameplatform` LEFT JOIN game on gameplatform.gameID=game.id WHERE platformID=? AND game.id=?",[req.params.platformID,gameID], async (err, results) => {
        if (err) 
            return res.status(500).send('Error connecting to database.');
        try {
            if(results.length>0){
                let directory = process.env.PUBLIC_DIR+'/images/'+plat+'/'+gameID+'/'
                if (fs.existsSync(directory))
                    await imageUtils.deleteFilesFromDir(directory)
                    
                await imageUtils.downloadPlatformImageFromGame(results[0],directory,true,req.params.platformID,plat)
                await imageUtils.thumbImage(directory,55,80)
                return res.status(200).send('success')
            }
            else return res.status(204).send('No results')
        }
        catch(error){
            return res.status(500).send(error)
        }
     })
    
}

exports.downloadAllImagesPlatform = (req,res) => {

    let plat = determinePlatformFromParam(req.params.platformID)
    if(plat===-1){
        return res.status(500).send('Invalid platformID');
    }
    pool.query("SELECT game.id,game.title,game.cover_wikipedia_link,gameplatform.cover_platform_link FROM `gameplatform` LEFT JOIN game on gameplatform.gameID=game.id WHERE platformID=? AND cover_platform_link is not null AND cover_platform_uri is null ORDER BY game.id",[req.params.platformID], (err, results) => {
        if (err) 
            return res.status(500).send('Error connecting to database.');
        for(let i=0, arrsize=results.length; i<arrsize;i++){
            let directory = process.env.PUBLIC_DIR+'/images/'+plat+'/'+results[i].id+'/'
            limiter.schedule(imageUtils.downloadPlatformImageFromGame,results[i],directory,true,req.params.platformID,plat)
        }
     })

     return res.status(200).send("Download successful")
}

exports.downloadAllImagesGeneral = (req,res) => {
    pool.query("SELECT game.id,game.title,game.cover_wikipedia_link,gameplatform.cover_platform_link FROM `gameplatform` LEFT JOIN game on gameplatform.gameID=game.id WHERE platformID=? AND cover_platform_link is not null AND cover_uri is null AND cover_platform_uri is not null AND cover_wikipedia_link!=cover_platform_link ORDER BY game.id",[req.params.platformID], (err, results) => {
        if (err) 
            return res.status(500).send('Error connecting to database.');
        for(let i=0, arrsize=results.length; i<arrsize;i++){
            let directory = process.env.PUBLIC_DIR+'/images/general/'+results[i].id+'/'
            limiter.schedule(imageUtils.downloadGeneralImageFromGame,results[i],directory,true)
        }
     })
     return res.status(200).send("Download successful")
}

determinePlatformFromParam = platID => {
    switch(platID){
        case "1":
            return "nes"
        case "2":
            return "genmd"
        case "3":
            return "sms"
        case "4":
            return "snes"
        case "5":
            return "gb"
        default:
            return -1
    }
}
