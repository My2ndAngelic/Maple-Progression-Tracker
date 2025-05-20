import yaml
import json

def quote_skill(skill):
    """Properly quote a skill name, handling single quotes"""
    if not skill:
        return skill
    # Remove any existing quotes
    skill = skill.strip('"').strip("'")
    # Escape any existing double quotes
    skill = skill.replace('"', '\\"')
    return f'"{skill}"'

class SkillDumper(yaml.SafeDumper):
    def represent_scalar(self, tag, value, style=None):
        """Custom scalar representation to handle skill names"""
        unquoted = ['jobs', 'jobName', 'faction', 'archetype', 'linkSkillMaxLevel', 
                   'mainstat', 'skill', 'hyper', 'v', 'hexa', 'passive', 'active', 
                   'origin', 'mastery', 'enhancement']
        
        if tag == 'tag:yaml.org,2002:str' and isinstance(value, str):
            if value in unquoted:
                return super().represent_scalar(tag, value, None)
            else:
                # Quote the value
                return super().represent_scalar(tag, quote_skill(value).strip('"'), style='"')
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
                
                # Remove empty strings and quote skills
                all_hyper = [s for s in all_hyper if s]
                
                if all_hyper:
                    # Last 3 skills go to active, rest go to passive
                    skill_section['hyper']['passive'] = all_hyper[:-3] if len(all_hyper) > 3 else []
                    skill_section['hyper']['active'] = all_hyper[-3:] if all_hyper else []
            
            # Handle v skills
            if 'v' in existing_skills and isinstance(existing_skills['v'], list):
                skill_section['v'] = [s for s in existing_skills['v'] if s]
            
            # Handle hexa skills
            if 'hexa' in existing_skills and isinstance(existing_skills['hexa'], dict):
                for subsection in ['origin', 'mastery', 'enhancement']:
                    if subsection in existing_skills['hexa']:
                        skills = existing_skills['hexa'][subsection]
                        if isinstance(skills, list):
                            skill_section['hexa'][subsection] = [s for s in skills if s]
        
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
                 default_flow_style=False, Dumper=SkillDumper)
    
    print(f"Updated YAML has been written to {output_file}")

if __name__ == "__main__":
    main()
