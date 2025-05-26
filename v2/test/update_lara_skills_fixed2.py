import yaml
import requests
from bs4 import BeautifulSoup
import sys
import re
import time
import os

def fetch_lara_skills():
    # For testing, use the local HTML file
    with open('v2/test/skill_html/blaze_wizard_skills.html', 'r', encoding='utf-8') as file:
        html = file.read()
    soup = BeautifulSoup(html, 'html.parser')
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
        section_title = section.get_text(strip=True)
        match section_title:
            case "Hyper Skills":
                hyper_skills = find_hyper_skill(section)
                skills['hyper']['passive'] = hyper_skills['passive']
                skills['hyper']['active'] = hyper_skills['active']
            case "V Skills":
                v_skills = find_v_skills(section)
                skills['v'] = v_skills['v']
            case "HEXA Skills":
                hexa_skills = find_hexa_skills(section)
                skills['hexa']['origin'] = hexa_skills['origin']
                skills['hexa']['mastery'] = hexa_skills['mastery']
                skills['hexa']['enhancement'] = hexa_skills['enhancement']
    return skills

def find_hyper_skill(section):
    skills = {
        'passive': [],
        'active': []
    }
    # Find all tables after this h2 until the next h2
    sibling = section.find_next_sibling()
    while sibling and sibling.name != 'h2':
        if sibling.name == 'table' and 'wikitable' in sibling.get('class', []):
            tbody = sibling.find('tbody')
            if not tbody:
                sibling = sibling.find_next_sibling()
                continue
            first_tr = tbody.find('tr')
            if not first_tr:
                sibling = sibling.find_next_sibling()
                continue
            ths = first_tr.find_all('th')
            if len(ths) < 2:
                sibling = sibling.find_next_sibling()
                continue
            skill_type = ths[0].get_text(strip=True).lower()
            # Only accept 'active' or 'passive'
            if skill_type not in ['active', 'passive']:
                sibling = sibling.find_next_sibling()
                continue
            # Find the <a> tag with the skill name in the second th
            skill_link = ths[1].find('a', title=True)
            if skill_link:
                skill_name = skill_link['title']
                # Always wrap in double quotes for YAML
                skills[skill_type].append(skill_name)
        sibling = sibling.find_next_sibling()
    return skills

def find_skills_under_h3(section, section_name):
    skill_list = []
    # Find the h3 element that matches the section_name
    target_h3 = None
    for h3 in section.find_next_sibling().find_all_next('h3'):
        if h3.get_text() == section_name:
            target_h3 = h3
            break
    
    if not target_h3:
        return skill_list
    
    # Process elements after the target h3 until we hit another h3
    current = target_h3.find_next_sibling()
    while current and current.name != 'h3':
        if (current.name == 'table' and 
            'wikitable' in current.get('class', []) and 
            'mw-collapsible' in current.get('class', []) and 
            'mw-collapsed' in current.get('class', [])):
            
            links = current.find_all('a')
            if links:
                skill_list.append(links[-1].get_text(strip=True))
        
        current = current.find_next_sibling()

    return skill_list

def find_v_skills(section):
    return {'v': find_skills_under_h3(section, "Class-Specific Skills")}

def find_hexa_skills(section):
    return {'origin': find_skills_under_h3(section, "Class-Specific Skills"),
            'mastery': find_skills_under_h3(section, "Mastery Skills"),
            'enhancement': find_skills_under_h3(section, "Enhancements")
            }


# def update_lara_skills(yaml_file):
#     # Load YAML as raw text to preserve formatting and nulls
#     with open(yaml_file, 'r', encoding='utf-8') as f:
#         original_yaml = f.read()
#     data = yaml.safe_load(original_yaml)
#     lara_skills = fetch_lara_skills()
    # Only update Lara's entry in the in-memory data
    # for job in data['jobs']:
    #     if job.get('jobName') == 'Lara':
    #         if lara_skills['hyper']['passive']:
    #             job['skill']['hyper']['passive'] = lara_skills['hyper']['passive']
    #         if lara_skills['hyper']['active']:
    #             job['skill']['hyper']['active'] = lara_skills['hyper']['active']
    #         break
    # print(lara_skills)
    # Now, update only Lara's block in the original YAML text
    # def yaml_list_block(key, values, indent=0):
    #     if not values:
    #         return f'{key}: []'
    #     lines = [f'{key}:']
    #     for v in values:
    #         lines.append(f'  - {v}')
    #     return '\n'.join(lines)
    # # Find Lara's block
    # lara_block = re.search(r'(?ms)^- jobName: Lara\n.*?(?=^- jobName: |\Z)', original_yaml)
    # if lara_block:
    #     lara_yaml = lara_block.group(0)
    #     # Replace passive and active blocks only
    #     if lara_skills['hyper']['passive']:
    #         lara_yaml = re.sub(r'(passive:)(.*?)(?=^\s*active:|^\s*v:|^\s*hexa:|\Z)',
    #             yaml_list_block('passive', lara_skills['hyper']['passive'], indent=0),
    #             lara_yaml, flags=re.M|re.S)
    #     if lara_skills['hyper']['active']:
    #         lara_yaml = re.sub(r'(active:)(.*?)(?=^\s*v:|^\s*hexa:|\Z)',
    #             yaml_list_block('active', lara_skills['hyper']['active'], indent=0),
    #             lara_yaml, flags=re.M|re.S)
    #     # Replace in the original YAML
    #     new_yaml = original_yaml[:lara_block.start()] + lara_yaml + original_yaml[lara_block.end():]
    #     with open(yaml_file, 'w', encoding='utf-8') as f:
    #         f.write(new_yaml)
    #     print('Updated Lara skills in', yaml_file)
    # else:
        # print('Lara block not found, no changes made.')

if __name__ == "__main__":
    # yaml_file = './v2/data/joblist.yaml'
    # print(os.getcwd())
    fetch_lara_skills()
    # print(fetch_lara_skills())
    # update_lara_skills(yaml_file)
    print("\nAll operations completed successfully")
