import pandas as pd
import re
import db_utils
import scrape_utils
from fuzzywuzzy import fuzz

#HOW TO GET PAGEID OF A GAME
#https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&utf8=1&srsearch=SEARCHQUERY
#HOW TO ACCESS GAME PAGE
#https://en.wikipedia.org/?curid=PAGEID
def scrapeNesGames():
    """Scrapes NES games info from wikipedia lists"""
    url = r'https://en.wikipedia.org/wiki/List_of_Nintendo_Entertainment_System_games'
    tables = pd.read_html(url) # Returns list of all tables on page
    games = tables[0]
    titles = games[games.columns[0]].tolist()
    dateUS = games[games.columns[1]].tolist()
    dateEU = games[games.columns[2]].tolist()
    publishers = games[games.columns[3]].tolist()
    developers = games[games.columns[4]].tolist()   
    for count in range(2,len(titles)):
        if(titles[count]==''):
            return
        cleanTitle=re.sub('\(.*\)','',titles[count])
        cleanTitle=cleanTitle.replace(u'\xa0', '')
        gameDetails = []
        gameDetails.append(1)
        newGameID=db_utils.insertGame(cleanTitle.strip())
        if(type(newGameID) is list):
            gameDetails.append(newGameID[0])
        else:
            gameDetails.append(newGameID)
        if(type(dateUS[count]) is float):
            gameDetails.append("Unreleased")
        else:
            gameDetails.append(dateUS[count])
        if(type(dateEU[count]) is float):
            gameDetails.append("Unreleased")
        else:
            gameDetails.append(dateEU[count])
        gameDetails.append("")
        gameDetails.append("")
        db_utils.insertGamePlatform(gameDetails)

        if(type(publishers[count]) is not float):
            cleanPublishers = re.sub('\[.{0,3}\]','',publishers[count])
            publishersSplit = re.split('\(.{0,7}\)',cleanPublishers)
            pubIDs = db_utils.insertPublishers(publishersSplit)
            db_utils.insertGamePublishers(gameDetails[1],pubIDs)
        if(type(developers[count]) is not float and developers[count]!='???'):
            devIDs = db_utils.insertDevelopers(developers[count].split(';'))            
            db_utils.insertGameDevelopers(gameDetails[1],devIDs)

        infobox = scrape_utils.wikipediaInfoboxScraping(cleanTitle)
        if(infobox is not None):
            db_utils.saveInfoboxData(infobox,gameDetails[1])
        if('boxart' in infobox):
            gamefaqsScraping(cleanTitle,gameDetails[1],False)
        else:
            gamefaqsScraping(cleanTitle,gameDetails[1],True)

def scrapeFamicomGames():
    url = r'https://en.wikipedia.org/wiki/List_of_Family_Computer_games'
    tables = pd.read_html(url) # Returns list of all tables on page
    games = tables[0]
    jtitles = games[games.columns[0]].tolist()
    titles = games[games.columns[1]].tolist()
    dateJP = games[games.columns[2]].tolist()
    publishers = games[games.columns[3]].tolist()
    for count in range(1,len(jtitles)):
        if(jtitles[count]<"Perfect Bowling"):
            continue
        if(jtitles[count]==''):
            return
        if(jtitles[count]=='Final Fantasy I+II'):
            continue
        cleanJTitle=re.sub('\(.*\).*','',jtitles[count])
        cleanJTitle=cleanJTitle.replace(u'\xa0', '')
        if(titles[count]!='—'):
            if(jtitles[count]!=titles[count]):
                cleanTitle=re.sub('\(.*\).*','',titles[count])
                cleanTitle=cleanTitle.replace(u'\xa0', '')
                existingID=db_utils.gameExists(cleanTitle)
                if(existingID!=-1):
                    db_utils.customQuery('UPDATE game SET alt_title="'+cleanJTitle+'" WHERE id='+str(existingID)+' AND alt_title is null')
                    continue
                else:
                    print("for game "+titles[count]+" found no existing match in database when should have one")
                    continue
            else: 
                continue
        gameDetails = []
        gameDetails.append(1)
        newGameID=db_utils.insertGame(cleanJTitle.strip())
        if(type(newGameID) is list):
            continue
            gameDetails.append(newGameID[0])
        else: 
            gameDetails.append(newGameID)
        gameDetails.append("")
        gameDetails.append("")
        if(type(dateJP[count]) is float):
            gameDetails.append("Unreleased")
        else:
            gameDetails.append(dateJP[count])
        gameDetails.append("")
        db_utils.insertGamePlatform(gameDetails)

        if(type(publishers[count]) is not float):
            cleanPublishers = re.sub('\[.{0,3}\]','',publishers[count])
            publishersSplit = re.split('\(.{0,7}\)',cleanPublishers)
            pubIDs = db_utils.insertPublishers(publishersSplit)
            db_utils.insertGamePublishers(gameDetails[1],pubIDs)

        infobox = scrape_utils.wikipediaInfoboxScraping(cleanJTitle)
      
        if(infobox is not None):
            db_utils.saveInfoboxData(infobox,gameDetails[1])
            if('boxart' in infobox):
                gamefaqsScraping(cleanJTitle,gameDetails[1],False)
            else:
                gamefaqsScraping(cleanJTitle,gameDetails[1],True)
        else:
            gamefaqsScraping(cleanJTitle,gameDetails[1],True)

def gamefaqsScraping(cleanTitle,gameID,extractImage):
    data=scrape_utils.getGamefaqsDescAndImage(cleanTitle,'NES')
    if(data!=-1 and data is not None):
        db_utils.saveDescription(gameID,data['desc'])
        if(extractImage):
            db_utils.saveWikiCoverLink(gameID,data['img'])

def findMissingData():
    games = db_utils.customQuery("SELECT * FROM `game` WHERE cover_wikipedia_link is null or description is null and game.id>4033;")
    listpro = scrape_utils.findSuitableProxy()
    for count in range(0,len(games)):
        game=games[count]
        data=scrape_utils.getGamefaqsDescAndImage(game['title'],'NES',listpro)
        if(data!=-1 and data is not None):
            db_utils.saveDescription(game['id'],data['desc'])
            db_utils.saveWikiCoverLink(game['id'],data['img'])
        

def main():
    """Entry Point"""
    db_utils.connectDatabase()
    #db_utils.cleanupGamesFromPlatform(1)   #in DB NES has id 1
    #scrapeNesGames()
    #findMissingData()
    #scrapeFamicomGames()
   
if __name__ == '__main__':
    main()     
