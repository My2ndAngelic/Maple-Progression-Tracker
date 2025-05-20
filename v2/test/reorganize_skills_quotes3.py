import yaml
from typing import Any

def quote_skill(skill):
    """Quote a skill name, handling any existing quotes"""
    if not skill:
        return skill
    # Remove any existing quotes
    skill = skill.strip('"').strip("'")
    # Replace any quotes in the skill name with escaped quotes
    skill = skill.replace('"', '\\"')
    # Add double quotes
    return f'"{skill}"'

class SkillQuoter(yaml.SafeDumper):
    def represent_sequence(self, tag, sequence, flow_style=None):
        if tag == 'tag:yaml.org,2002:seq' and all(isinstance(x, str) for x in sequence):
            # Quote all skill names in sequences
            sequence = [quote_skill(x) for x in sequence]
            # Set the style to single-quoted to preserve the double quotes
            style = "'"
        else:
            style = flow_style
        node = super().represent_sequence(tag, sequence, style)
        return node

    def represent_scalar(self, tag, value, style=None):
        # Don't quote these structural field names
        unquoted = ['jobs', 'jobName', 'faction', 'archetype', 'linkSkillMaxLevel', 
                    'mainstat', 'skill', 'hyper', 'v', 'hexa', 'passive', 'active', 
                    'origin', 'mastery', 'enhancement']
        if tag == 'tag:yaml.org,2002:str':
            if value in unquoted:
                return super().represent_scalar(tag, value, None)
            return super().represent_scalar(tag, value, style='"')
        return super().represent_scalar(tag, value, style)

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
                
                # Remove empty strings and clean up quotes
                all_hyper = [s.strip('"').strip("'") for s in all_hyper if s]
                
                if all_hyper:
                    # Last 3 skills go to active, rest go to passive
                    skill_section['hyper']['passive'] = all_hyper[:-3] if len(all_hyper) > 3 else []
                    skill_section['hyper']['active'] = all_hyper[-3:] if all_hyper else []
            
            # Handle v skills
            if 'v' in existing_skills and isinstance(existing_skills['v'], list):
                v_skills = [s.strip('"').strip("'") for s in existing_skills['v'] if s]
                skill_section['v'] = v_skills
            
            # Handle hexa skills
            if 'hexa' in existing_skills and isinstance(existing_skills['hexa'], dict):
                for subsection in ['origin', 'mastery', 'enhancement']:
                    if subsection in existing_skills['hexa']:
                        skills = existing_skills['hexa'][subsection]
                        if isinstance(skills, list):
                            clean_skills = [s.strip('"').strip("'") for s in skills if s]
                            skill_section['hexa'][subsection] = clean_skills
        
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
        yaml.dump(updated_data, f, allow_unicode=True, sort_keys=False, 
                 default_flow_style=False, Dumper=SkillQuoter)
    
    print(f"Updated YAML has been written to {output_file}")

if __name__ == "__main__":
    main()
