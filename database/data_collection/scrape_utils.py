import wikipedia
import re
from fuzzywuzzy import fuzz
import requests
import bs4
import wptools
import random

#credits are designer programmer composer director artist writer producer
def getGamefaqsDescription(title,platform,extract_image=False):
    try:
        headers = {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.84 Safari/537.36'
        }
        #Search for the game
        proxies = {
            "http": 'http://88.99.149.188:31288', 
            "https": 'https://88.99.149.188:31288'
        }
        text = requests.get('https://gamefaqs.gamespot.com/search/index.html?game='+title,headers=headers,proxies=proxies).text
        soup= bs4.BeautifulSoup(text,'lxml')
        info=soup.find_all("div",{"class":"sr_name"},limit=5)
        href=re.sub('.*?href=\"|\".*?</div>','',str(info[0]))
        #Go to game page
        text = requests.get('https://gamefaqs.gamespot.com'+href,headers=headers,proxies=proxies).text
        soup= bs4.BeautifulSoup(text,'lxml')
        titleHTML=soup.find("a",{"href":href})
        gamefaqsTitle=titleHTML.contents[0]
        #Check for validity of title
        if(fuzz.ratio(gamefaqsTitle,title)>75 or title in gamefaqsTitle):
            descriptionHTML=soup.find("div",{"class":"desc"})
            return descriptionHTML.contents[0]
        print("No match, found "+gamefaqsTitle+" but wanted "+title)
        return -1
    except Exception as e:
        print(str(e))
        return -1

def wikipediaInfoboxScraping(cleanTitle):
    selectedpageID=_searchPageID(cleanTitle)
    infoboxData=_extractInfoboxData(selectedpageID,cleanTitle)
    if(infoboxData==-1):
        subtitle=str.strip(re.sub('.*?\:','',cleanTitle))
        selectedpageID=_searchPageID(subtitle,subtitle=True)
        infoboxData=_extractInfoboxData(selectedpageID,subtitle)
    if(infoboxData!=-1):
        return infoboxData

def _searchPageID(title,subtitle=False):
    lastDigitsTitle = re.search('(\d{0,2}|I+)', title[::-1])
    if(lastDigitsTitle!=None and not str.isdigit(title)):
        searchResults = requests.get('https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&utf8=1&srsearch='+title)
    else:
        searchResults = requests.get('https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&utf8=1&srsearch='+title+' video game')
    searchIndex=0
    bestMatch=0
    selectedpageID=searchResults.json()['query']['search'][0]['pageid']
    while(searchIndex<8 and searchIndex < len(searchResults.json()['query']['search'])):
        pageID = searchResults.json()['query']['search'][searchIndex]['pageid']
        try:
            page = wikipedia.page(pageid=pageID)
            if('game' in page.summary):
                searchTitle=re.sub('\(.*?\)','',searchResults.json()['query']['search'][searchIndex]['title'])
                if(subtitle):
                    localMatch=max(fuzz.ratio(searchTitle.strip(),title),fuzz.ratio(str.strip(re.sub('.*?\:','',searchTitle)),title))
                else:
                    localMatch=fuzz.ratio(searchTitle.strip(),title)
                
                lastDigitsSearch = re.search('(\d{0,2}|I+)', searchTitle[::-1])
                if(lastDigitsTitle==None and lastDigitsSearch!=None):
                    localMatch=localMatch-30
                elif(lastDigitsTitle!=None and lastDigitsSearch==None):
                    localMatch=localMatch-30
                elif(lastDigitsTitle==None and lastDigitsSearch==None):
                    pass
                elif(lastDigitsSearch.groups()[0]!=lastDigitsTitle.groups()[0]):
                    localMatch=localMatch-30

                #print("SCORE",localMatch,"FOR",title,"AND SEARCH RESULT",searchTitle)
               
                if(localMatch==100):
                        return pageID
                if(localMatch>bestMatch):
                    bestMatch=localMatch
                    selectedpageID=pageID
        except Exception as e:
            print(str(e))
        searchIndex+=1
    return selectedpageID

def _extractInfoboxData(selectedpageID,cleanTitle):
    page = wptools.page(pageid=selectedpageID)
    try:
        page.get_parse(show=False)
    except:
        return -1

    infobox = page.data['infobox']
    
    if(infobox is None):
        return -1
    if('title' not in infobox):
        if('image' in infobox):
            if(fuzz.partial_ratio(cleanTitle.lower(),infobox['image'].lower())>75 or cleanTitle in infobox['image'] or fuzz.partial_ratio(re.sub('\s','',cleanTitle.lower()),re.sub(r'\W+', '',infobox['image'].lower()))>70):
                return _extractData(infobox,page)
    elif(fuzz.ratio(infobox['title'].lower(),cleanTitle.lower())>75 or cleanTitle.lower() in infobox['title'].lower()):
        return _extractData(infobox,page)

    return -1

def _extractData(infobox,page):
    data= dict()
    try:
        if(page.images()[0]['url'] is not None):
            data['boxart']=page.images()[0]['url']
    except:
        pass
    _extractCleanGenre(infobox,data)
    _extractCleanDataField('designer',infobox,data)
    _extractCleanDataField('programmer',infobox,data)
    _extractCleanDataField('composer',infobox,data)
    _extractCleanDataField('director',infobox,data)
    _extractCleanDataField('artist',infobox,data)
    _extractCleanDataField('writer',infobox,data)
    _extractCleanDataField('producer',infobox,data)
    return data

def _extractCleanDataField(field,infobox,data):
    if(field in infobox):
        cleanField = re.sub('\[+?|\]+?|\(.*?\)|.+?\|','',infobox[field])
        splitField = re.split('<.*?>|,',cleanField)
        data[field]=[item for item in splitField if not re.match("'+?",item)]

def _extractCleanGenre(infobox,data):
    if('genre' in infobox):
        cleanGenres = re.sub('\[\[.*?\||\]\]|\[\[|\sgame|\svideo\sgame','',infobox['genre'])
        allGenres = re.split('<.*?>|,',cleanGenres)
        data['genre']=allGenres
        
        
