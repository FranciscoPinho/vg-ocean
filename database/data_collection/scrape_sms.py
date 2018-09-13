import pandas as pd
import re
import db_utils
import scrape_utils
from fuzzywuzzy import fuzz

#improvements, play some sound when conflict detected
def scrapeSmsGames():
    """Scrapes SMS games info from wikipedia lists"""
    global SMS_ID
    global listpro
    listpro = scrape_utils.findSuitableProxy()
    #listpro=set(['23.89.198.227:3128','206.189.238.81:80','54.39.97.250:3128','193.178.246.248:8080','27.98.206.187:3128'])
    if(len(listpro)==0):
        print(listpro)
        return
    SMS_ID=3
    url = r'https://en.wikipedia.org/wiki/List_of_Master_System_games'
    tables = pd.read_html(url) # Returns list of all tables on page
    games = tables[0]
    titles = games[games.columns[0]].tolist()
    developers = games[games.columns[1]].tolist()   
    publishers = games[games.columns[2]].tolist()
    date = games[games.columns[4]].tolist()
    
    for count in range(2,len(titles)):
        if(titles[count]==''):
            return
        if(publishers[count]=="Tec Toy"):
            continue
        if(type(date[count]) is float or date[count]=="Unreleased"):
            continue
        if("Unlicensed" in titles[count]):
            continue
        if(', The' in titles[count]):
            cleanTitle=cleanTitle=re.sub(', The','',titles[count])
            cleanTitle='The '+cleanTitle
            cleanTitle=re.sub('\(.*\)|(?<=[a-z]|[1-9])[A-Z].*','',cleanTitle)
        elif('Cop' in titles[count]):
            cleanTitle=re.sub('\(.*\)','',cleanTitle)
        else:
            cleanTitle=re.sub('\(.*\)|(?<=[a-z]|[1-9])[A-Z].*','',titles[count])
        cleanTitle=cleanTitle.replace(u'\xa0', '')
        newGame=True
        gameDetails = []
        gameDetails.append(SMS_ID)
        
        existingID=db_utils.gameExists(cleanTitle)
        
        if(existingID!=-1):
            var = input("Enter n or new to create new entry on this console or anything else to merge with existing entry: ")
            print("You entered " + str(var))
            if(str(var)=="new" or str(var)=="n"):
                print("Creating new game out of conflict")
                newGameID=db_utils.insertGame(cleanTitle.strip()+ " (SMS)")
                if(type(newGameID) is list):
                    gameDetails.append(newGameID[0])
                else:
                    gameDetails.append(newGameID)
            else:
                gameDetails.append(existingID)
                newGame=False
        else:
            newGameID=db_utils.insertGame(cleanTitle.strip())
            if(type(newGameID) is list):
                gameDetails.append(newGameID[0])
            else:
                gameDetails.append(newGameID)

        #depending on regions
        gameDetails.append("") #dateUS
        gameDetails.append("") #dateEU
        gameDetails.append("") #dateJP
        gameDetails.append(date[count]) #dateGEN
        db_utils.insertGamePlatform(gameDetails)
        if(newGame):
            if(type(publishers[count]) is not float):
                cleanPublishers = re.sub('\[.{0,3}\]','',publishers[count])
                publishersSplit = re.split('(?<=[a-z])[A-Z].*|JP\/EU|NA|EU|JP|EU\/AU',cleanPublishers)
                pubIDs = db_utils.insertPublishers(publishersSplit)
                db_utils.insertGamePublishers(gameDetails[1],pubIDs)
            if(type(developers[count]) is not float and developers[count]!='???'):
                devIDs = db_utils.insertDevelopers(developers[count].split(';'))            
                db_utils.insertGameDevelopers(gameDetails[1],devIDs)
            infobox = scrape_utils.wikipediaInfoboxScraping(cleanTitle)
            if(infobox is not None):
                db_utils.saveInfoboxData(infobox,gameDetails[1])
                if('boxart' in infobox):
                    gamefaqsScraping(cleanTitle,gameDetails[1],False,newGame)
            else:
                gamefaqsScraping(cleanTitle,gameDetails[1],True,newGame)
        else:
            gamefaqsScraping(cleanTitle,gameDetails[1],True,newGame)

def gamefaqsScraping(cleanTitle,gameID,extractImage,newGame):
    data=scrape_utils.getGamefaqsDescAndImage(cleanTitle,'SMS',listpro)
    if(data!=-1 and data is not None):
        if(newGame):
            db_utils.saveDescription(gameID,data['desc'])
        if(extractImage):
            if(newGame):
                db_utils.saveWikiCoverLink(gameID,data['img'])
        db_utils.saveCoverPlatformLink(gameID,SMS_ID,data['img'])

def findMissingData():
    games = db_utils.customQuery("SELECT * FROM `game` WHERE description is null and game.id>4750;")
    listpro = scrape_utils.findSuitableProxy()
    while(len(listpro)==0):
        print("trying to extract proxylist")
        listpro = scrape_utils.findSuitableProxy()
    for count in range(0,len(games)):
        game=games[count]
        if(r' (SMS)' in game['title']):
            cleanTitle=re.sub(' \(SMS\)','',game['title'])
            data=scrape_utils.getGamefaqsDescAndImage(cleanTitle,'SMS',listpro)
        elif(r'Starring' in game['title']):
            cleanTitleParts=re.split(' Starring',game['title'])
            cleanTitle=cleanTitleParts[1]+": "+cleanTitleParts[0]
            data=scrape_utils.getGamefaqsDescAndImage(cleanTitle,'SMS',listpro)
        elif('Sonic' in game['title']):
            cleanTitle = re.sub('Sonic','Sonic The Hedgehog',game['title'])
            data=scrape_utils.getGamefaqsDescAndImage(cleanTitle,'SMS',listpro)
        elif('Solomon' in game['title']):
            cleanTitle='Solomon\'s Key'
            data=scrape_utils.getGamefaqsDescAndImage(cleanTitle,'SMS',listpro)
        else:
            data=scrape_utils.getGamefaqsDescAndImage(game['title'],'SMS',listpro)
        if(data!=-1 and data is not None):
            db_utils.saveDescription(game['id'],data['desc'])
            db_utils.saveWikiCoverLink(game['id'],data['img'])
            db_utils.saveCoverPlatformLink(game['id'],3,data['img'])
        

        

def main():
    """Entry Point"""
    db_utils.connectDatabase()
    #scrapeSmsGames()
    #findMissingData()
   
if __name__ == '__main__':
    main()     
