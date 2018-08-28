
let mysql = require('mysql');
let howlongtobeat = require("howlongtobeat");
let hltbService = new howlongtobeat.HowLongToBeatService();
let Bottleneck = require("bottleneck");
let limiter = new Bottleneck(10, 900, -1, Bottleneck.strategy.LEAK, false);

let connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'ocean'
});


let hltb_handler = function(result,name){
    let hltb_main=null;
    let hltb_complete=null;
    for(let i=0;i<result.length;i++){
        if(result[i].similarity>0.8){
            if(result[i].gameplayMain>0)
                hltb_main=result[i].gameplayMain;
            if(result[i].gameplayCompletionist>0)
                hltb_complete=result[i].gameplayCompletionist;
            if(result[i].imageUrl!=undefined && result[i].imageUrl!="")
                imageurl=result[i].imageUrl;
            connection.query("UPDATE game SET time_to_beat=?,time_to_complete=? WHERE title=?",[hltb_main,hltb_complete,name], function (err, results) {
                if (err) 
                    console.log(err);
                console.log("changed "+name);
            }) 
            connection.query("UPDATE game SET cover_wikipedia_link=? WHERE title=? and cover_wikipedia_link is null",[imageurl,name], function (err, results) {
                if (err) 
                    console.log(err);
                console.log("added image to "+name);
            }) 
        }
    }
    
}
let hltb_promise = function(name){
    return hltbService.search(name).then(result =>hltb_handler(result,name));
}
exports.getHLTBAll = function(req, res){
    connection.query("SELECT title FROM game", function (err, results) {
        if (err) 
            console.log(err);
        for(let i=0;i<results.length;i++){
            limiter.schedule(hltb_promise,results[i].title);
        }
     })
};


