import pandas as pd
import re
import db_utils
import scrape_utils
from fuzzywuzzy import fuzz


#TODO famicom list
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
        
        selectedpageID=scrape_utils.searchPageID(cleanTitle)
        infoboxData=scrape_utils.extractInfoboxData(selectedpageID,cleanTitle)

        if(infoboxData==-1):
            subtitle=str.strip(re.sub('.*?\:','',cleanTitle))
            selectedpageID=scrape_utils.searchPageID(subtitle,subtitle=True)
            infoboxData=scrape_utils.extractInfoboxData(selectedpageID,subtitle)
        
        if(infoboxData!=-1):
            #print(infoboxData)
            if('genre' in infoboxData):
                genreIDs=db_utils.insertGenres(infoboxData['genre'])
                db_utils.insertGameGenres(gameDetails[1],genreIDs)
            if('director' in infoboxData):
                dirIDs=db_utils.insertArtists(infoboxData['director'])
                db_utils.insertCredits(gameDetails[1],dirIDs,'director')
            if('producer' in infoboxData):
                prodIDs=db_utils.insertArtists(infoboxData['producer'])
                db_utils.insertCredits(gameDetails[1],prodIDs,'producer')
            if('composer' in infoboxData):
                comIDs=db_utils.insertArtists(infoboxData['composer'])
                db_utils.insertCredits(gameDetails[1],comIDs,'composer')
            if('programmer' in infoboxData):
                progIDs=db_utils.insertArtists(infoboxData['programmer'])
                db_utils.insertCredits(gameDetails[1],progIDs,'programmer')
            if('writer' in infoboxData):
                wriIDs=db_utils.insertArtists(infoboxData['writer'])
                db_utils.insertCredits(gameDetails[1],wriIDs,'writer')
            if('artist' in infoboxData):
                arIDs=db_utils.insertArtists(infoboxData['artist'])
                db_utils.insertCredits(gameDetails[1],arIDs,'artist')
            if('boxart' in infoboxData):
                db_utils.saveWikiCoverLink(gameDetails[1],infoboxData['boxart'])
        
        description=scrape_utils.getGamefaqsDescription(cleanTitle,'NES')
        if(description!=-1):
            db_utils.saveDescription(gameDetails[1],description)

def main():
    """Entry Point"""
    db_utils.connectDatabase()
    #db_utils.cleanupGamesFromPlatform(1)   #in DB NES has id 1
    scrape_nes_games()
   
if __name__ == '__main__':
    main()     
