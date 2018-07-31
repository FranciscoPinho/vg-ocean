"""This module scrapes game information from wikipedia lists to compile into a database"""
import pymysql

def connectDatabase():
    """Create database connection"""
    global db
    db = pymysql.connect(host='localhost', user='root', password='',
                         db='vg_dapi', cursorclass=pymysql.cursors.DictCursor,charset='utf8mb4')

def insertGenres(genres):    
    """Insert genres into the database"""
    idList = []
    currentId = 0
    if(type(genres) is float):
        return
    allGenres=genres.split(',')
    for count in range(0,len(allGenres)):
        try:
            with db.cursor() as cursor:
                # Create a new record
                sql = "SELECT `id`,`name` FROM `genre` WHERE LEVENSHTEIN_RATIO(`name`,%s)>75 AND LEVENSHTEIN(`name`,%s)<4"
                cursor.execute(sql,(allGenres[count],allGenres[count]))
                result = cursor.fetchone()
                if(result is None):
                    pass
                else:
                    for k, v in result.items():
                       if(k=="id"):
                         currentId=v 
                       if(k=="name"):
                        if(v!=allGenres[count]):
                            if(v.find('2D')!=-1 and allGenres[count].find('3D')!=-1):
                                pass
                            elif(v.find('3D')!=-1 and allGenres[count].find('2D')!=-1):
                                pass
                            else:
                                idList.append(v) 
                                return
            cursor.close()
            with db.cursor() as cursor:
                # Create a new record
                sql = "INSERT INTO `genre` (`name`) VALUES (%s)"
                cursor.execute(sql, allGenres[count])
                db.commit()
                idList.append(cursor.lastrowid) 
        except pymysql.err.IntegrityError:
            cursor.close()
            with db.cursor() as cursor:
                sql = "SELECT `id` FROM `genre` WHERE `name`=%s"
                cursor.execute(sql, allGenres[count])
                result = cursor.fetchone()
               # print("Integrity: Tried to insert duplicate row - Already exists at ID " + str(result['id']))
                idList.append(result['id'])
        except pymysql.err.InternalError as e:
            print(str(e))
            cursor.close()
    return idList


def insertGame(game_details_list):
    """Insert a game into the database"""
    try:
        with db.cursor() as cursor:
            # Create a new record
            sql = "INSERT INTO `game` (`name`, `publishers`, `developers`,`dateUS`,`dateJP`,`dateEU`) VALUES (%s, %s, %s, %s, %s, %s)"
            cursor.execute(sql, game_details_list)
            db.commit()
            return cursor.lastrowid
    except pymysql.err.IntegrityError:
        cursor.close()
        with db.cursor() as cursor:
            sql = "SELECT `id` FROM `game` WHERE `name`=%s"
            cursor.execute(sql,game_details_list[0])
            result = cursor.fetchone()
            #print("Integrity: Tried to insert duplicate row - Already exists at ID " + str(result['id']))
            return result['id']
    except pymysql.err.InternalError as e:
        print(str(e))

def insertGamePlatform(gameId,platformId):
    """Insert gameplatform object into database"""
    try:
        with db.cursor() as cursor:
            # Create a new record
            sql = "INSERT INTO `gameplatform` (`platformID`,`gameID`) VALUES (%s, %s)"
            cursor.execute(sql, [platformId,gameId])
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

