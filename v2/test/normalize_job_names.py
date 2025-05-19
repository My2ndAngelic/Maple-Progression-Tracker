#!/usr/bin/env python3
import yaml

def fix_job_names():
    # Job name mappings (lower case to proper name)
    JOB_NAMES = {
        'evan': 'Evan',
        'phantom': 'Phantom',
        'merc': 'Mercedes',
        'hy': 'Hoyoung',
        'il': 'Arch Mage (Ice/Lightning)',
        'fp': 'Arch Mage (Fire/Poison)',
        'sair': 'Corsair',
        'nl': 'Night Lord',
        'lynn': 'Luminous',
        'db': 'Dual Blade',
        'shad': 'Shadower',
        'bam': 'Battle Mage',
        'mech': 'Mechanic',
        'dw': 'Dawn Warrior',
        'da': 'Demon Avenger',
        'ds': 'Demon Slayer',
        'kine': 'Kinesis',
        'wh': 'Wild Hunter',
        'Ice Lightning Mage': 'Arch Mage (Ice/Lightning)',
        'Fire Poison Mage': 'Arch Mage (Fire/Poison)'
    }

    print("Loading database.yaml...")
    with open('../data/database.yaml', 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)

    changes = []
    print("\nChecking job names...")
    
    # Process all characters
    for char_name, char_data in data['characters'].items():
        if 'basic' in char_data and 'job_name' in char_data['basic']:
            current_name = char_data['basic']['job_name']
            # Look up proper name (case insensitive)
            proper_name = JOB_NAMES.get(current_name.lower(), current_name)
            
            # Only update if it's different (ignoring case)
            if proper_name.lower() != current_name.lower():
                changes.append(f"{char_name}: {current_name} → {proper_name}")
                char_data['basic']['job_name'] = proper_name

    if changes:
        print("\nMaking the following changes:")
        for change in changes:
            print(f"- {change}")
        
        print("\nSaving changes...")
        with open('../data/database.yaml', 'w', encoding='utf-8') as f:
            yaml.dump(data, f, allow_unicode=True, sort_keys=False)
        print("Done! Updated database.yaml with proper job names.")
    else:
        print("\nNo changes needed. All job names are already in their proper form.")

if __name__ == '__main__':
    fix_job_names()
