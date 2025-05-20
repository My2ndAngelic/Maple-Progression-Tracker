import yaml
from yaml.events import *

def quote_skills_in_events(events):
    """Add quotes to skill names in YAML events."""
    skill_sections = set(['passive', 'active', 'v', 'origin', 'mastery', 'enhancement'])
    in_skill_section = False
    
    for event in events:
        if isinstance(event, ScalarEvent):
            if event.value in skill_sections:
                in_skill_section = True
            elif in_skill_section and event.value and not event.value.startswith('"'):
                # Quote skill names
                event.value = f'"{event.value}"'
                event.style = '"'
            elif event.value in ['hyper', 'v', 'hexa']:
                in_skill_section = False
        yield event

def add_quotes(value):
    """Add double quotes to a string if it's not already quoted."""
    if isinstance(value, str):
        value = value.strip()
        if not (value.startswith('"') and value.endswith('"')):
            return f'"{value}"'
    return value

def ensure_double_quotes(skills):
    """Add double quotes to each skill name in a list."""
    if isinstance(skills, list):
        return [add_quotes(s) for s in skills if s]
    return skills

def reorganize_skills(data):
    for job in data['jobs']:
        # Create new skill section with empty lists for each category
        skill_section = {
            'hyper': {
                'passive': [],  # First 6 skills
                'active': []    # Last 3 skills will ALWAYS be listed last
            },
            'v': [],
            'hexa': {
                'origin': [],
                'mastery': [],
                'enhancement': []
            }
        }
        
        # If there are any existing skills, ensure hyper active skills are last
        if 'skill' in job:
            existing_skills = job.get('skill', {})
            # Handle hyper skills
            hyper = existing_skills.get('hyper', {})
            if isinstance(hyper, dict):
                # Get all hyper skills
                all_hyper = []
                if isinstance(hyper.get('passive'), list):
                    all_hyper.extend(hyper['passive'])
                if isinstance(hyper.get('active'), list):
                    all_hyper.extend(hyper['active'])
                
                # Remove empty strings and ensure double quotes
                all_hyper = ensure_double_quotes([s for s in all_hyper if s])
                
                if all_hyper:
                    # Last 3 skills go to active, rest go to passive
                    skill_section['hyper']['passive'] = all_hyper[:-3] if len(all_hyper) > 3 else []
                    skill_section['hyper']['active'] = all_hyper[-3:] if all_hyper else []
            
            # Handle other skill sections
            if 'v' in existing_skills and isinstance(existing_skills['v'], list):
                skill_section['v'] = ensure_double_quotes([s for s in existing_skills['v'] if s])
            
            # Handle hexa skills
            if 'hexa' in existing_skills and isinstance(existing_skills['hexa'], dict):
                for subsection in ['origin', 'mastery', 'enhancement']:
                    if subsection in existing_skills['hexa']:
                        skills = existing_skills['hexa'][subsection]
                        if isinstance(skills, list):
                            skill_section['hexa'][subsection] = ensure_double_quotes([s for s in skills if s])
        
        # Add the new skill section and remove old ones
        job['skill'] = skill_section
        
        # Remove old skill sections if they exist
        job.pop('hyper', None)
        job.pop('v', None)
        job.pop('vskills', None)  # Handle both v and vskills
        job.pop('hexa', None)
        job.pop('hexaskills', None)  # Handle both hexa and hexaskills
    
    return data

def main():
    input_file = '../data/joblist.yaml'
    output_file = '../data/joblist_new.yaml'
    
    # Read the YAML file
    with open(input_file, 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)
    
    # Reorganize the skills
    updated_data = reorganize_skills(data)
    
    # Write the updated YAML with proper formatting
    with open(output_file, 'w', encoding='utf-8') as f:
        # Create events
        events = yaml.serialize(updated_data)
        # Add quotes to skill names
        quoted_events = quote_skills_in_events(events)
        # Write the events
        yaml.emit(quoted_events, f)
    
    print(f"Updated YAML has been written to {output_file}")

if __name__ == "__main__":
    main()
