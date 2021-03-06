let download = require("image-downloader")
let fs = require('fs')
let mysql = require('mysql')
let sharp = require('sharp')
let connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'ocean'
  });
//@TODO WHEN COVER PLATFORM LINK!= COVER LINK save to a general folder the cover link version and to the console path the other
exports.downloadPlatformImageFromGame = async (game,path,awaitDownload,platformID,plat) => {
        console.log(game)
        let filename=path+'cover.'+game.cover_platform_link.split('.').pop()
        let cover_uri='/images/'+plat+'/'+game.id+'/cover.'+game.cover_platform_link.split('.').pop()
        if (!fs.existsSync(path))
            fs.mkdirSync(path)

        let options = {
            url: game.cover_platform_link,
            dest: filename
        }
        let res=-1
        if(awaitDownload)
            res = await executeDownload(options,awaitDownload)
        else res = executeDownload(options,awaitDownload)
        if(res==0)
            connection.query("UPDATE game SET cover_uri=? WHERE cover_uri is null or cover_uri='' and game.id=?",[cover_uri,game.id])
            connection.query("UPDATE gameplatform SET cover_platform_uri=? WHERE gameID=? AND platformID=?",[cover_uri,game.id,platformID])
            //code might never be relevant
            //if(game.cover_platform_link===game.cover_wikipedia_link)
            //    connection.query("UPDATE game SET cover_uri=? WHERE game.id=?",[cover_uri,game.id])
           
}

exports.downloadGeneralImageFromGame = async (game,path,awaitDownload) => {
    console.log(game)
    let filename=path+'cover.'+game.cover_wikipedia_link.split('.').pop()
    let cover_uri='/images/general/'+game.id+'/cover.'+game.cover_wikipedia_link.split('.').pop()
    if (!fs.existsSync(path))
        fs.mkdirSync(path)

    let options = {
        url: game.cover_wikipedia_link,
        dest: filename
    }
    let res=-1
    if(awaitDownload)
        res = await executeDownload(options,awaitDownload)
    else res = executeDownload(options,awaitDownload)
    if(res==0)
        connection.query("UPDATE game SET cover_uri=? WHERE game.id=?",[cover_uri,game.id])
}

exports.thumbAllSubdirectories = async(consolepath,width,height) => {
    fs.readdir(consolepath, (err, files) => {
        files.forEach(gamefolder => {
            let fullpath=consolepath+gamefolder+'/'
            fs.readdir(fullpath,(err,files2)=>{
                files2.forEach(file=>{               
                    let filename=fullpath+file
                    sharp(filename)
                    .resize(width,height)
                    .toFile(fullpath+'cover_thumb.'+file.split('.').pop(),(err,info)=>{
                        if(err){
                            console.error(err)
                        }
                        console.log(info)
                    }) 
                })
            })
        });
    })
}


exports.thumbImage = async(path,width,height) => {
    fs.readdir(path,(err,files)=>{
        files.forEach(file=>{               
            let filename=path+file
            sharp(filename)
            .resize(width,height)
            .toFile(path+'cover_thumb.'+file.split('.').pop(),(err,info)=>{
                if(err)
                    console.error(err)
                else console.log(info)
            }) 
        })
    })
}

executeDownload= async (options,awaitDownload) => {
    try {
        if(awaitDownload)
           await download.image(options)
        else download.image(options)
        return 0
    } catch (e) {
        console.error(e)
        return -1
    }
}

exports.deleteFilesFromDir = async(directory) => {
    fs.readdir(directory, (err, files) => {
        if (err) throw err;
        for (const file of files) {
          fs.unlink(directory+file, err => {
            if (err) throw err;
          });
        }
      });
}

