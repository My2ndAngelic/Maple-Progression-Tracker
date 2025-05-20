import yaml
import requests
from bs4 import BeautifulSoup
import json
import re

def fetch_lara_skills():
    url = "https://maplestorywiki.net/w/Lara/Skills"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Raise an exception for bad status codes
        soup = BeautifulSoup(response.text, 'html.parser')
        
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
        
        # Process each section
        sections = soup.find_all(['h2', 'h3', 'h4'])
        current_section = None
        
        for section in sections:
            title = section.get_text(strip=True)
            
            # Find the table following this section header
            table = section.find_next('table', {'class': 'mw-collapsible'})
            if not table:
                continue
                
            # Process Hyper Skills
            if "Hyper" in title:
                for row in table.find_all('tr')[1:]:  # Skip header
                    cells = row.find_all(['th', 'td'])
                    if len(cells) < 2:
                        continue
                        
                    skill_name = cells[0].get_text(strip=True)
                    description = cells[1].get_text(strip=True).lower()
                    
                    if not skill_name or skill_name == "Skill Name":
                        continue
                    
                    # Determine if passive or active based on description and name
                    if ('passive' in description or 
                        any(x in skill_name.lower() for x in ['reinforce', 'extra strike', 'boss rush', 'enhance', 'persist'])):
                        skills['hyper']['passive'].append(skill_name)
                    else:
                        skills['hyper']['active'].append(skill_name)
            
            # Process 5th Job Skills
            elif "5th Job" in title:
                for row in table.find_all('tr')[1:]:  # Skip header
                    skill_name = row.find('th')
                    if skill_name and skill_name.get_text(strip=True) != "Skill Name":
                        skills['v'].append(skill_name.get_text(strip=True))
            
            # Process HEXA Skills
            elif "HEXA" in title:
                for row in table.find_all('tr')[1:]:  # Skip header
                    skill_name = row.find('th')
                    if not skill_name:
                        continue
                        
                    skill_name = skill_name.get_text(strip=True)
                    if not skill_name or skill_name == "Skill Name":
                        continue
                        
                    # Categorize based on skill name
                    if "Origin" in skill_name:
                        skills['hexa']['origin'].append(skill_name)
                    elif "Mastery" in skill_name:
                        skills['hexa']['mastery'].append(skill_name)
                    elif "Enhancement" in skill_name:
                        skills['hexa']['enhancement'].append(skill_name)
        
        # Ensure all skills are properly quoted
        def format_skills(skill_list):
            return [f'"{s}"' for s in skill_list]
        
        # Format all skill lists
        skills['hyper']['passive'] = format_skills(skills['hyper']['passive'])
        skills['hyper']['active'] = format_skills(skills['hyper']['active'])
        skills['v'] = format_skills(skills['v'])
        skills['hexa']['origin'] = format_skills(skills['hexa']['origin'])
        skills['hexa']['mastery'] = format_skills(skills['hexa']['mastery'])
        skills['hexa']['enhancement'] = format_skills(skills['hexa']['enhancement'])
        
        return skills
        
    except Exception as e:
        print(f"Error fetching skills: {str(e)}")
        return None

class SkillDumper(yaml.SafeDumper):
    def represent_scalar(self, tag, value, style=None):
        if tag == 'tag:yaml.org,2002:str' and isinstance(value, str):
            # Don't quote structural fields
            if value in ['jobs', 'jobName', 'faction', 'archetype', 'linkSkillMaxLevel', 
                        'mainstat', 'skill', 'hyper', 'v', 'hexa', 'passive', 'active', 
                        'origin', 'mastery', 'enhancement']:
                return super().represent_scalar(tag, value, None)
            # Quote everything else (skill names, etc.)
            return super().represent_scalar(tag, value, style='"')
        return super().represent_scalar(tag, value, style)
    
    def represent_sequence(self, tag, sequence, flow_style=None):
        # Convert None to empty list
        if sequence is None:
            return self.represent_sequence(tag, [], flow_style)
        return super().represent_sequence(tag, sequence, flow_style)

def update_lara_skills(yaml_file):
    # Read current YAML
    with open(yaml_file, 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)
    
    # Get new skills
    new_skills = fetch_lara_skills()
    if not new_skills:
        print("Failed to fetch new skills. Aborting update.")
        return
    
    # Update Lara's skills
    for job in data['jobs']:
        if job['jobName'] == 'Lara':
            job['skill'] = new_skills
            break
    
    # Write back to file
    with open(yaml_file, 'w', encoding='utf-8') as f:
        yaml.dump(data, f, allow_unicode=True, sort_keys=False, 
                 default_flow_style=False, Dumper=SkillDumper)
    
    print("Successfully updated Lara's skills from the wiki")

if __name__ == "__main__":
    yaml_file = '../data/joblist.yaml'
    update_lara_skills(yaml_file)
