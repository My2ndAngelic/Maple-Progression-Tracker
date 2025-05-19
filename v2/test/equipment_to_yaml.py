#!/usr/bin/env python3

import csv
import yaml
import os
from pathlib import Path

def read_csv(file_path):
    with open(file_path, 'r') as f:
        reader = csv.DictReader(f)
        return list(reader)

def get_full_job_name(short_name):
    job_names = {
        'dk': 'Dark Knight',
        'ab': 'Angelic Buster',
        'mm': 'Marksman',
        'aran': 'Aran',
        'shade': 'Shade',
        'bm': 'Bowmaster',
        'hero': 'Hero',
        'mihile': 'Mihile',
        'wa': 'Wind Archer',
        'pally': 'Paladin',
        'khali': 'Khali',
        'mx': 'Mo Xuan',
        'pf': 'Pathfinder',
        'lumi': 'Luminous',
        'bw': 'Blaze Wizard',
        'tb': 'Thunder Breaker',
        'nw': 'Night Walker'
    }
    return job_names.get(short_name, short_name)  # Return original if no mapping exists

def process_equipment_data(equipment_data, accessory_data):
    characters = {}
    
    # Equipment categories
    armor_slots = ['hat', 'top', 'bottom', 'shoe', 'cape', 'secondary', 'shoulder', 'gloves']
    accessory_slots = ['Face', 'Eye', 'Ear', 'Ring 1', 'Ring 2', 'Ring 3', 'Ring 4', 
                      'Pendant 1', 'Pendant 2', 'Belt', 'Badge', 'Medal', 'Android', 'Heart']
    etc_slots = ['Dragon', 'Haku']  # For Evan and Kanna specific items
    
    # Process equipment.csv data
    for row in equipment_data:
        ign = row['IGN']
        if ign not in characters:
            characters[ign] = {'equipment': {
                'armor': {},
                'accessory': {},
                'etc': {}
            }}
            
        equip = characters[ign]['equipment']
        
        # Process armor slots
        equip['armor'].update({
            'hat': row['Hat'] if row['Hat'] else None,
            'top': row['Top'] if row['Top'] else None,
            'bottom': row['Bottom'] if row['Bottom'] else None,
            'shoe': row['Shoe'] if row['Shoe'] else None,
            'cape': row['Cape'] if row['Cape'] else None,
            'secondary': row['Secondary'] if row['Secondary'] else None,
            'shoulder': row['Shoulder'] if row['Shoulder'] else None,
            'gloves': row['Gloves'] if row['Gloves'] else None
        })
        
        # Move emblem to accessory section
        if 'Emblem' in row:
            characters[ign]['equipment']['accessory']['emblem'] = row['Emblem'] if row['Emblem'] else None
    
    # Process accessory.csv data
    for row in accessory_data:
        ign = row['IGN']
        if ign not in characters:
            characters[ign] = {'equipment': {
                'armor': {},
                'accessory': {},
                'etc': {}
            }}
            
        # Convert all accessory slots
        accessory_equip = {}
        for slot in accessory_slots:
            formatted_slot = slot.lower().replace(' ', '_')
            accessory_equip[formatted_slot] = row[slot] if row[slot] else None
            
        characters[ign]['equipment']['accessory'].update(accessory_equip)
    
    return characters

def update_equipment_yaml():
    # Equipment set definitions
    equipment_data = {
        'armor': {
            'sets': [
                {'name': 'Root Abyss', 'slots': ['hat', 'top', 'bottom']},
                {'name': 'AbsoLab', 'slots': ['weapon', 'shoe', 'cape', 'gloves', 'shoulder']},
                {'name': 'Arcane Umbra', 'slots': ['weapon', 'shoe', 'cape', 'gloves', 'shoulder']},
                {'name': 'Magnus', 'slots': ['shoulder']}
            ],
            'secondary': {
                'types': [
                    'Princess No',
                    'Evolving',
                    'Regular',
                    'Deimos Shield'
                ]
            }
        },
        'accessory': {
            'sets': [
                {'name': 'Boss Accessory', 'slots': ['face', 'eye', 'pendant_1', 'pendant_2', 'belt']},
                {'name': 'Gollux', 'slots': ['ring_1', 'ring_2', 'pendant_1', 'pendant_2', 'belt']},
                {'name': 'Dark Boss', 'slots': ['face', 'eye', 'pendant_1']}
            ],
            'emblem': {
                'types': ['Gold']
            }
        },
        'etc': {
            'types': [
                'Dragon',  # Evan
                'Haku'    # Kanna
            ]
        }
    }
    
    # Write to equipment.yaml
    base_dir = Path('/home/my2ndangelic/Documents/GitHub/Maple-Progression-Tracker/v2/data')
    with open(base_dir / 'equipment.yaml', 'w') as f:
        f.write('# MapleStory Equipment Data\n\n')
        yaml.dump(equipment_data, f, sort_keys=False, allow_unicode=True, default_flow_style=False)

def main():
    # Get the base directory
    base_dir = Path('/home/my2ndangelic/Documents/GitHub/Maple-Progression-Tracker/v2/data')
    
    # Read CSV files
    equipment_data = read_csv(base_dir / 'equipment.csv')
    accessory_data = read_csv(base_dir / 'accessory.csv')
    
    # Process equipment data
    characters = process_equipment_data(equipment_data, accessory_data)
    
    # Read existing database.yaml
    with open(base_dir / 'database.yaml', 'r') as f:
        database = yaml.safe_load(f)
    
    # Update equipment data and job names for each character
    for ign, data in characters.items():
        if ign in database['characters']:
            # Update equipment data
            database['characters'][ign]['equipment'] = data['equipment']
            # Update job name to full name
            if 'basic' in database['characters'][ign]:
                short_job = database['characters'][ign]['basic'].get('jobName')
                if short_job:
                    database['characters'][ign]['basic']['jobName'] = get_full_job_name(short_job)
    
    # Write updated database.yaml
    with open(base_dir / 'database.yaml', 'w') as f:
        f.write('# MapleStory Character Data\n\n')
        yaml.dump(database, f, sort_keys=False, allow_unicode=True, default_flow_style=False)
    
    # Update equipment.yaml with new structure
    update_equipment_yaml()

if __name__ == '__main__':
    main()
