import yaml
import requests
from bs4 import BeautifulSoup
import sys
import time
import re

def clean_skill_name(name):
    """Clean skill name by removing unwanted pa    # Try to find skill links after any images
    links = element.find_all('a')
    skill_link = None
    for link in links:
        href = link.get('href', '').lower()
        # Skip image links
        if not href.startswith('/w/file:'):
            skill_link = link
            break
            
    if skill_link and skill_link.get('title'):
        title = skill_link['title']
        print(f"DEBUG: Found link with title: {title}")
        if title and title not in prev_names:
            # Only return certain titles
            if not any(x in title.lower() for x in [
                'mode', ' - ', 'boost', 'skills', 'level', 
                'cooldown', 'duration', 'damage', 'effect'
            ]):
                if skill_type:
                    print(f"DEBUG: Returning skill with type: {title} ({skill_type})")
                    return (title, skill_type)
                print(f"DEBUG: Returning skill: {title}")
                return titlemalizing spaces"""
    if not name or len(name) < 3:
        return None

    name = ' '.join(name.strip().split())
    
    # Early return for strings that look like stats/damage/descriptions
    if re.match(r'^[-+]?\d+%?\s*(?:Damage|Attack|HP|MP)', name) or \
       re.match(r'^(?:,|\.)+\s*(?:Cooldown|invincible|casting|while|when)', name.lower()):
        return None
    
    # Remove long descriptive text after commas or periods
    parts = re.split(r'\s*[,.]\s*', name)
    if parts:
        name = parts[0]  # Keep only the first part before any comma or period
        
        # If the first part is too short or looks like a fragment, try the next non-empty part
        if len(name.strip()) < 3:
            for part in parts[1:]:
                if len(part.strip()) > 3 and not re.match(r'^(?:Duration|Cooldown|Effect|while|when)', part.strip(), re.I):
                    name = part
                    break
    
    # Remove stat variations and effects
    name = re.sub(r'\s*[-+]?\d+%?\s*(?:Damage|HP|MP|EXP|Drop Rate|Critical|Final Damage)', '', name)
    name = re.sub(r'\s*[-+]?\d+\s*(?:sec|min|hour)', '', name)
    name = re.sub(r'\s*\d+\s*(?:hits?|times?|attacks?)', '', name)
    name = re.sub(r'\s*Max\s+(?:HP|MP|Damage|Targets?|Enemies?)\s*[-+]?\d+%?', '', name)
    
    # Remove skill conditions and states
    name = re.sub(r'\s*(?:upon|while|when|during)\s+.*', '', name)
    name = re.sub(r'\s*becomes?\s+.*', '', name)
    name = re.sub(r'\s*if\s+.*', '', name)
    name = re.sub(r'\s*and\s+.*', '', name)
    
    # Remove common descriptive fragments
    name = re.sub(r'\s*(?:that|to|can|will|for)\s+.*', '', name)
    name = re.sub(r'\s*(?:with|by|from)\s+.*', '', name)
    
    # Remove anything in parentheses and brackets
    name = re.sub(r'\s*[\[(].*?[\])]', '', name)
    
    # Remove numeric info and level variations
    name = re.sub(r'\s*(?:Level|Lv\.|LV)\s*\d+(?:\s*[-~]\s*\d+)?', '', name)
    name = re.sub(r'\s*\d+(?:st|nd|rd|th)\s+', '', name)
    name = re.sub(r'\s*#\d+', '', name)
    
    # Remove trailing punctuation/spaces/dots
    name = re.sub(r'[.,;:]+\s*$', '', name)
    name = name.strip()
    
    # Final validation
    if not name or len(name) < 3 or name.lower() in ['the', 'and', 'for', 'with', 'cooldown', 'duration', 'damage']:
        return None
        
    return name

def is_valid_skill_name(name):
    """Check if a string is a valid skill name"""
    if not name or len(name) < 3:
        return False
        
    # Common words that appear in skill descriptions but aren't skills themselves
    invalid_names = {
        # General categories and headers
        'Active', 'Passive', 'Master Level', 'Description', 'Level', 'Level Requirement',
        'Skills', 'Decent', 'Rope Lift', 'Erda Nova', 'Beginner', 'Job Level',
        'First Job', 'Second Job', 'Third Job', 'Fourth Job', 'Hyper Skills', 
        'V Skills', 'HEXA Skills', 'Shared Skills', 'Class-Specific Skills',
        'Enhancements', 'Mastery Skills', 'Origin', 'Mastery', 'Enhancement', 'Skill',
        
        # Stats and effects
        'Effect', 'Boost', 'Ignored Enemy DEF', 'Damage', 'Boss Damage', 'Max Targets',
        'Final Damage', 'Attack', 'Normal Enemy', 'Boss', 'Invincible', 'Cooldown',
        'Duration', 'Critical Rate', 'Critical Damage', 'Status Resistance',
        
        # Summons and spirits
        'Cyclic Ring', 'Mountain Ridge', 'Land spirits', 'Lotus Summon', 'Group Summon',
        'Mountain Spirit', 'Wind Spirit', 'River Spirit', 'Spirit Summon', 'Summon Effect',
        
        # Common fragments
        'The', 'And', 'For', 'With', 'Skill Cooldown', 'Casting Time', 'Cast Time',
        'Casting Delay', 'Cast Delay', 'Essence Sprinkle Boost', 'Wakeup Call Boost',
        'Mountain Kid Boost', 'Mountain Seeds Boost', 'Vine Coil Boost',
        'Big Stretch Boost', 'Land\'s Connection Boost', 'Surging Essence Boost',
        'Winding Mountain Ridge Boost', 'Dragon Vein Skill'
    }
    
    # Split by common delimiters and check first real word
    parts = re.split(r'[,.:;\s]+', name)
    first_word = next((p for p in parts if p and p.lower() not in ['the', 'a', 'an']), '').lower()
    
    # Return false if first real word is invalid
    if not first_word or first_word.isdigit() or first_word in {
        'while', 'when', 'upon', 'after', 'during', 'if', 'then', 'adds', 'moves',
        'increases', 'reduces', 'creates', 'summons', 'casts', 'uses', 'allows',
        'press', 'attack', 'draw', 'fill', 'fires', 'boosts', 'calls', 'grows',
        'hones', 'automatically', 'draws', 'giant', 'temporarily'
    }:
        return False

    # Check if it's an invalid standalone name (case insensitive)
    if any(word.lower() == name.lower() for word in invalid_names):
        return False
        
    # Check for problematic patterns
    problematic_patterns = [
        # Punctuation and numbers
        r'^[.,;:]+$',
        r'^\d+.*(?:Attack|Damage|Times|Hits?|Enemies|Time)',
        r'^\d+(?:st|nd|rd|th)\s+',
        r'\d+(?:%|sec|min|times?|hits?)',
        
        # Stats and effects
        r'(?:HP|MP|Damage|EXP)\s*[-+]?\d+%?',
        r'^\s*(?:Max\s+)?(?:HP|MP|Damage|Targets?|Enemies?)',
        r'(?:Duration|Cooldown|Effect|Interval):\s*',
        r'consumes?\s+',
        r'releases?\s+',
        r'recovers?\s+',
        
        # Common description starts
        r'^(?:Each|Every|When|While|Upon|During|After)',
        r'^(?:Gain|Gains?|Grant|Grants?)\s+',
        r'^(?:Add|Adds?|Create|Creates?)\s+',
        r'^(?:Press|Use|Using|Cast|Casts?)\s+',
        r'^(?:Move|Moves?|Turn|Turns?)\s+',
        r'^(?:Summon|Summons?|Call|Calls?)\s+',
        
        # Common action verbs
        r'(?:can|will|to|for|with|by|from)\s+',
        r'becomes?\s+',
        r'activates?\s+',
        r'triggers?\s+',
        r'increase[sd]?\s+',
        r'reduce[sd]?\s+',
        r'summon(?:ed|s)?\s+',
        r'cast(?:ing|s)?\s+',
        r'use[sd]?\s+'
    ]
    
    if any(re.search(pattern, name, re.I) for pattern in problematic_patterns):
        return False
    
    # Final check for description-like text
    max_words = 3  # Most skill names are 1-3 words
    word_count = len([w for w in re.split(r'\s+', name) if w.lower() not in ['the', 'a', 'an']])
    
    return word_count <= max_words

def extract_skill_name(element, prev_names=None):
    """Extract skill name from a table cell, prioritizing links"""
    prev_names = prev_names or set()
    
    # Look for skill type (Active/Passive) in the previous cell
    prev_cell = element.find_previous(['th', 'td'])
    cell_type = None if not prev_cell else prev_cell.get_text().strip().lower()
    skill_type = cell_type if cell_type in ['active', 'passive'] else None
    
    # Try to find the skill name in a skill link
    link = element.find('a')
    if link and 'title' in link.attrs:
        # Check if this is a skill link (not an image)
        href = link.get('href', '').lower()
        title = link['title']
        print(f"DEBUG: Found link - href: {href}, title: {title}, type: {skill_type}")
        if href and not href.startswith('/w/file:'):
            if title and title not in prev_names:
                if skill_type:
                    print(f"DEBUG: Returning skill with type: {title} ({skill_type})")
                    return (title, skill_type)
                print(f"DEBUG: Returning skill: {title}")
                return title
                
    # We no longer try to extract names from cell text
    return None

def fetch_lara_skills():
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
    }
    
    # Try different possible URLs for the skills page
    urls = [
        "https://maplestorywiki.net/w/Lara/Skills",
        "https://maplestorywiki.net/w/Lara_Skills",
        "https://maplestorywiki.net/w/Lara"
    ]
    
    soup = None
    for url in urls:
        print(f"\nTrying URL: {url}")
        try:
            response = requests.get(url, headers=headers, timeout=30)
            if response.ok:
                print(f"Successfully connected to {url}")
                temp_soup = BeautifulSoup(response.content, 'html.parser')
                print("Successfully parsed the webpage")
                
                # Check if this page has skill tables
                if temp_soup.find('table', class_='wikitable'):
                    soup = temp_soup
                    break
                else:
                    print("No skill tables found on this page, trying next URL...")
        except Exception as e:
            print(f"Error accessing {url}: {e}")
            continue
    
    if not soup:
        print("Could not find a valid skills page")
        sys.exit(1)
    
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
                # Look for both th and td cells
                current_type = None
                for row in table.find_all('tr'):
                    cells = row.find_all(['th', 'td'])
                    for i, cell in enumerate(cells):
                        header = cell.get_text().strip().lower()
                        # Handle type header cells
                        if header in ['active', 'passive']:
                            current_type = header
                            print(f"DEBUG: Found skill type: {current_type}")
                            continue
                        
                        # Get skill name from skill links
                        for link in cell.find_all('a'):
                            href = link.get('href', '').lower()
                            if (href and 
                                not href.startswith('/w/file:') and
                                link.get('title')):
                                name = link['title']
                                if (name and 
                                    name not in found_skills and 
                                    not any(x in name.lower() for x in [
                                        'mode', ' - ', 'boost', 'skills', 'level', 
                                        'cooldown', 'duration', 'damage', 'effect'
                                    ])):
                                    found_skills.add(name)
                                    print(f"Found Hyper {current_type or 'passive'} skill: {name}")
                                    target_list = (skills['hyper']['active'] 
                                                if current_type == 'active' 
                                                else skills['hyper']['passive'])
                                    if name not in target_list:
                                        target_list.append(name)
                                
                            if name not in target_list:
                                target_list.append(name)
                
                # Move to the next table in this section
                table = find_next_table(table)
                
            print(f"Added {len(skills['hyper']['passive'])} passive and {len(skills['hyper']['active'])} active Hyper skills")
        
        # V Skills
        elif "5th Job" in section_title or "V Matrix" in section_title:
            table = find_next_table(section)
            found_skills = set()
            while table:
                for cell in table.find_all(['th', 'td']):
                    result = extract_skill_name(cell)
                    if result:
                        name = result[0] if isinstance(result, tuple) else result
                        if name and name not in found_skills:
                            # Filter invalid V skills
                            if not any(x in name.lower() for x in ['skills', 'decent', 'rope lift', 'erda nova', 'matrix']):
                                found_skills.add(name)
                                print(f"Found V skill: {name}")
                                if name not in skills['v']:
                                    skills['v'].append(name)
                table = find_next_table(table)
        
        # HEXA Skills
        elif "HEXA" in section_title or "6th Job" in section_title:
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
                for cell in table.find_all(['th', 'td']):
                    result = extract_skill_name(cell)
                    if result:
                        name = result[0] if isinstance(result, tuple) else result
                        if name and name not in found_skills:
                            # Filter out invalid HEXA skills
                            if not any(x in name.lower() for x in ['skills', 'level', 'passive', 'active', 'cooldown', 'duration']):
                                found_skills.add(name)
                                print(f"Found HEXA {current_section} skill: {name}")
                                if name not in skills['hexa'][current_section]:
                                    skills['hexa'][current_section].append(name)
                
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
