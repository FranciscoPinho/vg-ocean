import pandas as pd
import db_insertion_utils as db_utils

def scrape_megadrive_games():
    """Scrapes Mega Drive games info from wikipedia lists"""
    url = r'https://en.wikipedia.org/wiki/List_of_Sega_Genesis_games'
    tables = pd.read_html(url) # Returns list of all tables on page
    games = tables[1]
    print(games)


def main():
    """Entry Point"""
    db_utils.connectDatabase()
    scrape_megadrive_games()
   
if __name__ == '__main__':
    main()     
