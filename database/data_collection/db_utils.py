"""This module has functions that allows the conversion of data into vg-ocean database business objects"""
import pymysql
from fuzzywuzzy import fuzz
import re

def connectDatabase():
    """Create database connection"""
    global db
    db = pymysql.connect(host='localhost', user='root', password='',
                         db='ocean', cursorclass=pymysql.cursors.DictCursor,charset='utf8mb4')

def insertPublishers(allPublishers):
    """Insert publishers into database"""
    idList = []
    for count in range(0,len(allPublishers)):
        cleanpubs = allPublishers[count].strip()
        cleanpubs = cleanpubs.replace(u'\xa0', '')
        if(cleanpubs==''):
            return idList
        try:
            with db.cursor() as cursor:
                # Create a new record
                sql = "SELECT `id`,`name` FROM `publisher` WHERE LEVENSHTEIN_RATIO(`name`,%s)>85 AND LEVENSHTEIN(`name`,%s)<4"
                cursor.execute(sql,(cleanpubs,cleanpubs))
                result = cursor.fetchone()
                if(result is not None):
                     #print('duplicate publisher, tried to insert: '+ cleanpubs +' but already existed '+result['name'])
                     idList.append(result['id'])
                     cursor.close()
                     continue 
            cursor.close()
            with db.cursor() as cursor:
                # Create a new record
                sql = "INSERT INTO `publisher` (`name`) VALUES (%s)"
                cursor.execute(sql, cleanpubs)
                db.commit()
                idList.append(cursor.lastrowid) 
        except pymysql.err.IntegrityError:
            cursor.close()
            with db.cursor() as cursor:
                sql = "SELECT `id` FROM `publisher` WHERE `name`=%s"
                cursor.execute(sql, cleanpubs)
                result = cursor.fetchone()
                #print("Integrity: Tried to insert duplicate row - Already exists at ID " + str(result['id']))
                idList.append(result['id'])
        except pymysql.err.InternalError as e:
            print(str(e))
            cursor.close()
    return idList


def insertDevelopers(alldevs):
    """Insert developers into database"""
    idList = []
    for count in range(0,len(alldevs)):
        cleandevs = alldevs[count].strip()
        cleandevs = cleandevs.replace(u'\xa0', '')
        if(cleandevs==''):
            return idList
        try:
            with db.cursor() as cursor:
                # Create a new record
                sql = "SELECT `id`,`name` FROM `developer` WHERE LEVENSHTEIN_RATIO(`name`,%s)>85 AND LEVENSHTEIN(`name`,%s)<4"
                cursor.execute(sql,(cleandevs,cleandevs))
                result = cursor.fetchone()
                if(result is not None):
                     #print('duplicate developer, tried to insert: '+cleandevs+' but already existed '+result['name'])
                     idList.append(result['id'])
                     continue
            cursor.close()
            with db.cursor() as cursor:
                # Create a new record
                sql = "INSERT INTO `developer` (`name`) VALUES (%s)"
                cursor.execute(sql, cleandevs)
                db.commit()
                idList.append(cursor.lastrowid) 
        except pymysql.err.IntegrityError:
            cursor.close()
            with db.cursor() as cursor:
                sql = "SELECT `id` FROM `developer` WHERE `name`=%s"
                cursor.execute(sql, cleandevs)
                result = cursor.fetchone()
                #print("Integrity: Tried to insert duplicate row - Already exists at ID " + str(result['id']))
                idList.append(result['id'])
        except pymysql.err.InternalError as e:
            print(str(e))
            cursor.close()
    return idList 

def insertArtists(allartists):
    """Insert developers into database"""
    idList = []
    for count in range(0,len(allartists)):
        cleanartist = allartists[count].strip()
        if(cleanartist==''):
            return idList
        try:
            with db.cursor() as cursor:
                # Create a new record
                sql = "SELECT `id`,`name` FROM `artist` WHERE LEVENSHTEIN_RATIO(`name`,%s)>85 AND LEVENSHTEIN(`name`,%s)<4"
                cursor.execute(sql,(cleanartist,cleanartist))
                result = cursor.fetchone()
                if(result is not None):
                     #print('duplicate developer, tried to insert: '+cleandevs+' but already existed '+result['name'])
                    idList.append(result['id'])
                    continue
            cursor.close()
            with db.cursor() as cursor:
                # Create a new record
                sql = "INSERT INTO `artist` (`name`) VALUES (%s)"
                cursor.execute(sql, cleanartist)
                db.commit()
                idList.append(cursor.lastrowid) 
        except pymysql.err.IntegrityError:
            cursor.close()
            with db.cursor() as cursor:
                sql = "SELECT `id` FROM `artist` WHERE `name`=%s"
                cursor.execute(sql, cleanartist)
                result = cursor.fetchone()
                #print("Integrity: Tried to insert duplicate row - Already exists at ID " + str(result['id']))
                idList.append(result['id'])
        except pymysql.err.InternalError as e:
            print(str(e))
            cursor.close()
    return idList

def insertGenres(genres):    
    """Insert genres into the database"""
    idList = []
    if(type(genres) is float or type(genres) is None):
        return
    for count in range(0,len(genres)):
        cleanGenre=genres[count].strip()
        if(cleanGenre==""):
            continue
        try:
            with db.cursor() as cursor:
                # Create a new record
                sql = "SELECT `id`,`name` FROM `genre` WHERE LEVENSHTEIN_RATIO(`name`,%s)>75 AND LEVENSHTEIN(`name`,%s)<4"
                cursor.execute(sql,(cleanGenre,cleanGenre))
                result = cursor.fetchone()
                if(result is not None):
                    if(result['name']!=genres[count]):
                        if(result['name'].find('2D')!=-1 and genres[count].find('3D')!=-1):
                            pass
                        elif(result['name'].find('3D')!=-1 and genres[count].find('2D')!=-1):
                            pass
                        else:
                            idList.append(result['id'])
                            continue
                            #print('Tried inserting genre '+genres[count]+ ' but '+v+' already existed')
            cursor.close()
            with db.cursor() as cursor:
                # Create a new record
                sql = "INSERT INTO `genre` (`name`) VALUES (%s)"
                cursor.execute(sql, cleanGenre)
                db.commit()
                idList.append(cursor.lastrowid) 
        except pymysql.err.IntegrityError:
            cursor.close()
            with db.cursor() as cursor:
                sql = "SELECT `id` FROM `genre` WHERE `name`=%s"
                cursor.execute(sql, cleanGenre)
                result = cursor.fetchone()
               # print("Integrity: Tried to insert duplicate row - Already exists at ID " + str(result['id']))
                idList.append(result['id'])
        except pymysql.err.InternalError as e:
            print(str(e))
            cursor.close()
    return idList


def insertGame(game_title):
    """Insert a game into the database"""
    try:
        with db.cursor() as cursor:
            # Create a new record
            sql = "INSERT INTO `game` (`title`) VALUES (%s)"
            cursor.execute(sql, game_title)
            db.commit()
            return cursor.lastrowid
    except pymysql.err.IntegrityError:
        cursor.close()
        with db.cursor() as cursor:
            sql = "SELECT `id` FROM `game` WHERE `title`=%s"
            cursor.execute(sql,game_title)
            result = cursor.fetchone()
            print("Integrity: Tried to insert duplicate game - "+game_title+" - Already exists at ID " + str(result['id']))
            return [result['id'],-1]
    except pymysql.err.InternalError as e:
        print(str(e))

def gameExists(game_title):
    try:
        with db.cursor() as cursor:
            sql= "SELECT `id`,`title` FROM `game` WHERE LEVENSHTEIN_RATIO(`title`,%s)>80 AND LEVENSHTEIN(`title`,%s)<4"
            cursor.execute(sql,(game_title,game_title))
            results = cursor.fetchall()
            cursor.close()
            bestChoice=-1
            bestTitle= ""
            for count in range(0,len(results)):
                bestScore=0
                currentRatio=fuzz.ratio(results[count]['title'],game_title)
                lastDigitsSearch = re.search('I+|\d{0,2}', game_title[::-1])
                lastDigitsTitle = re.search('I+|\d{0,2}', results[count]['title'][::-1])
                if(lastDigitsTitle==None and lastDigitsSearch!=None):
                    return -1
                elif(lastDigitsTitle!=None and lastDigitsSearch==None):
                     return -1
                elif(lastDigitsTitle==None and lastDigitsSearch==None):
                    pass
                elif(lastDigitsSearch.group()!=lastDigitsTitle.group()):
                    return -1
                if(currentRatio==100):
                    print("Found similar : "+results[count]['title']+" for "+game_title)
                    return results[count]['id']
                if(currentRatio>bestScore):
                    bestScore=currentRatio
                    bestChoice = results[count]['id']
                    bestTitle= results[count]['title']
            if(bestChoice!=-1):
                print("Found similar : "+bestTitle+" for "+game_title)
            return bestChoice
    except Exception as e:
        print(str(e))
        return -1

def gameExistsMultiple(game_title):
    try:
        with db.cursor() as cursor:
            sql= r"SELECT `id`,`title`,(SELECT JSON_ARRAYAGG(platform.short) FROM platform LEFT JOIN gameplatform on platform.id=gameplatform.platformID WHERE gameID=game.id) as 'platforms' FROM `game` WHERE `title` LIKE '"+game_title[0]+r"%'"
            cursor.execute(sql)
            results = cursor.fetchall()
            cursor.close()
            conflicts = []
            for count in range(0,len(results)):
                conflict = {}
                cleanTitle=re.sub('\(.*?\)','',results[count]['title']).strip()
                currentRatio=fuzz.ratio(cleanTitle,game_title)
                if(currentRatio>75 or game_title in results[count]['title']):
                    lastDigitsSearch = re.search('I+|\d{0,2}', game_title[::-1])
                    lastDigitsTitle = re.search('I+|\d{0,2}', cleanTitle[::-1])
                    if(lastDigitsTitle==None and lastDigitsSearch!=None):
                        continue
                    elif(lastDigitsTitle!=None and lastDigitsSearch==None):
                        continue
                    elif(lastDigitsTitle==None and lastDigitsSearch==None):
                        pass
                    elif(lastDigitsSearch.group()!=lastDigitsTitle.group()):
                        continue
                    conflict['similarity']=currentRatio
                    conflict['gameid'] = results[count]['id']
                    conflict['title']= results[count]['title']
                    conflict['platforms']= results[count]['platforms']
                    conflicts.append(conflict)
            return conflicts
    except Exception as e:
        print(str(e))
        return -1


def insertGamePlatform(gamePlatformList):
    """Insert gameplatform object into database"""
    try:
        with db.cursor() as cursor:
            # Create a new record
            sql = "INSERT INTO `gameplatform` (`platformID`,`gameID`, `release_US`, `release_EU`, `release_JP`,`release_GEN`) VALUES (%s, %s, %s, %s, %s,%s)"
            cursor.execute(sql, gamePlatformList)
            db.commit()
    except pymysql.err.IntegrityError as e:
        print(str(e))
    except pymysql.err.InternalError as e:
        print(str(e))

def insertGameGenres(gameId,genreIDs):
    """Insert gamegenre object into database"""
    if(type(genreIDs) is list):
        for count in range(0,len(genreIDs)):
            try:
                with db.cursor() as cursor:
                    # Create a new record
                    sql = "INSERT INTO `gamegenre` (`genreID`,`gameID`) VALUES (%s, %s)"
                    cursor.execute(sql, [genreIDs[count],gameId])
                    db.commit()
            except pymysql.err.IntegrityError:
               pass
               # print("Integrity: Tried to insert duplicate row")
            except pymysql.err.InternalError as e:
                print(str(e))
            cursor.close()

def insertCredits(gameId,artistIDs,role):
    """Insert credits object into database"""
    if(type(artistIDs) is list):
        for count in range(0,len(artistIDs)):
            try:
                with db.cursor() as cursor:
                    # Create a new record
                    sql = "INSERT INTO `credits` (`artistID`,`gameID`,`role`) VALUES (%s, %s,%s)"
                    cursor.execute(sql, [artistIDs[count],gameId,role])
                    db.commit()
            except pymysql.err.IntegrityError:
               pass
               # print("Integrity: Tried to insert duplicate row")
            except pymysql.err.InternalError as e:
                print(str(e))
            cursor.close()

def insertGamePublishers(gameId,pubIDs):
    """Insert gamepublishers object into database"""
    if(type(pubIDs) is list):
        for count in range(0,len(pubIDs)):
            try:
                with db.cursor() as cursor:
                    # Create a new record
                    sql = "INSERT INTO `gamepublisher` (`publisherID`,`gameID`) VALUES (%s, %s)"
                    cursor.execute(sql, [pubIDs[count],gameId])
                    db.commit()
            except pymysql.err.IntegrityError:
               pass
               # print("Integrity: Tried to insert duplicate row")
            except pymysql.err.InternalError as e:
                print(str(e))
            cursor.close()

def insertGameDevelopers(gameId,devIDs):
    """Insert gamedevelopers object into database"""
    if(type(devIDs) is list):
        for count in range(0,len(devIDs)):
            try:
                with db.cursor() as cursor:
                    # Create a new record
                    sql = "INSERT INTO `gamedeveloper` (`devID`,`gameID`) VALUES (%s, %s)"
                    cursor.execute(sql, [devIDs[count],gameId])
                    db.commit()
            except pymysql.err.IntegrityError:
               pass
               # print("Integrity: Tried to insert duplicate row")
            except pymysql.err.InternalError as e:
                print(str(e))
            cursor.close()

def customQuery(query):
    with db.cursor() as cursor:
        sql = query
        cursor.execute(sql)
        result = cursor.fetchall()
        db.commit();
        cursor.close()
        return result

def saveWikiCoverLink(gameId,link):
    with db.cursor() as cursor:
        sql = "UPDATE `game` SET `cover_wikipedia_link`=%s WHERE `id`=%s and `cover_wikipedia_link` is NULL"
        cursor.execute(sql, [link,gameId])
        db.commit()
    cursor.close()

def saveCoverPlatformLink(gameId,platformId,link):
    with db.cursor() as cursor:
        sql = "UPDATE `gameplatform` SET `cover_platform_link`=%s WHERE `gameID`=%s and `platformID`=%s"
        cursor.execute(sql, [link,gameId,platformId])
        db.commit()
    cursor.close()

def saveDescription(gameId,desc):
    with db.cursor() as cursor:
        sql = "UPDATE `game` SET `description`=%s WHERE `id`=%s AND `description` is NULL"
        cursor.execute(sql, [desc,gameId])
        db.commit()
    cursor.close()

def saveInfoboxData(infoboxData,gameID,platformID=None):
    if('genre' in infoboxData):
        genreIDs=insertGenres(infoboxData['genre'])
        insertGameGenres(gameID,genreIDs)
    if('director' in infoboxData):
        dirIDs=insertArtists(infoboxData['director'])
        insertCredits(gameID,dirIDs,'director')
    if('producer' in infoboxData):
        prodIDs=insertArtists(infoboxData['producer'])
        insertCredits(gameID,prodIDs,'producer')
    if('composer' in infoboxData):
        comIDs=insertArtists(infoboxData['composer'])
        insertCredits(gameID,comIDs,'composer')
    if('programmer' in infoboxData):
        progIDs=insertArtists(infoboxData['programmer'])
        insertCredits(gameID,progIDs,'programmer')
    if('writer' in infoboxData):
        wriIDs=insertArtists(infoboxData['writer'])
        insertCredits(gameID,wriIDs,'writer')
    if('artist' in infoboxData):
        arIDs=insertArtists(infoboxData['artist'])
        insertCredits(gameID,arIDs,'artist')
    if('designer' in infoboxData):
        deIDs=insertArtists(infoboxData['designer'])
        insertCredits(gameID,deIDs,'designer')
    #if('developer' in infoboxData):
    #    devIDs = insertDevelopers(infoboxData['developer'])            
    #    insertGameDevelopers(gameID,devIDs)
    if('boxart' in infoboxData):
        saveWikiCoverLink(gameID,infoboxData['boxart'])
        if platformID is not None:
            saveCoverPlatformLink(gameID,platformID,infoboxData['boxart'])

def cleanupGamesFromPlatform(platformID):
    """Delete all the games from a certain platform"""
    with db.cursor() as cursor:
        # Create a new record
        sql = "DELETE FROM game WHERE EXISTS (SELECT gameID FROM gameplatform WHERE platformID=%s);"
        cursor.execute(sql, platformID)
        db.commit()
    