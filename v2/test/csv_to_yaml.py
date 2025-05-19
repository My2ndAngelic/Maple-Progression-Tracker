#!/usr/bin/env python3

import csv
import yaml
import os
from pathlib import Path

def read_csv(file_path):
    with open(file_path, 'r') as f:
        reader = csv.DictReader(f)
        return list(reader)

def convert_to_int(value):
    try:
        return int(value)
    except (ValueError, TypeError):
        if value == '':
            return None
        return value

def process_account_data(data):
    characters = {}
    for row in data:
        characters[row['IGN']] = {
            'basic': {
                'jobName': row['jobName'],
                'level': convert_to_int(row['level'])
            }
        }
    return characters

def process_equipment_data(characters, data):
    for row in data:
        ign = row['IGN']
        if ign in characters:
            characters[ign]['equipment'] = {
                'weapon': row['Weapon'],
                'secondary': row['Secondary'],
                'emblem': row['Emblem'],
                'hat': row['Hat'],
                'top': row['Top'],
                'bottom': row['Bottom'],
                'shoe': row['Shoe'] if row['Shoe'] else None,
                'cape': row['Cape'] if row['Cape'] else None,
                'gloves': row['Gloves'] if row['Gloves'] else None,
                'shoulder': row['Shoulder'] if row['Shoulder'] else None
            }

def process_arcane_data(characters, data):
    for row in data:
        ign = row['IGN']
        if ign in characters:
            if 'symbols' not in characters[ign]:
                characters[ign]['symbols'] = {}
            characters[ign]['symbols']['arcane'] = {
                'Vanishing Journey': convert_to_int(row['Vanishing Journey']),
                'Chu Chu Island': convert_to_int(row['Chu Chu Island']),
                'Lachelein': convert_to_int(row['Lachelein']),
                'Arcana': convert_to_int(row['Arcana']),
                'Morass': convert_to_int(row['Morass']),
                'Esfera': convert_to_int(row['Esfera'])
            }

def process_sacred_data(characters, data):
    for row in data:
        ign = row['IGN']
        if ign in characters:
            if 'symbols' not in characters[ign]:
                characters[ign]['symbols'] = {}
            characters[ign]['symbols']['sacred'] = {
                'Cernium': convert_to_int(row['Cernium']),
                'Hotel Arcus': convert_to_int(row['Hotel Arcus']),
                'Odium': convert_to_int(row['Odium']),
                'Shangri-La': convert_to_int(row['Shangri-La']),
                'Arteria': convert_to_int(row['Arteria']),
                'Carcion': convert_to_int(row['Carcion'])
            }

def process_inner_ability_data(characters, data):
    for row in data:
        ign = row['IGN']
        if ign in characters:
            characters[ign]['innerAbility'] = {
                'preset1': {'line1': row['P1 IA1'] if row['P1 IA1'] else None},
                'preset2': {'line1': row['P2 IA1'] if row['P2 IA1'] else None},
                'preset3': {'line1': row['P3 IA1'] if row['P3 IA1'] else None}
            }

def process_cash_data(characters, data):
    for row in data:
        ign = row['IGN']
        if ign in characters:
            characters[ign]['cash'] = {
                'petSnack': row['Petsnack'].lower() == 'yes'
            }

def main():
    # Get the base directory
    base_dir = Path('/home/my2ndangelic/Documents/GitHub/Maple-Progression-Tracker/v2/data')
    
    # Initialize the database with just characters
    database = {
        'characters': {}
    }

    # Process account data first to create character entries
    account_data = read_csv(base_dir / 'account.csv')
    database['characters'] = process_account_data(account_data)

    # Process other data files
    process_equipment_data(database['characters'], read_csv(base_dir / 'equipment.csv'))
    process_arcane_data(database['characters'], read_csv(base_dir / 'arcane.csv'))
    process_sacred_data(database['characters'], read_csv(base_dir / 'sacred.csv'))
    process_inner_ability_data(database['characters'], read_csv(base_dir / 'innerability.csv'))
    process_cash_data(database['characters'], read_csv(base_dir / 'cash.csv'))

    # Write to separate YAML files
    with open(base_dir / 'database.yaml', 'w') as f:
        f.write('# MapleStory Character Data\n\n')
        yaml.dump(database, f, sort_keys=False, allow_unicode=True, default_flow_style=False)

if __name__ == '__main__':
    main()
