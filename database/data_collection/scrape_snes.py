import pandas as pd
import re
import db_utils
import scrape_utils
from fuzzywuzzy import fuzz
import misc_utils
from playsound import playsound

def scrapeSnesGames():
    """Scrapes SMS games info from wikipedia lists"""
    global SNES_ID
    global listpro
    listpro = scrape_utils.findSuitableProxy()
    #listpro=set(['193.178.246.248:8080','27.98.206.187:3128'])
    if(len(listpro)==0):
        print(listpro)
        return
    SNES_ID=4
    url = r'https://en.wikipedia.org/wiki/List_of_Super_Nintendo_Entertainment_System_games'
    tables = pd.read_html(url) # Returns list of all tables on page
    games = tables[0]
    titles = games[games.columns[0]].tolist()
    developers = games[games.columns[1]].tolist()   
    publishers = games[games.columns[2]].tolist()
    dateJP = games[games.columns[4]].tolist()
    dateEU = games[games.columns[5]].tolist()
    dateUS = games[games.columns[6]].tolist()

    for count in range(192,len(titles)):
        if(titles[count]==''):
            return   
        print("doing iteration "+str(count)+ " for title "+titles[count])
        possibleTitles=cleanupTitles(titles[count].split('•'))
        #print(possibleTitles,dateJP[count],dateUS[count],dateEU[count],developers[count],publishers[count])
        newGame=True
        gameDetails = []
        gameDetails.append(SNES_ID)
        
        conflicts=db_utils.gameExistsMultiple(possibleTitles[0])
        if(conflicts!=-1 and len(conflicts)>0):
            print("Game in consideration: "+possibleTitles[0])
            for index in range(0,len(conflicts)):
                print("Enter "+ str(index)+" to merge with: "+conflicts[index]['title']+"("+str(conflicts[index]['similarity'])+")")
            playsound(r'C:\wamp64\www\vg-ocean\database\data_collection\fanfare.mp3',block=False)
            var = input("Enter new or newapp or new to create new entry or NUMERICAL index to merge with existing: ")
            if(str(var)=="new" or str(var)=="newapp"):
                print("Creating new game out of conflict")
                if(str(var)=="newapp"):
                    newGameID=db_utils.insertGame(possibleTitles[0]+ " (SNES)")
                else:
                    newGameID=db_utils.insertGame(possibleTitles[0])
                if(type(newGameID) is list):
                    gameDetails.append(newGameID[0])
                else:
                    gameDetails.append(newGameID)
            elif(misc_utils.isInt(str(var))):
                print("Merging with "+str(conflicts[int(var)]))
                if r')' in conflicts[int(var)]['title']:
                    newTitle=re.sub(r')',r'/SNES)',conflicts[int(var)]['title'])
                    print(newTitle)
                    db_utils.customQuery("UPDATE game SET title='"+newTitle+"' WHERE game.id="+conflicts[int(var)]['gameid'])
                gameDetails.append(conflicts[int(var)]['gameid'])
                newGame=False
        else:
            newGameID=db_utils.insertGame(possibleTitles[0])
            if(type(newGameID) is list):
                gameDetails.append(newGameID[0])
            else:
                gameDetails.append(newGameID)
           
        if(len(possibleTitles)==2 and possibleTitles[1]!=""):
            db_utils.customQuery('UPDATE game SET alt_title="'+possibleTitles[1]+'" WHERE id='+str(gameDetails[1])+' AND alt_title is null')
        if(len(possibleTitles)==3 and possibleTitles[2]!=""):
            db_utils.customQuery('UPDATE game SET alt_title2="'+possibleTitles[2]+'" WHERE id='+str(gameDetails[1])+' AND alt_title2 is null')
        if(len(possibleTitles)==4 and possibleTitles[3]!=""):
            db_utils.customQuery('UPDATE game SET alt_title2="'+possibleTitles[3]+'" WHERE id='+str(gameDetails[1])+' AND alt_title2 is null')
        #depending on regions
        if(type(dateUS[count]) is float):
            gameDetails.append("Unreleased")
        else:
            gameDetails.append(dateUS[count])
        if(type(dateEU[count]) is float):
            gameDetails.append("Unreleased")
        else:
            gameDetails.append(dateEU[count])
        if(type(dateJP[count]) is float):
            gameDetails.append("Unreleased")
        else:
            gameDetails.append(dateJP[count])
        gameDetails.append("") #dateGEN
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
            infobox = scrape_utils.wikipediaInfoboxScraping(possibleTitles[0])
            if(infobox is not None):
                db_utils.saveInfoboxData(infobox,gameDetails[1],platformID=SNES_ID)
                if('boxart' in infobox):
                    gamefaqsScraping(possibleTitles[0],gameDetails[1],False,newGame)
            else:
                gamefaqsScraping(possibleTitles[0],gameDetails[1],True,newGame)
        else:
            gamefaqsScraping(possibleTitles[0],gameDetails[1],True,newGame)

def cleanupTitles(possibleTitles):
    for titlecount in range(0,len(possibleTitles)):
        if(', The' in possibleTitles[titlecount]):
            cleanTitle=re.sub(', The','',possibleTitles[titlecount])
            cleanTitle='The '+cleanTitle
            cleanTitle=re.sub('\(.*\)|JP|†|(?<=[a-z]|[1-9])(EU|FR|GER|AU).*','',cleanTitle)
            cleanTitle=re.sub('&','and',cleanTitle)
            possibleTitles[titlecount]=cleanTitle
        else:
            cleanTitle=re.sub('\(.*\)|JP|†|(?<=[a-z]|[1-9])(EU|FR|GER|AU).*','',possibleTitles[titlecount])
            cleanTitle=re.sub('&','and',cleanTitle)
            possibleTitles[titlecount]=cleanTitle
        possibleTitles[titlecount]=possibleTitles[titlecount].replace(u'\xa0', '')
        possibleTitles[titlecount]=possibleTitles[titlecount].strip()
    return possibleTitles

def gamefaqsScraping(cleanTitle,gameID,extractImage,newGame):
    data=scrape_utils.getGamefaqsDescAndImage(cleanTitle,'SNES',listpro)
    if(data!=-1 and data is not None):
        if(newGame):
            db_utils.saveDescription(gameID,data['desc'])
        if(extractImage):
            if(newGame):
                db_utils.saveWikiCoverLink(gameID,data['img'])
        db_utils.saveCoverPlatformLink(gameID,SNES_ID,data['img'])

def findMissingData():
    games = db_utils.customQuery("SELECT * FROM `game` WHERE game.id>5078;")
    listpro = scrape_utils.findSuitableProxy()
    while(len(listpro)==0):
        print("trying to extract proxylist")
        listpro = scrape_utils.findSuitableProxy()
    for count in range(0,len(games)):
        game=games[count]
        title=re.sub('\(.*\)','',game['title'])
        data=scrape_utils.getGamefaqsDescAndImage(title,'SNES',listpro)
        if(data!=-1 and data is not None):
            db_utils.saveCoverPlatformLink(game['id'],4,data['img'])
        elif(game['alt_title'] is not None):
            data=scrape_utils.getGamefaqsDescAndImage(game['alt_title'],'SNES',listpro)
            if(data!=-1 and data is not None):
                db_utils.saveCoverPlatformLink(game['id'],4,data['img'])

            

        

def main():
    """Entry Point"""
    db_utils.connectDatabase()
    scrapeSnesGames()
    #findMissingData()
   
if __name__ == '__main__':
    main()     
