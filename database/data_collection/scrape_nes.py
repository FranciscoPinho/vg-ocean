import pandas as pd
import urllib.request
import db_insertion_utils as db_utils


#TODO insert genres, publishers, developers, credits, find image and famicom list
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
        tempList = []
        tempList.append(1)
        tempList.append(db_utils.insertGame(titles[count]))
        if(type(dateUS[count]) is float):
            tempList.append("Unreleased")
        else:
            tempList.append(dateUS[count])
        if(type(dateEU[count]) is float):
            tempList.append("Unreleased")
        else:
            tempList.append(dateEU[count])
        tempList.append("")
        db_utils.insertGamePlatform(tempList)

        #newGameId = db_utils.insertGame(tempList) #function returns database id of last inserted game
        #
        #GenreIDs = []
        #GenreIDs = db_utils.insertGenres(genres[count])
        #db_utils.insertGameGenres(newGameId,GenreIDs)

        #if(type(publishers[count]) is float):
        #    tempList.append("Unknown")
        #else:
        #    tempList.append(publishers[count])
        
        #if(type(developers[count]) is float):
        #    tempList.append("Unknown")
        #else:
        #    tempList.append(developers[count])

def main():
    """Entry Point"""
    db_utils.connectDatabase()
    db_utils.cleanupGamesFromPlatform(1)   #in DB NES has id 1
    scrape_nes_games()
   
if __name__ == '__main__':
    main()     
