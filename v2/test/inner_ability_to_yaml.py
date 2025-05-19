#!/usr/bin/env python3

import csv
import yaml
import os
from pathlib import Path

def read_csv(file_path):
    with open(file_path, 'r') as f:
        reader = csv.DictReader(f)
        return list(reader)

def process_inner_ability_data(data):
    characters = {}
    
    # Define presets and lines
    presets = ['P1', 'P2', 'P3']
    lines = ['IA1', 'IA2', 'IA3']
    
    for row in data:
        ign = row['IGN']
        inner_ability = {}
        
        # Process each preset
        for preset_num in range(1, 4):
            preset_key = f'preset_{preset_num}'
            inner_ability[preset_key] = {}
            
            # Process each line in the preset
            for line_num in range(1, 4):
                line_key = f'line_{line_num}'
                csv_key = f'P{preset_num} IA{line_num}'
                
                # Get value from CSV, replace empty string with None
                value = row.get(csv_key, '').strip()
                inner_ability[preset_key][line_key] = value if value else None
        
        characters[ign] = {'innerAbility': inner_ability}
    
    return characters

def main():
    # Get the base directory
    base_dir = Path('/home/my2ndangelic/Documents/GitHub/Maple-Progression-Tracker/v2/data')
    
    # Read inner ability CSV
    inner_ability_data = read_csv(base_dir / 'innerability.csv')
    
    # Process inner ability data
    characters = process_inner_ability_data(inner_ability_data)
    
    # Read existing database.yaml
    with open(base_dir / 'database.yaml', 'r') as f:
        database = yaml.safe_load(f)
    
    # Update inner ability data for each character
    for ign, data in characters.items():
        if ign in database['characters']:
            database['characters'][ign]['innerAbility'] = data['innerAbility']
    
    # Write updated database.yaml
    with open(base_dir / 'database.yaml', 'w') as f:
        f.write('# MapleStory Character Data\n\n')
        yaml.dump(database, f, sort_keys=False, allow_unicode=True, default_flow_style=False)

if __name__ == '__main__':
    main()
