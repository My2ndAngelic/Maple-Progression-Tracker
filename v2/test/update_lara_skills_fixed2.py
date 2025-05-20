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
   
    for section in content.find_all(['h2', 'h3']):
        title_span = section.find('span', {'class': 'mw-headline'})
        if not title_span:
            continue
        section_title = title_span.get_text().strip()
        section_id = title_span.get('id', '')
        # print(f"Processing section: {section_title} (ID: {section_id})")

        match section_id:
            case "Hyper_Skills":
                print("Found Hyper Skills section")
            case "Class-Specific_Skills":
                print("Found V class specific skills section")
            case "Class-Specific_Skills_2":
                print("Found Hexa class specific skills section")
            case "Mastery_Skills":
                print("Found Hexa mastery skills section")
            case "Enhancements_2":
                print("Found Hexa enhancement skills section")
           
    return skills

if __name__ == "__main__":
    fetch_lara_skills()
    yaml_file = './data/joblist.yaml'
    # update_lara_skills(yaml_file)
    # print("\nAll operations completed successfully")
