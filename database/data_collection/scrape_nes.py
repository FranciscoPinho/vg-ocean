import pandas as pd
import re
import db_insertion_utils as db_utils
import scrape_utilities as scrape_utils
import gamefaqs
import urllib
from fuzzywuzzy import fuzz
from bs4 import BeautifulSoup


#TODO arse infobox, check if valid infobox by title,insert genres,description(gamefaqs), credits, find image and famicom list
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
        gameDetails.append(db_utils.insertGame(cleanTitle))

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
        genreBoxData=scrape_utils.extractGenreAndBoxart(selectedpageID,cleanTitle)

        if(genreBoxData==-1):
            subtitle=str.strip(re.sub('.*?\:','',cleanTitle))
            selectedpageID=scrape_utils.searchPageID(subtitle,subtitle=True)
            genreBoxData=scrape_utils.extractGenreAndBoxart(selectedpageID,subtitle)
        if(genreBoxData!=-1):
            print(genreBoxData)
        
       
        #urlwiki = r'https://en.wikipedia.org/?curid='+str(selectedpageID)

        #pagetables = pd.read_html(urlwiki) # Returns list of all tables on page
        #wikicard = pagetables[0]
        #content = requests.get(urlwiki)
        #print(content.text())
        #soup = BeautifulSoup(requests.get(urlwiki).text(),"lxml")
        #print(soup.prettify())
        #return
        #print(wikicard)
        #GenreIDs = []
        #GenreIDs = db_utils.insertGenres(genres[count])
        #db_utils.insertGameGenres(newGameId,GenreIDs)
        #
def main():
    """Entry Point"""
    db_utils.connectDatabase()
    db_utils.cleanupGamesFromPlatform(1)   #in DB NES has id 1
    scrape_nes_games()
   
if __name__ == '__main__':
    main()     