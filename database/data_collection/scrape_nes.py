import pandas as pd
import re
import db_utils
import scrape_utils
from fuzzywuzzy import fuzz


#TODO 
# famicom list
# get cover art from gamefaqs alternatively on the right platform
#HOW TO GET PAGEID OF A GAME
#https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&utf8=1&srsearch=SEARCHQUERY
#HOW TO ACCESS GAME PAGE
#https://en.wikipedia.org/?curid=PAGEID
def scrape_nes_games():
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
        newGameID=db_utils.insertGame(cleanTitle)
        if(type(newGameID) is list):
            if(count>311):
                description=scrape_utils.getGamefaqsDescription(cleanTitle,'NES')
                if(description!=-1):
                    db_utils.saveDescription(newGameID[0],description)
            continue
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
        gamefaqsScraping(cleanTitle,gameDetails[1])
       
def gamefaqsScraping(cleanTitle,gameID):
    description=scrape_utils.getGamefaqsDescription(cleanTitle,'NES')
    if(description!=-1):
        db_utils.saveDescription(gameID,description)

def findMissingData():
    games = db_utils.customQuery("SELECT name FROM `genre`;")
    for count in range(0,len(games)):
        game=games[count]
        print(game['name'])
        db_utils.customQuery(r'UPDATE `genre` SET name="'+game['name'].strip()+r'" WHERE name="'+game['name']+r'"');
        #if(infobox is not None):
          #db_utils.saveInfoboxData(infobox,game['id']
            #print('for game '+game['title']+ ' inserted devs: '+developers[index]+' and publishers: '+cleanPublishers)

def main():
    """Entry Point"""
    db_utils.connectDatabase()
    #db_utils.cleanupGamesFromPlatform(1)   #in DB NES has id 1
    #scrape_nes_games()
    findMissingData()
   
if __name__ == '__main__':
    main()     
