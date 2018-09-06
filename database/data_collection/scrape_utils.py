import wikipedia
import re
from fuzzywuzzy import fuzz
import requests
import bs4
import wptools
from itertools import cycle
from lxml.html import fromstring
import pandas as pd

#credits are designer programmer composer director artist writer producer
def getGamefaqsDescAndImage(title,platform,proxylist):
        proxy_pool = cycle(proxylist)
        if(len(proxylist)==0):
            print("No proxies found")
        headers = {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.84 Safari/537.36'
        }
        info=None
        for i in range(0,len(proxylist)):
            proxy = next(proxy_pool)
            proxies={
                "http": proxy, 
                "https": proxy
            }
            try:
                text = requests.get('https://gamefaqs.gamespot.com/search/index.html?game='+title,headers=headers,proxies=proxies,timeout=15).text
                soup= bs4.BeautifulSoup(text,'lxml')
                if('503 Service Temporarily Unavailable' in text):
                    raise Exception('invalid proxy')
                info=soup.find_all("div",{"class":"sr_product_name"},limit=100)
                if(info==[]):
                    print(soup)
                    continue
                break
            except Exception as e:
                print("Request "+str(i)+" "+str(e))
                pass

        if(info is None):
            print("No search results found on gamefaqs")
            return

        for count in range(0,len(info)):
            href=re.sub('.*?href=\"|\".*?</div>','',str(info[count]))
            linkPieces=re.match(r'/'+platform.lower()+r'/',href)
            if(linkPieces is not None):
                #Go to game page
                 for i in range(0,len(proxylist)):
                    proxy = next(proxy_pool)
                    proxies={
                        "http": proxy, 
                        "https": proxy
                    }
                    try:
                        text = requests.get('https://gamefaqs.gamespot.com'+href,headers=headers,proxies=proxies,timeout=15).text
                        soup= bs4.BeautifulSoup(text,'lxml')
                        titleHTML=soup.find("a",{"href":href})
                        gamefaqsTitle=titleHTML.contents[0]
                        if(fuzz.ratio(gamefaqsTitle,title)>75 or title in gamefaqsTitle or gamefaqsTitle in title):
                            descriptionHTML=soup.find("div",{"class":"desc"})
                            data=dict()
                            data['desc']=descriptionHTML.contents[0]
                            info=soup.find("img",{"class":"boxshot"})
                            data['img']=re.sub('thumb','front',info['src'])
                            return data
                        print("No match, found "+gamefaqsTitle+" but wanted "+title)
                        return -1
                    except Exception as e:
                        print("Request "+str(i)+" "+str(e))
                        pass
        return -1
    

def findSuitableProxy():
    url = 'https://free-proxy-list.net/'
    response = requests.get(url)
    parser = fromstring(response.text)
    proxies = set()
    for i in parser.xpath('//tbody/tr')[:20]:
        if i.xpath('.//td[7][contains(text(),"yes")]'):
            #Grabbing IP and corresponding PORT
            proxy = ":".join([i.xpath('.//td[1]/text()')[0], i.xpath('.//td[2]/text()')[0]])
            proxies.add(proxy)
    return proxies

def wikipediaInfoboxScraping(cleanTitle):
    selectedpageID=_searchPageID(cleanTitle)
    infoboxData=_extractInfoboxData(selectedpageID,cleanTitle)
    if(infoboxData==-1):
        subtitle=str.strip(re.sub('.*?\:','',cleanTitle))
        selectedpageID=_searchPageID(subtitle,subtitle=True)
        if(selectedpageID is None):
            return
        infoboxData=_extractInfoboxData(selectedpageID,subtitle)
    if(infoboxData!=-1):
        return infoboxData

def _searchPageID(title,subtitle=False):
    lastDigitsTitle = re.search('I+|\d{0,2}', title[::-1])
    if(lastDigitsTitle!=None and not str.isdigit(title)):
        searchResults = requests.get('https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&utf8=1&srsearch='+title)
    else:
        searchResults = requests.get('https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&utf8=1&srsearch='+title+' video game')
    searchIndex=0
    bestMatch=0
    try:
        selectedpageID=searchResults.json()['query']['search'][0]['pageid']
    except:
        return
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
                
                lastDigitsSearch = re.search('I+|\d{0,2}', searchTitle[::-1])
                if(lastDigitsTitle==None and lastDigitsSearch!=None):
                    localMatch=localMatch-30
                elif(lastDigitsTitle!=None and lastDigitsSearch==None):
                    localMatch=localMatch-30
                elif(lastDigitsTitle==None and lastDigitsSearch==None):
                    pass
                elif(lastDigitsSearch.group()!=lastDigitsTitle.group()):
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
    _extractCleanDataField('developer',infobox,data)
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
        if('cn|date' in infobox[field]):
            postmatch= re.sub('\{\{.*?\}\}','',infobox[field])
            cleanField = re.sub('\[+?|\]+?|\(.*?\)|.+?\|','',postmatch)
        else:
            cleanField = re.sub('\[+?|\]+?|\(.*?\)|.+?\||}}','',infobox[field])
        splitField = re.split('<.*?>|,|*',cleanField)
        data[field]=[item for item in splitField if not re.match("'+?",item)]

def _extractCleanGenre(infobox,data):
    if('genre' in infobox):
        if('cn|date' in infobox['genre']):
            postmatch= re.sub('\{\{.*?\}\}','',infobox['genre'])
            cleanGenres = re.sub('\[\[.*?\||\]\]|\[\[|\sgame|\svideo\sgame','',postmatch)
            allGenres = re.split('<.*?>|,|\s',cleanGenres)
        else:
            cleanGenres = re.sub('\[\[.*?\||\]\]|\[\[|\sgame|\svideo\sgame|\(|\)','',infobox['genre'])
            allGenres = re.split('<.*?>|,',cleanGenres)
        data['genre']=allGenres
