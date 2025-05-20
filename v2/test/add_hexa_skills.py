#!/usr/bin/env python3
import yaml
import requests
from bs4 import BeautifulSoup
import re
import time

def get_wiki_name(class_name):
    """Convert class name to wiki URL format"""
    # Special cases mapping
    special_cases = {
        "Arch Mage (Ice/Lightning)": "Arch_Mage_(Ice,_Lightning)",
        "Arch Mage (Fire/Poison)": "Arch_Mage_(Fire,_Poison)",
        # Add more special cases as needed
    }
    
    if class_name in special_cases:
        return special_cases[class_name]
    
    return class_name.replace(" ", "_").replace("(", "").replace(")", "").replace("/", "")

def get_v_skills(class_name):
    """
    Scrape V skills from MapleStory Wiki for a given class.
    Returns a list of class-specific V skill names.
    """
    wiki_name = get_wiki_name(class_name)
    url = f"https://maplestorywiki.net/w/{wiki_name}/Skills"
    
    # Add delay to be nice to the server
    time.sleep(1)
    
    try:
        response = requests.get(url)
        if response.status_code != 200:
            print(f"Failed to fetch {class_name} skills: {response.status_code}")
            return None
            
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find V Skills section
        v_section = None
        for h2 in soup.find_all('h2'):
            if 'V Skills' in h2.get_text():
                v_section = h2
                break
        
        if not v_section:
            print(f"No V skills section found for {class_name}")
            return None
        
        # Find the class-specific skills section
        class_specific = None
        for h3 in v_section.find_all_next('h3'):
            if 'Class-Specific Skills' in h3.get_text():
                class_specific = h3
                break
            
        if not class_specific:
            print(f"No class-specific V skills found for {class_name}")
            return None
            
        # Get the table after the Class-Specific Skills heading
        skills_table = class_specific.find_next('table')
        if not skills_table:
            print(f"No skills table found for {class_name}")
            return None
            
        v_skills = []
        # Find all images with skill names in their alt text
        skill_images = skills_table.find_all('img', alt=True)
        for img in skill_images:
            skill_name = img['alt'].strip()
            if skill_name and not skill_name.startswith('Level') and not any(x in skill_name.lower() for x in ['icon', 'passive']):
                v_skills.append(skill_name)
        
        return v_skills
        
    except Exception as e:
        print(f"Error processing {class_name} V skills: {str(e)}")
        return None

def update_yaml_file(file_path):
    """
    Update the YAML file with V skills and HEXA skills for each class
    """
    with open(file_path, 'r') as file:
        data = yaml.safe_load(file)
    
    # Test with Lara first
    for job in data['jobs']:
        if job['jobName'] == "Lara":
            print(f"Processing {job['jobName']} V skills...")
            v_skills = get_v_skills(job['jobName'])
            if v_skills:
                job['vskills'] = [f'"{skill}"' for skill in v_skills]  # Quote the skill names
                print(f"Updated V skills for {job['jobName']}: {v_skills}")
            break
    
    # Write the updated data back to the file
    with open(file_path, 'w') as file:
        yaml.dump(data, file, default_flow_style=False, allow_unicode=True, sort_keys=False)

if __name__ == "__main__":
    yaml_file = "../data/joblist.yaml"
    update_yaml_file(yaml_file)
