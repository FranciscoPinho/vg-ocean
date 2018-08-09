"""This module has functions that allows the conversion of data into vg-ocean database business objects"""
import pymysql

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
        if(cleanpubs==''):
            return
        try:
            with db.cursor() as cursor:
                # Create a new record
                sql = "SELECT `id`,`name` FROM `publisher` WHERE LEVENSHTEIN_RATIO(`name`,%s)>85 AND LEVENSHTEIN(`name`,%s)<4"
                cursor.execute(sql,(cleanpubs,cleanpubs))
                result = cursor.fetchone()
                if(result is not None):
                     #print('duplicate publisher, tried to insert: '+ cleanpubs +' but already existed '+result['name'])
                     return  
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
        if(cleandevs==''):
            return
        try:
            with db.cursor() as cursor:
                # Create a new record
                sql = "SELECT `id`,`name` FROM `developer` WHERE LEVENSHTEIN_RATIO(`name`,%s)>85 AND LEVENSHTEIN(`name`,%s)<4"
                cursor.execute(sql,(cleandevs,cleandevs))
                result = cursor.fetchone()
                if(result is not None):
                     #print('duplicate developer, tried to insert: '+cleandevs+' but already existed '+result['name'])
                     return
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
            return
        try:
            with db.cursor() as cursor:
                # Create a new record
                sql = "SELECT `id`,`name` FROM `artist` WHERE LEVENSHTEIN_RATIO(`name`,%s)>85 AND LEVENSHTEIN(`name`,%s)<4"
                cursor.execute(sql,(cleanartist,cleanartist))
                result = cursor.fetchone()
                if(result is not None):
                     #print('duplicate developer, tried to insert: '+cleandevs+' but already existed '+result['name'])
                     return
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
        try:
            with db.cursor() as cursor:
                # Create a new record
                sql = "SELECT `id`,`name` FROM `genre` WHERE LEVENSHTEIN_RATIO(`name`,%s)>75 AND LEVENSHTEIN(`name`,%s)<4"
                cursor.execute(sql,(genres[count],genres[count]))
                result = cursor.fetchone()
                if(result is not None):
                    for k, v in result.items():
                       if(k=="name"):
                        if(v!=genres[count]):
                            if(v.find('2D')!=-1 and genres[count].find('3D')!=-1):
                                pass
                            elif(v.find('3D')!=-1 and genres[count].find('2D')!=-1):
                                pass
                            else:
                                idList.append(v) 
                                #print('Tried inserting genre '+allGenres[count]+ ' but '+v+' already existed')
                                return
            cursor.close()
            with db.cursor() as cursor:
                # Create a new record
                sql = "INSERT INTO `genre` (`name`) VALUES (%s)"
                cursor.execute(sql, genres[count])
                db.commit()
                idList.append(cursor.lastrowid) 
        except pymysql.err.IntegrityError:
            cursor.close()
            with db.cursor() as cursor:
                sql = "SELECT `id` FROM `genre` WHERE `name`=%s"
                cursor.execute(sql, genres[count])
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

def insertGamePlatform(gamePlatformList):
    """Insert gameplatform object into database"""
    try:
        with db.cursor() as cursor:
            # Create a new record
            sql = "INSERT INTO `gameplatform` (`platformID`,`gameID`, `release_US`, `release_EU`, `release_JP`) VALUES (%s, %s, %s, %s, %s)"
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

def saveWikiCoverLink(gameId,link):
    with db.cursor() as cursor:
        sql = "UPDATE `game` SET `cover_wikipedia_link`=%s WHERE `id`=%s"
        cursor.execute(sql, [link,gameId])
        db.commit()
    cursor.close()

def saveDescription(gameId,desc):
    with db.cursor() as cursor:
        sql = "UPDATE `game` SET `description`=%s WHERE `id`=%s"
        cursor.execute(sql, [desc,gameId])
        db.commit()
    cursor.close()
    
def cleanupGamesFromPlatform(platformID):
    """Delete all the games from a certain platform"""
    with db.cursor() as cursor:
        # Create a new record
        sql = "DELETE FROM game WHERE EXISTS (SELECT gameID FROM gameplatform WHERE platformID=%s);"
        cursor.execute(sql, platformID)
        db.commit()
    