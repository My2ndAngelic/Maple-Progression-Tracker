import yaml
import requests
from bs4 import BeautifulSoup
import sys

def fetch_lara_skills():
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    url = "https://maplestorywiki.net/w/Lara/Skills"
    print(f"\nAccessing: {url}")
    response = requests.get(url, headers=headers)
    if not response.ok:
        print("Failed to access skills page")
        sys.exit(1)
        
    soup = BeautifulSoup(response.content, 'html.parser')
    
    skills = {
        'hyper': {
            'passive': [],
            'active': []
        },
        'v': [],
        'hexa': {
            'origin': [],
            'mastery': [],
            'enhancement': []
        }
    }

    content = soup.find('div', {'id': 'mw-content-text'})
    if not content:
        return skills
    
    for section in content.find_all('h2'):
        print(f"H2: {section.get_text(strip=True)}")
        sibling = section.find_next_sibling()
        while sibling and sibling.name != 'h2':
            if sibling.name == 'h3':
                print(f"LMAO: {sibling.get_text(strip=True)}")
            sibling = sibling.find_next_sibling()
           
    return skills

if __name__ == "__main__":
    fetch_lara_skills()
    yaml_file = './data/joblist.yaml'
    # update_lara_skills(yaml_file)
    # print("\nAll operations completed successfully")
