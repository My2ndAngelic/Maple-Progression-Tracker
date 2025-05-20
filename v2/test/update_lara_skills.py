import yaml
import requests
from bs4 import BeautifulSoup
import sys
import time
import re

def clean_skill_name(name):
    """Clean skill name by removing unwanted patterns and normalizing spaces"""
    name = ' '.join(name.strip().split())
    # Remove any [note X] references
    name = re.sub(r'\[note \d+\]', '', name)
    # Remove any level info after skill name
    name = re.sub(r'\s*\(Level \d+\)', '', name)
    name = re.sub(r'\s*Lv\.\s*\d+', '', name)
    # Remove anything in parentheses at the end
    name = re.sub(r'\s*\([^)]*\)\s*$', '', name)
    return name.strip()

def is_valid_skill_name(name):
    """Check if a string is a valid skill name"""
    if not name:
        return False
        
    invalid_names = {
        'Active', 'Passive', 'Master Level', 'Description', 'Level', 'Level Requirement',
        'Final Damage Increase per level', 'Skills', 'Decent', 'Rope Lift', 'Erda Nova',
        'Beginner', 'Job Level', 'First Job', 'Second Job', 'Third Job', 'Fourth Job',
        'Hyper Skills', 'V Skills', 'HEXA Skills', 'Shared Skills', 'Class-Specific Skills',
        'Enhancements', 'Mastery Skills', 'Origin', 'Mastery', 'Enhancement'
    }
    
    # Check if it's one of the invalid names
    if name in invalid_names:
        return False
        
    # Check if it's just a number or mostly numbers
    if name.replace(' ', '').isdigit():
        return False
        
    # Check if it's too short (likely not a skill name)
    if len(name) < 3:
        return False
        
    return True

def extract_skill_name(element):
    """Extract skill name from a table cell, prioritizing links"""
    # Try to find the skill name in a link first
    link = element.find('a')
    if link and 'title' in link.attrs:
        name = clean_skill_name(link['title'])
        if is_valid_skill_name(name):
            return name
    elif link:
        name = clean_skill_name(link.get_text())
        if is_valid_skill_name(name):
            return name
    # If no link found, use the cell text
    name = clean_skill_name(element.get_text())
    if is_valid_skill_name(name):
        return name
    return None

def fetch_lara_skills():
    def get_skill_page_content():
        pages = [
            "https://maplestorywiki.net/w/Lara",
            "https://maplestorywiki.net/w/Lara/Skills",
            "https://maplestorywiki.net/w/Lara_Skills"
        ]
        
        for url in pages:
            print(f"Trying URL: {url}")
            try:
                response = requests.get(url, headers=headers, timeout=30)
                if response.ok:
                    print(f"Successfully accessed {url}")
                    return BeautifulSoup(response.content, 'html.parser')
            except Exception as e:
                print(f"Error accessing {url}: {e}")
                continue
        
        print("Could not access any valid skill pages")
        sys.exit(1)
    
    urls_tried = []
    soup = get_skill_page_content()
    print(f"Fetching skills from {url}")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        print("Successfully connected to the wiki")
    except Exception as e:
        print(f"Error accessing {url}: {e}")
        sys.exit(1)
    
    soup = BeautifulSoup(response.content, 'html.parser')
    print("Successfully parsed the webpage")
    
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
        print("Could not find main content")
        return skills

    def find_next_table(elem):
        """Find the next table after an element"""
        current = elem.next_sibling
        while current:
            if isinstance(current, str):
                current = current.next_sibling
                continue
            if current.name == 'table' and 'wikitable' in current.get('class', []):
                return current
            current = current.next_sibling
        return None

    for section in content.find_all(['h2', 'h3']):
        title_span = section.find('span', class_='mw-headline')
        if not title_span:
            continue
            
        section_title = title_span.get_text().strip()
        print(f"\nProcessing section: {section_title}")
        
        # Hyper Skills
        if "Hyper Skills" in section_title:
            # Find all tables that follow this section until the next section
            table = find_next_table(section)
            found_skills = set()
            while table:
                skill_name = None
                
                # Look for both th and td cells as skill names can be in either
                for cell in table.find_all(['th', 'td']):
                    text = cell.get_text().strip()
                    name = extract_skill_name(cell)
                    
                    if name and 'Mode' not in name and not name.startswith('Dragon') and ' - ' not in name:
                        skill_name = name
                        if skill_name and skill_name not in found_skills:
                            found_skills.add(skill_name)
                            print(f"Found Hyper skill: {skill_name}")
                            # If it contains certain keywords, it's considered an active skill
                            if any(x in text.lower() for x in ['summon', 'active', 'cooldown', 'duration']):
                                skills['hyper']['active'].append(skill_name)
                            else:
                                skills['hyper']['passive'].append(skill_name)
                
                # Move to the next table in this section
                table = find_next_table(table)
                
            print(f"Added {len(skills['hyper']['passive'])} passive and {len(skills['hyper']['active'])} active Hyper skills")
        
        # V Skills
        elif "5th Job Skills" in section_title or "V Matrix" in section_title:
            table = find_next_table(section)
            found_skills = set()
            while table:
                for row in table.find_all('tr'):
                    # Look at both th and td cells
                    for cell in row.find_all(['th', 'td']):
                        skill_name = extract_skill_name(cell)
                        if skill_name and skill_name not in found_skills:
                            if not any(x in skill_name.lower() for x in ['skills', 'decent', 'rope lift', 'erda nova', 'matrix']):
                                found_skills.add(skill_name)
                                print(f"Found V skill: {skill_name}")
                                skills['v'].append(skill_name)
                table = find_next_table(table)
        
        # HEXA Skills
        elif "HEXA Skills" in section_title or "6th Job Skills" in section_title:
            table = find_next_table(section)
            current_section = 'origin'  # Default to origin skills first
            found_skills = set()
            
            while table:
                # Check for section headers that might be before the table
                prev_p = table.find_previous('p')
                if prev_p:
                    text = prev_p.get_text().lower().strip()
                    if 'master' in text or 'mastery' in text:
                        current_section = 'mastery'
                    elif 'enhance' in text:
                        current_section = 'enhancement'
                    elif 'origin' in text or 'class' in text:
                        current_section = 'origin'
                
                # Process skills in current section
                for row in table.find_all('tr'):
                    for cell in row.find_all(['th', 'td']):
                        skill_name = extract_skill_name(cell)
                        if skill_name and skill_name not in found_skills:
                            if not any(x in skill_name.lower() for x in ['skills', 'level', 'passive', 'active']):
                                found_skills.add(skill_name)
                                print(f"Found HEXA {current_section} skill: {skill_name}")
                                if skill_name not in skills['hexa'][current_section]:
                                    skills['hexa'][current_section].append(skill_name)
                
                # Move to the next table
                table = find_next_table(table)
    
    # Print summary
    print("\nSkill Summary:")
    print(f"Hyper Passive Skills: {len(skills['hyper']['passive'])}")
    print(f"Hyper Active Skills: {len(skills['hyper']['active'])}")
    print(f"V Skills: {len(skills['v'])}")
    print(f"HEXA Origin Skills: {len(skills['hexa']['origin'])}")
    print(f"HEXA Mastery Skills: {len(skills['hexa']['mastery'])}")
    print(f"HEXA Enhancement Skills: {len(skills['hexa']['enhancement'])}")
    
    return skills

def update_lara_skills(yaml_file):
    print(f"\nReading YAML file: {yaml_file}")
    # Read the current YAML file
    with open(yaml_file, 'r', encoding='utf-8') as f:
        content = f.read()
    data = yaml.safe_load(content)
    
    # Find Lara in the jobs list and update skills
    for job in data['jobs']:
        if job['jobName'] == 'Lara':
            print("Found Lara in joblist.yaml")
            skills = fetch_lara_skills()
            job['skill'] = skills
            print("Updated Lara's skills")
            break
    
    class ListIndentDumper(yaml.SafeDumper):
        def increase_indent(self, flow=False, *args, **kwargs):
            return super().increase_indent(flow=flow, indentless=False)

        def represent_scalar(self, tag, value, style=None):
            if isinstance(value, str):
                # Don't quote certain fields
                if value in ['jobs', 'jobName', 'faction', 'archetype', 'linkSkillMaxLevel',
                           'mainstat', 'skill', 'hyper', 'v', 'hexa', 'passive', 'active',
                           'origin', 'mastery', 'enhancement']:
                    return super().represent_scalar(tag, value, None)
                # Quote all skill names
                return super().represent_scalar(tag, value, style='"')
            return super().represent_scalar(tag, value, style)

        def represent_sequence(self, tag, sequence, flow_style=None):
            # Force list items to use block style with dashes
            return super().represent_sequence(tag, sequence, flow_style=False)

    print("\nWriting updated YAML file...")
    # Write back with custom formatting
    with open(yaml_file, 'w', encoding='utf-8') as f:
        yaml_content = yaml.dump(data, Dumper=ListIndentDumper, allow_unicode=True, 
                               default_flow_style=False, sort_keys=False)
        # Remove extra newlines between fields
        yaml_content = '\n'.join(line for line in yaml_content.splitlines() if line.strip())
        f.write(yaml_content)
    print("Successfully wrote YAML file")

if __name__ == "__main__":
    yaml_file = '../data/joblist.yaml'
    update_lara_skills(yaml_file)
    print("\nAll operations completed successfully")
