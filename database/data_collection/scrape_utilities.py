import wikipedia
import re
from fuzzywuzzy import fuzz
import requests
import wptools

def searchPageID(title,subtitle=False):
    searchResults = requests.get('https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&utf8=1&srsearch='+title+' video game')
    searchIndex=0
    bestMatch=0
    selectedpageID=searchResults.json()['query']['search'][0]['pageid']
    while(searchIndex<5 and searchIndex < len(searchResults.json()['query']['search'])):
        pageID = searchResults.json()['query']['search'][searchIndex]['pageid']
        try:
            page = wikipedia.page(pageid=pageID)
            if('game' in page.summary):
                searchTitle=re.sub('\(.*?\)','',searchResults.json()['query']['search'][searchIndex]['title'])
                if(subtitle):
                    localMatch=max(fuzz.ratio(searchTitle.strip(),title),fuzz.ratio(str.strip(re.sub('.*?\:','',searchTitle)),title))
                else:
                    localMatch=fuzz.ratio(searchTitle.strip(),title)
               
                #print("SCORE",localMatch,"FOR",title,"AND SEARCH RESULT",searchTitle)
               
                if(localMatch==100):
                        return pageID
                if(localMatch>bestMatch):
                    bestMatch=localMatch
                    selectedpageID=pageID
        except:
            pass
        searchIndex+=1
    return selectedpageID

def extractGenreAndBoxart(selectedpageID,cleanTitle):
    try:
        page = wptools.page(pageid=selectedpageID)
        page.get_parse(show=False)
        # print("LOOKING FOR "+cleanTitle)
        # print("FOUND "+page.data['infobox']['title'])
        if(fuzz.ratio(page.data['infobox']['title'],cleanTitle)>75 or cleanTitle in page.data['infobox']['title'] and page.data['infobox']['genre']!=None):
            cleanGenres = re.sub('\[\[.*?\||\]\]|\[\[|\sgame|\svideo\sgame','',page.data['infobox']['genre'])
            allGenres = re.split('<.*?>|,',cleanGenres)
            if(page.images()[0]['url']!=None):
                return {'boxart':page.images()[0]['url'],'genre':allGenres}
            return {'genre':allGenres}
        else:
            #print("NO MATCH ",cleanTitle,page.data['infobox']['title'])
            return -1
    except:
        pass
    return -1
    