#!/usr/bin/env python3
import yaml

# Job name mappings from short to full
JOB_MAPPINGS = {
    'fp': 'Fire Poison Mage',
    'il': 'Ice Lightning Mage',
    'bucc': 'Buccaneer',
    'sair': 'Corsair',
    'cm': 'Cannon Master',
    'nl': 'Night Lord',
    'db': 'Dual Blade',
    'shad': 'Shadower',
    'bam': 'Battle Mage',
    'mech': 'Mechanic',
    'dw': 'Dawn Warrior',
    'da': 'Demon Avenger',
    'ds': 'Demon Slayer',
    'wh': 'Wild Hunter',
    'kine': 'Kinesis',
    'hy': 'Hoyoung',
    'merc': 'Mercedes',
    'lynn': 'Luminous'
}

def fix_job_names():
    # Load the database
    with open('../data/database.yaml', 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)

    # Keep track of changes
    changes_made = []

    # Update job names
    for char_name, char_data in data['characters'].items():
        if 'basic' in char_data and 'job_name' in char_data['basic']:
            old_name = char_data['basic']['job_name']
            new_name = JOB_MAPPINGS.get(old_name.lower(), old_name)
            if new_name != old_name:
                changes_made.append(f"Changed {char_name}'s job from '{old_name}' to '{new_name}'")
                char_data['basic']['job_name'] = new_name

    # Save the updated database
    with open('../data/database.yaml', 'w', encoding='utf-8') as f:
        yaml.dump(data, f, allow_unicode=True, sort_keys=False)

    # Print changes
    if changes_made:
        print("\nChanges made:")
        for change in changes_made:
            print(f"- {change}")
    else:
        print("\nNo changes were needed.")

if __name__ == '__main__':
    fix_job_names()
