import pandas as pd
import wikipedia_list_scraping as wiki

def scrape_switch_games():
    """Scrapes NSwitch games info from wikipedia lists"""
    url = r'https://en.wikipedia.org/wiki/List_of_Nintendo_Switch_games'
    tables = pd.read_html(url) # Returns list of all tables on page
    switchgames = tables[0]
    titles = switchgames[switchgames.columns[0]].tolist()
    genres = switchgames[switchgames.columns[1]].tolist()
    developers = switchgames[switchgames.columns[2]].tolist()
    publishers = switchgames[switchgames.columns[3]].tolist()
    #not needed exclusive = switchgames[switchgames.columns[4]].tolist()
    dateUS = switchgames[switchgames.columns[6]].tolist()
    dateJP = switchgames[switchgames.columns[5]].tolist()
    dateEU = switchgames[switchgames.columns[7]].tolist()

    for count in range(0, len(titles)):
        if(titles[count]!="Title" and titles[count]!="JP"):
            tempList = []
            tempList.append(titles[count])
            if(type(publishers[count]) is float):
                tempList.append("Unknown")
            else:
                tempList.append(publishers[count])
           
            if(type(developers[count]) is float):
                tempList.append("Unknown")
            else:
                tempList.append(developers[count])
            
            if(type(dateUS[count]) is float):
                tempList.append("Unreleased")
            else:
                if(len(dateUS[count])>14):
                    tempList.append(dateUS[count][8:18])
                else:
                    tempList.append(dateUS[count])
            
            if(type(dateJP[count]) is float):
                tempList.append("Unreleased")
            else:
                if(len(dateJP[count])>14):
                    tempList.append(dateJP[count][8:18])
                else:
                    tempList.append(dateJP[count])

            if(type(dateEU[count]) is float):
                tempList.append("Unreleased")
            else:
                if(len(dateEU[count])>14):
                    tempList.append(dateEU[count][8:18])
                else:
                    tempList.append(dateEU[count])
            newGameId = wiki.insertGame(tempList) #function returns database id of last inserted game
            wiki.insertGamePlatform(newGameId,1)
            GenreIDs = []
            GenreIDs = wiki.insertGenres(genres[count])
            wiki.insertGameGenres(newGameId,GenreIDs)

def main():
    """Entry Point"""
    wiki.connectDatabase()
    scrape_ps4_games()
   
if __name__ == '__main__':
    main()    