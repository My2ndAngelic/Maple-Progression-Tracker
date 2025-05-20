import yaml

def add_quotes(value):
    """Add double quotes to a string if it's not already quoted."""
    if isinstance(value, str):
        value = value.strip()
        if not (value.startswith('"') and value.endswith('"')):
            value = f'"{value}"'
    return value

def ensure_double_quotes(skills):
    if isinstance(skills, list):
        result = []
        for s in skills:
            if s:  # Skip empty strings
                # Handle any existing quotes first
                s = s.strip('"').strip("'")
                # Replace any existing double quotes in the string with escaped quotes
                s = s.replace('"', '\\"')
                result.append(f'"{s}"')
        return result
    return skills

class SkillDumper(yaml.SafeDumper):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
    def represent_scalar(self, tag, value, style=None):
        if tag == 'tag:yaml.org,2002:str':
            # Don't quote these special values
            special_values = ['jobs', 'jobName', 'faction', 'archetype', 'linkSkillMaxLevel', 
                            'mainstat', 'skill', 'hyper', 'v', 'hexa', 'passive', 'active', 
                            'origin', 'mastery', 'enhancement']
            if value not in special_values:
                # Quote all other strings
                value = f'"{value.strip(\'"\'").strip(\'\"\')}"'
                return super().represent_scalar(tag, value, style=None)
        return super().represent_scalar(tag, value, style)

    def represent_sequence(self, tag, sequence, flow_style=None):
        # Override sequence representation for skill lists
        if isinstance(sequence, list) and len(sequence) > 0 and isinstance(sequence[0], str):
            # Convert all items to quoted strings
            sequence = [f'"{item.strip(\'"\'").strip(\'\'"\'")}"' for item in sequence]
        return super().represent_sequence(tag, sequence, flow_style)

class SkillList(list):
    pass

def skill_list_representer(dumper, data):
    # Create a sequence of quoted strings
    return dumper.represent_sequence('tag:yaml.org,2002:seq',
                                   [f'"{item}"' for item in data],
                                   flow_style=False)

yaml.add_representer(SkillList, skill_list_representer)

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
    
    # Write the updated YAML with proper formatting and double quotes
    with open(output_file, 'w', encoding='utf-8') as f:
        yaml.dump(updated_data, f, allow_unicode=True, sort_keys=False, default_flow_style=False, Dumper=SkillDumper)
    
    print(f"Updated YAML has been written to {output_file}")

if __name__ == "__main__":
    main()
