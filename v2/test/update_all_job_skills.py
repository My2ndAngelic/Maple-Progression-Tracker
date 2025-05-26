#!/usr/bin/env python3
import yaml
import requests
from bs4 import BeautifulSoup
import os
import time
import re

# Custom YAML representer to ensure all strings are quoted
def quoted_presenter(dumper, data):
    return dumper.represent_scalar('tag:yaml.org,2002:str', data, style='"')

# Register the presenter for strings
yaml.add_representer(str, quoted_presenter)
yaml.add_representer(int, lambda dumper, data: dumper.represent_scalar('tag:yaml.org,2002:int', str(data)))
yaml.add_representer(float, lambda dumper, data: dumper.represent_scalar('tag:yaml.org,2002:float', str(data)))
yaml.add_representer(bool, lambda dumper, data: dumper.represent_scalar('tag:yaml.org,2002:bool', str(data).lower()))

# Create a directory to save HTML files
os.makedirs('skill_html', exist_ok=True)

def fetch_class_skills(job_name):
    """Fetch skills from the wiki for a given job name."""
    # Replace spaces with underscores and handle special cases
    wiki_name = job_name.replace(' ', '_')
    
    # Handle special cases for naming on the wiki
    wiki_name_mapping = {
        'Arch_Mage_(Ice/Lightning)': 'Arch_Mage_(Ice,_Lightning)',
        'Arch_Mage_(Fire/Poison)': 'Arch_Mage_(Fire,_Poison)'
    }
    
    if wiki_name in wiki_name_mapping:
        wiki_name = wiki_name_mapping[wiki_name]
    
    url = f"https://maplestorywiki.net/w/{wiki_name}/Skills"
    print(f"Fetching skills from {url}")
    
    # Try to fetch from the web
    try:
        response = requests.get(url)
        if response.status_code == 200:
            html = response.text
            # Create a safe filename for saving HTML
            safe_filename = job_name.lower().replace(" ", "_").replace("/", "_")
            # Save the HTML for future reference
            html_path = f'skill_html/{safe_filename}_skills.html'
            with open(html_path, 'w', encoding='utf-8') as file:
                file.write(html)
            
            # Add a small delay to avoid hitting the server too quickly
            time.sleep(1)
        else:
            print(f"Failed to fetch skills for {job_name}. Status code: {response.status_code}")
            # Try to use a cached version if available
            try:
                safe_filename = job_name.lower().replace(" ", "_").replace("/", "_")
                html_path = f'skill_html/{safe_filename}_skills.html'
                with open(html_path, 'r', encoding='utf-8') as file:
                    html = file.read()
                print(f"Using cached HTML for {job_name}")
            except FileNotFoundError:
                print(f"No cached HTML found for {job_name}")
                return None
    except Exception as e:
        print(f"Error fetching data for {job_name}: {e}")
        # Try to use a cached version if available
        try:
            safe_filename = job_name.lower().replace(" ", "_").replace("/", "_")
            html_path = f'skill_html/{safe_filename}_skills.html'
            with open(html_path, 'r', encoding='utf-8') as file:
                html = file.read()
            print(f"Using cached HTML for {job_name}")
        except FileNotFoundError:
            print(f"No cached HTML found for {job_name}")
            return None
    
    return parse_skills_html(html, job_name)

def parse_skills_html(html, job_name):
    """Parse the HTML to extract skills."""
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
    
    soup = BeautifulSoup(html, 'html.parser')
    content = soup.find('div', {'id': 'mw-content-text'})
    if not content:
        print(f"No content found for {job_name}")
        return skills
    
    for section in content.find_all('h2'):
        section_title = section.get_text(strip=True)
        if section_title == "Hyper Skills":
            hyper_skills = find_hyper_skills(section)
            if hyper_skills['passive']:
                skills['hyper']['passive'] = hyper_skills['passive']
            if hyper_skills['active']:
                skills['hyper']['active'] = hyper_skills['active']
        elif section_title == "V Skills":
            v_skills = find_v_skills(section, job_name)
            if v_skills['v']:
                skills['v'] = v_skills['v']
        elif section_title == "HEXA Skills":
            hexa_skills = find_hexa_skills(section, job_name)
            if hexa_skills['origin']:
                skills['hexa']['origin'] = hexa_skills['origin']
            if hexa_skills['mastery']:
                skills['hexa']['mastery'] = hexa_skills['mastery']
            if hexa_skills['enhancement']:
                skills['hexa']['enhancement'] = hexa_skills['enhancement']
    
    return skills

def find_hyper_skills(section):
    """Find hyper skills from the section."""
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
                # Always add to the skills list
                skills[skill_type].append(skill_name)
        
        sibling = sibling.find_next_sibling()
    
    return skills

def find_skills_under_h3(section, section_name, job_name=""):
    """Find skills under a specific h3 heading."""
    skill_list = []
    
    # Find the h3 element that matches the section_name
    target_h3 = None
    for h3 in section.find_next_sibling().find_all_next('h3'):
        if h3.get_text(strip=True) == section_name:
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
            
            # Find all links in the table
            links = current.find_all('a')
            
            # Simple approach - choose the right link based on length
            if links:
                # If there are 4 or more links, usually the 2nd from last is the skill name
                # (to skip citation links that appear at the end)
                if len(links) >= 4:
                    skill_link = links[-2]
                else:
                    skill_link = links[-1]
                
                skill_text = skill_link.get_text(strip=True)
                
                # Handle placeholder values (like [1], [2], etc.)
                if skill_text.startswith('[') and skill_text.endswith(']'):
                    # Try to find the actual skill name in the title attribute
                    for link in links:
                        if link.get('title') and link.get('href', '').startswith('/w/'):
                            skill_text = link.get('title')
                            print(f"    Replaced placeholder with actual skill name: {skill_text} for {job_name}")
                            break
                
                skill_list.append(skill_text)
        
        current = current.find_next_sibling()
    
    return skill_list

def find_v_skills(section, job_name=""):
    """Find V skills."""
    return {'v': find_skills_under_h3(section, "Class-Specific Skills", job_name)}

def find_hexa_skills(section, job_name=""):
    """Find HEXA skills."""
    return {
        'origin': find_skills_under_h3(section, "Class-Specific Skills", job_name),
        'mastery': find_skills_under_h3(section, "Mastery Skills", job_name),
        'enhancement': find_skills_under_h3(section, "Enhancements", job_name)
    }

def update_job_skills_in_yaml(yaml_file):
    """Update the skills for all jobs in the YAML file."""
    # Load the YAML file
    try:
        with open(yaml_file, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)
    except Exception as e:
        print(f"Error loading YAML file {yaml_file}: {e}")
        return
    
    if not data or 'jobs' not in data:
        print(f"Invalid YAML structure in {yaml_file}")
        return
    
    # No backup files needed as Git is used for version control
    
    # Process each job
    for job in data['jobs']:
        job_name = job.get('jobName')
        if not job_name:
            print("Warning: Found job without a jobName, skipping...")
            continue
        
        print(f"\nProcessing job: {job_name}")
        
        # Get skills for the job
        try:
            fetched_skills = fetch_class_skills(job_name)
            if not fetched_skills:
                print(f"No skills found for {job_name}, skipping...")
                continue
        except Exception as e:
            print(f"Error fetching skills for {job_name}: {e}")
            continue
        
        # Ensure 'skill' exists in job
        if 'skill' not in job:
            job['skill'] = {}
        
        # Ensure 'hyper' exists in skill
        if 'hyper' not in job['skill']:
            job['skill']['hyper'] = {}
        
        # Update hyper passive skills, but skip for Zero class
        if job_name == "Zero":
            print("  Skipping hyper skills update for Zero class (as requested)")
        
        if job_name != "Zero" and fetched_skills['hyper']['passive'] and len(fetched_skills['hyper']['passive']) > 0:
            job['skill']['hyper']['passive'] = fetched_skills['hyper']['passive']
            print(f"  Updated {len(fetched_skills['hyper']['passive'])} hyper passive skills")
        elif 'passive' not in job['skill']['hyper'] or job['skill']['hyper']['passive'] is None:
            job['skill']['hyper']['passive'] = []
        
        # Update hyper active skills, but skip for Zero class
        if job_name != "Zero" and fetched_skills['hyper']['active'] and len(fetched_skills['hyper']['active']) > 0:
            job['skill']['hyper']['active'] = fetched_skills['hyper']['active']
            print(f"  Updated {len(fetched_skills['hyper']['active'])} hyper active skills")
        elif 'active' not in job['skill']['hyper'] or job['skill']['hyper']['active'] is None:
            job['skill']['hyper']['active'] = []
        
        # Update V skills
        if fetched_skills['v'] and len(fetched_skills['v']) > 0:
            job['skill']['v'] = fetched_skills['v']
            print(f"  Updated {len(fetched_skills['v'])} V skills")
        elif 'v' not in job['skill'] or job['skill']['v'] is None:
            job['skill']['v'] = []
        
        # Ensure 'hexa' exists in skill
        if 'hexa' not in job['skill']:
            job['skill']['hexa'] = {}
        
        # Update HEXA origin skills
        if fetched_skills['hexa']['origin'] and len(fetched_skills['hexa']['origin']) > 0:
            job['skill']['hexa']['origin'] = fetched_skills['hexa']['origin']
            print(f"  Updated {len(fetched_skills['hexa']['origin'])} HEXA origin skills")
        elif 'origin' not in job['skill']['hexa'] or job['skill']['hexa']['origin'] is None:
            job['skill']['hexa']['origin'] = []
        
        # Update HEXA mastery skills
        if fetched_skills['hexa']['mastery'] and len(fetched_skills['hexa']['mastery']) > 0:
            job['skill']['hexa']['mastery'] = fetched_skills['hexa']['mastery']
            print(f"  Updated {len(fetched_skills['hexa']['mastery'])} HEXA mastery skills")
        elif 'mastery' not in job['skill']['hexa'] or job['skill']['hexa']['mastery'] is None:
            job['skill']['hexa']['mastery'] = []
        
        # Update HEXA enhancement skills
        if fetched_skills['hexa']['enhancement'] and len(fetched_skills['hexa']['enhancement']) > 0:
            job['skill']['hexa']['enhancement'] = fetched_skills['hexa']['enhancement']
            print(f"  Updated {len(fetched_skills['hexa']['enhancement'])} HEXA enhancement skills")
        elif 'enhancement' not in job['skill']['hexa'] or job['skill']['hexa']['enhancement'] is None:
            job['skill']['hexa']['enhancement'] = []
    
    # Save the updated YAML file with proper formatting
    try:
        with open(yaml_file, 'w', encoding='utf-8') as f:
            # Use our custom representer to format lists properly and quote all strings
            yaml.dump(data, f, default_flow_style=False, sort_keys=False, 
                     allow_unicode=True, width=1000)
        
        print(f"\nUpdated skills for all jobs in {yaml_file}")
    except Exception as e:
        print(f"Error saving YAML file: {e}")
        print(f"The file may be in an inconsistent state. Please restore from Git if needed.")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Update job skills in YAML file from MapleStory Wiki')
    parser.add_argument('--yaml', '-y', default='../data/joblist.yaml',
                      help='Path to the YAML file (default: ../data/joblist.yaml)')
    parser.add_argument('--job', '-j', 
                      help='Process only a specific job (by name)')
    parser.add_argument('--no-web', action='store_true',
                      help='Do not fetch from the web, use cached HTML files only')
    
    args = parser.parse_args()
    
    # If --no-web is specified, modify the fetch_class_skills function
    if args.no_web:
        def fetch_class_skills_no_web(job_name):
            """Fetch skills from cached HTML for a given job name."""
            safe_filename = job_name.lower().replace(" ", "_").replace("/", "_")
            html_path = f'skill_html/{safe_filename}_skills.html'
            try:
                with open(html_path, 'r', encoding='utf-8') as file:
                    html = file.read()
                print(f"Using cached HTML for {job_name}")
                return parse_skills_html(html, job_name)
            except FileNotFoundError:
                print(f"No cached HTML found for {job_name}")
                return None
        
        # Replace the fetch_class_skills function
        globals()['fetch_class_skills'] = fetch_class_skills_no_web
    
    # If a specific job is specified, process only that job
    if args.job:
        print(f"Processing only job: {args.job}")
        # Load the YAML file
        try:
            with open(args.yaml, 'r', encoding='utf-8') as f:
                data = yaml.safe_load(f)
        except Exception as e:
            print(f"Error loading YAML file {args.yaml}: {e}")
            exit(1)
        
        if not data or 'jobs' not in data:
            print(f"Invalid YAML structure in {args.yaml}")
            exit(1)
        
        # Find the job
        job_found = False
        job_index = -1
        for i, job in enumerate(data['jobs']):
            if job.get('jobName') == args.job:
                job_found = True
                job_index = i
                # Extract just this job for processing
                single_job = job
                # Create a new data structure with just this job
                single_job_data = {'jobs': [single_job]}
                # Process the single job data directly
                
                # Get skills for the job
                try:
                    fetched_skills = fetch_class_skills(args.job)
                    if not fetched_skills:
                        print(f"No skills found for {args.job}, skipping...")
                        break
                except Exception as e:
                    print(f"Error fetching skills for {args.job}: {e}")
                    break
                
                # Update the job with the fetched skills (following same logic as in update_job_skills_in_yaml)
                # Ensure 'skill' exists in job
                if 'skill' not in single_job:
                    single_job['skill'] = {}
                
                # Ensure 'hyper' exists in skill
                if 'hyper' not in single_job['skill']:
                    single_job['skill']['hyper'] = {}
                
                # Update hyper passive skills, but skip for Zero class
                if args.job == "Zero":
                    print("  Skipping hyper skills update for Zero class (as requested)")
                
                if args.job != "Zero" and fetched_skills['hyper']['passive'] and len(fetched_skills['hyper']['passive']) > 0:
                    single_job['skill']['hyper']['passive'] = fetched_skills['hyper']['passive']
                    print(f"  Updated {len(fetched_skills['hyper']['passive'])} hyper passive skills")
                elif 'passive' not in single_job['skill']['hyper'] or single_job['skill']['hyper']['passive'] is None:
                    single_job['skill']['hyper']['passive'] = []
                
                # Update hyper active skills, but skip for Zero class
                if args.job != "Zero" and fetched_skills['hyper']['active'] and len(fetched_skills['hyper']['active']) > 0:
                    single_job['skill']['hyper']['active'] = fetched_skills['hyper']['active']
                    print(f"  Updated {len(fetched_skills['hyper']['active'])} hyper active skills")
                elif 'active' not in single_job['skill']['hyper'] or single_job['skill']['hyper']['active'] is None:
                    single_job['skill']['hyper']['active'] = []
                
                # Update V skills
                if fetched_skills['v'] and len(fetched_skills['v']) > 0:
                    single_job['skill']['v'] = fetched_skills['v']
                    print(f"  Updated {len(fetched_skills['v'])} V skills")
                elif 'v' not in single_job['skill'] or single_job['skill']['v'] is None:
                    single_job['skill']['v'] = []
                
                # Ensure 'hexa' exists in skill
                if 'hexa' not in single_job['skill']:
                    single_job['skill']['hexa'] = {}
                
                # Update HEXA origin skills
                if fetched_skills['hexa']['origin'] and len(fetched_skills['hexa']['origin']) > 0:
                    single_job['skill']['hexa']['origin'] = fetched_skills['hexa']['origin']
                    print(f"  Updated {len(fetched_skills['hexa']['origin'])} HEXA origin skills")
                elif 'origin' not in single_job['skill']['hexa'] or single_job['skill']['hexa']['origin'] is None:
                    single_job['skill']['hexa']['origin'] = []
                
                # Update HEXA mastery skills
                if fetched_skills['hexa']['mastery'] and len(fetched_skills['hexa']['mastery']) > 0:
                    single_job['skill']['hexa']['mastery'] = fetched_skills['hexa']['mastery']
                    print(f"  Updated {len(fetched_skills['hexa']['mastery'])} HEXA mastery skills")
                elif 'mastery' not in single_job['skill']['hexa'] or single_job['skill']['hexa']['mastery'] is None:
                    single_job['skill']['hexa']['mastery'] = []
                
                # Update HEXA enhancement skills
                if fetched_skills['hexa']['enhancement'] and len(fetched_skills['hexa']['enhancement']) > 0:
                    single_job['skill']['hexa']['enhancement'] = fetched_skills['hexa']['enhancement']
                    print(f"  Updated {len(fetched_skills['hexa']['enhancement'])} HEXA enhancement skills")
                elif 'enhancement' not in single_job['skill']['hexa'] or single_job['skill']['hexa']['enhancement'] is None:
                    single_job['skill']['hexa']['enhancement'] = []
                
                # Update the job in the original data
                data['jobs'][job_index] = single_job
                
                # Save the original file with the updated job
                with open(args.yaml, 'w', encoding='utf-8') as f:
                    yaml.dump(data, f, default_flow_style=False, sort_keys=False, 
                             allow_unicode=True, width=1000)
                
                print(f"\nUpdated skills for {args.job} in {args.yaml}")
                break
        
        if not job_found:
            print(f"Job '{args.job}' not found in the YAML file")
            exit(1)
    else:
        # Process all jobs
        update_job_skills_in_yaml(args.yaml)
    
    print("\nAll operations completed successfully")
