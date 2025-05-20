import yaml

class SkillDumper(yaml.SafeDumper):
    def represent_scalar(self, tag, value, style=None):
        # Don't quote non-skill strings
        if tag == 'tag:yaml.org,2002:str' and isinstance(value, str):
            if not any(s in value for s in ['-', "'", ' ']):
                return super().represent_scalar(tag, value, None)
            # Quote skill names
            return super().represent_scalar(tag, value.strip('"\''), style='"')
        return super().represent_scalar(tag, value, style)

    def represent_none(self, _):
        return self.represent_sequence('tag:yaml.org,2002:seq', [])

def fetch_lara_skills():
    # Skill data structure
    skills = {
        'hyper': {
            'passive': [
                "Earth Break - Reinforce",
                "Earth Break - Extra Strike",
                "Earth Break - Boss Rush",
                "World Tree's Blessing - Cooldown Cutter",
                "World Tree's Blessing - Enhance",
                "World Tree's Blessing - Extra Point"
            ],
            'active': [
                "Dragon Blast - Reinforce",
                "Dragon Blast - Extra Strike",
                "Dragon Blast - Guardbreak"
            ]
        },
        'v': [
            "Ancient Power",
            "Nature's Wrath",
            "Dragon Vein",
            "Grandis Goddess's Blessing",
            "Maple World Goddess's Blessing",
            "Elementalism"
        ],
        'hexa': {
            'origin': [
                "Ancient Astra",
                "Spirit's Domain",
                "Life Battery"
            ],
            'mastery': [
                "Earth Guardian",
                "Dragon Guardian",
                "Advanced Earth Break",
                "Advanced Dragon Blast"
            ],
            'enhancement': [
                "Nature's Enhancement",
                "Dragon Enhancement",
                "Sacred Enhancement"
            ]
        }
    }
    
    # Replace any null values with empty lists
    for section in skills:
        if isinstance(skills[section], dict):
            for subsection in skills[section]:
                if skills[section][subsection] is None:
                    skills[section][subsection] = []
        elif skills[section] is None:
            skills[section] = []
    
    return skills

def update_lara_skills(yaml_file):
    # Read the current YAML file
    with open(yaml_file, 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)
    
    # Find Lara in the jobs list
    for job in data['jobs']:
        if job['jobName'] == 'Lara':
            # Update with new skills
            job['skill'] = fetch_lara_skills()
            break
    
    # Write back to the file
    with open(yaml_file, 'w', encoding='utf-8') as f:
        yaml.dump(data, f, allow_unicode=True, sort_keys=False, default_flow_style=False, 
                 Dumper=SkillDumper)

if __name__ == "__main__":
    yaml_file = '../data/joblist.yaml'
    update_lara_skills(yaml_file)
    print("Updated Lara's skills successfully")
