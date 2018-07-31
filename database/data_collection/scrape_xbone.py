import pandas as pd
import wikipedia_list_scraping as wiki

def scrape_xboxone_games():
    """Scrapes XOne games info from wikipedia lists"""
    url = r'https://en.wikipedia.org/wiki/List_of_Xbox_One_games'
    
    tables = pd.read_html(url) # Returns list of all tables on page
    xboxgames = tables[2]
    titles = xboxgames[xboxgames.columns[0]].tolist()
    genres = xboxgames[xboxgames.columns[1]].tolist()
    developers = xboxgames[xboxgames.columns[2]].tolist()
    publishers = xboxgames[xboxgames.columns[3]].tolist()
    #not needed exclusive = xboxgames[xboxgames.columns[4]].tolist()
    dateUS = xboxgames[xboxgames.columns[6]].tolist()
    dateJP = xboxgames[xboxgames.columns[5]].tolist()
    dateEU = xboxgames[xboxgames.columns[7]].tolist()

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
            wiki.insertGamePlatform(newGameId,2)
            GenreIDs = []
            GenreIDs = wiki.insertGenres(genres[count])
            wiki.insertGameGenres(newGameId,GenreIDs)  


def main():
    """Entry Point"""
    wiki.connectDatabase()
    scrape_xboxone_games()
   
if __name__ == '__main__':
    main()     
