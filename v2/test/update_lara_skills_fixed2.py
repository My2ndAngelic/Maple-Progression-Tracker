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
    print("Successfully parsed webpage")
    
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
        """Find the next wikitable after an element"""
        current = elem.next_sibling
        while current:
            if isinstance(current, str):
                current = current.next_sibling
                continue
            if current.name == 'table' and 'wikitable' in current.get('class', []):
                return current
            current = current.next_sibling
        return None

    def extract_skill_name(cell):
        """Extract skill name from link title if it's a valid skill"""
        # Skip cells with no links
        if not cell.find('a'):
            return None
            
        # Find all links (image + skill link usually)
        links = cell.find_all('a')
        
        # Look for non-image link with a title
        for link in links:
            href = link.get('href', '').lower()
            if not href.startswith('/w/file:') and link.get('title'):
                name = link['title'].strip()
                
                # Skip if it looks like a description rather than a skill name
                if any(x in name.lower() for x in [
                    'mode', ' - ', 'boost', 'skills', 'level',
                    'cooldown', 'duration', 'damage', 'effect',
                    'grow an enormous tree', 'tree', 'grows',
                    'increases', 'reduces', 'enhances', 'improves'
                ]):
                    continue
                    
                # Skip if it's too long to be a skill name (likely a description)
                if len(name.split()) > 4:
                    continue
                    
                return name
                
        return None

    def determine_skill_type(row):
        """Determine if a row contains passive or active skills"""
        # Check first cell for type indicator
        first_cell = row.find(['th', 'td'])
        if first_cell:
            text = first_cell.get_text().strip().lower()
            if 'passive' in text:
                return 'passive'
            if 'active' in text:
                return 'active'
        return None

    found_skills = {'hyper': set(), 'v': set(), 'hexa': set()}
    found_in_v_section = False
    current_type = 'active'  # Default type for skills
    
    for section in content.find_all(['h2', 'h3']):
        title_span = section.find('span', {'class': 'mw-headline'})
        if not title_span:
            continue
            
        section_title = title_span.get_text().strip()
        section_id = title_span.get('id', '')  # Get the section ID
        print(f"\nProcessing section: {section_title} (ID: {section_id})")
        
        # Track if we're in the V Skills section
        if section_id == "V_Skills":
            found_in_v_section = True
            
        # Hyper Skills - look for the specific section ID
        if section_id == "Hyper_Skills":
            table = find_next_table(section)
            
            while table:
                # Look at the first row which contains type and skill name
                first_row = table.find('tr')
                if first_row:
                    first_cell = first_row.find('th')
                    if first_cell:
                        text = first_cell.get_text().strip().lower()
                        if text == 'passive':
                            current_type = 'passive'
                        elif text == 'active':
                            current_type = 'active'
                            
                        # The skill name is in the second cell's link
                        name_cell = first_row.find_all('th')[1] if len(first_row.find_all('th')) > 1 else None
                        if name_cell:
                            name = extract_skill_name(name_cell)
                            if name and name not in found_skills['hyper']:
                                found_skills['hyper'].add(name)
                                print(f"Found Hyper {current_type} skill: {name}")
                                target_list = skills['hyper'][current_type]
                                if name not in target_list:
                                    target_list.append(name)
                                    
                # Move to next table if it exists
                next_table = find_next_table(table)
                if not next_table:
                    break
                table = next_table
                
        # V Skills        
        elif section_id == "Class-Specific_Skills" and found_in_v_section:
            table = find_next_table(section)
            
            while table:
                for row in table.find_all('tr'):
                    for cell in row.find_all(['th', 'td']):
                        name = extract_skill_name(cell)
                        if name and name not in found_skills['v']:
                            # Skip common/shared skills and HEXA skills
                            if any(x in name.lower() for x in [
                                'decent', 'rope lift', 'erda nova', 'matrix',
                                'grow', 'tree', 'effect', 'enhanced',
                                'shared', 'common', 'boost', 'hexa'
                            ]):
                                continue
                            
                            # Make sure it's a V skill and not a HEXA skill
                            if not name.startswith('HEXA'):
                                found_skills['v'].add(name)
                                print(f"Found V skill: {name}")
                                if name not in skills['v']:
                                    skills['v'].append(name)
                                    
                # Move to next table if exists
                next_table = find_next_table(table)
                if not next_table:
                    break
                table = next_table
                
        # HEXA Skills
        elif section_id == "HEXA_Skills":
            found_in_v_section = False  # No longer in V skills section
            current_section = 'origin'
            table = find_next_table(section)
            
            while table:
                # Check section headers
                prev_p = table.find_previous('p')
                if prev_p:
                    text = prev_p.get_text().lower().strip()
                    if 'master' in text or 'mastery' in text:
                        current_section = 'mastery'
                    elif 'enhance' in text:
                        current_section = 'enhancement'
                    elif 'origin' in text or 'class' in text:
                        current_section = 'origin'
                
                # Look for skills
                for row in table.find_all('tr'):
                    for cell in row.find_all(['th', 'td']):
                        name = extract_skill_name(cell)
                        if name and name not in found_skills['hexa']:
                            if not any(x in name.lower() for x in ['grow', 'tree', 'effect']):
                                found_skills['hexa'].add(name)
                                print(f"Found HEXA {current_section} skill: {name}")
                                target_list = skills['hexa'][current_section]
                                if name not in target_list:
                                    target_list.append(name)
                            
                # Move to next table if exists
                next_table = find_next_table(table)
                if not next_table:
                    break
                table = next_table
    
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
    with open(yaml_file, 'r', encoding='utf-8') as f:
        content = f.read()
    data = yaml.safe_load(content)
    
    # Find and update Lara's skills
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
