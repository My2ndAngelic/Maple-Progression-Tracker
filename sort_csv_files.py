#!/usr/bin/env python3
"""
Script to sort all CSV files in the data directory based on IGN rankings.
Sorting criteria:
1. Level (descending) - from account.csv
2. Faction (alphabetical) - from joblist.csv  
3. Archetype (specific order: Warrior, Magician, Archer, Thief, Pirate) - from joblist.csv
"""

import csv
import os
from pathlib import Path

def load_account_data(account_file):
    """Load account data with IGN to level mapping and job mapping."""
    ign_to_level = {}
    ign_to_job = {}
    
    with open(account_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            ign = row['IGN']
            level = int(row['level']) if row['level'] else 0
            job = row['jobName']
            ign_to_level[ign] = level
            ign_to_job[ign] = job
    
    return ign_to_level, ign_to_job

def load_job_data(joblist_file):
    """Load job data with job to faction and archetype mapping."""
    job_to_faction = {}
    job_to_archetype = {}
    
    with open(joblist_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            job = row['jobName']
            faction = row['faction']
            archetype = row['archetype']
            job_to_faction[job] = faction
            job_to_archetype[job] = archetype
    
    return job_to_faction, job_to_archetype

def get_sort_key(ign, ign_to_level, ign_to_job, job_to_faction, job_to_archetype):
    """Generate sort key for an IGN based on the specified criteria."""
    # Get level (default to 0 if not found)
    level = ign_to_level.get(ign, 0)
    
    # Get job info
    job = ign_to_job.get(ign, '')
    faction = job_to_faction.get(job, 'ZZZ_Unknown')  # Put unknown at the end
    archetype = job_to_archetype.get(job, 'ZZZ_Unknown')
    
    # Define archetype order
    archetype_order = {
        'Warrior': 1,
        'Magician': 2,
        'Archer': 3,
        'Thief': 4,
        'Pirate': 5
    }
    archetype_sort_value = archetype_order.get(archetype, 999)  # Unknown archetypes go last
    
    # Return sort key: (negative level for descending, faction alphabetical, archetype order)
    return (-level, faction, archetype_sort_value, ign)

def sort_csv_file(csv_file, ign_to_level, ign_to_job, job_to_faction, job_to_archetype):
    """Sort a CSV file based on IGN ranking criteria."""
    print(f"Sorting {csv_file}...")
    
    # Read the CSV file
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)
        rows = list(reader)
    
    # Filter out empty rows
    rows = [row for row in rows if row and len(row) > 0]
    
    # Determine which column contains the IGN
    # For account.csv, IGN is in column 1, for others it's in column 0
    ign_column = 1 if 'account.csv' in str(csv_file) else 0
    
    # Filter rows that have the IGN column and non-empty IGN
    rows = [row for row in rows if len(row) > ign_column and row[ign_column].strip()]
    
    # Sort rows based on IGN 
    rows.sort(key=lambda row: get_sort_key(
        row[ign_column], ign_to_level, ign_to_job, job_to_faction, job_to_archetype
    ))
    
    # Write back to file
    with open(csv_file, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(rows)
    
    print(f"✓ Sorted {csv_file}")

def main():
    """Main function to sort all CSV files."""
    data_dir = Path(__file__).parent / 'data'
    
    # File paths
    account_file = data_dir / 'account.csv'
    joblist_file = data_dir / 'joblist.csv'
    
    # Load reference data
    print("Loading reference data...")
    ign_to_level, ign_to_job = load_account_data(account_file)
    job_to_faction, job_to_archetype = load_job_data(joblist_file)
    
    print(f"Loaded {len(ign_to_level)} IGNs with level data")
    print(f"Loaded {len(job_to_faction)} jobs with faction/archetype data")
    
    # Get all CSV files except joblist.csv
    csv_files = []
    for file in data_dir.glob('*.csv'):
        if file.name != 'joblist.csv':
            csv_files.append(file)
    
    print(f"\nFound {len(csv_files)} CSV files to sort:")
    for file in csv_files:
        print(f"  - {file.name}")
    
    # Sort each CSV file
    print(f"\nStarting to sort files...")
    for csv_file in csv_files:
        try:
            sort_csv_file(csv_file, ign_to_level, ign_to_job, job_to_faction, job_to_archetype)
        except Exception as e:
            print(f"✗ Error sorting {csv_file}: {e}")
    
    print(f"\n✓ Completed sorting all CSV files!")
    
    # Display sorting preview for sacred.csv
    print(f"\nPreview of sorted IGNs (from sacred.csv):")
    sacred_file = data_dir / 'sacred.csv'
    if sacred_file.exists():
        with open(sacred_file, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            header = next(reader)
            rows = list(reader)
            
        print("Rank | IGN | Level | Faction | Archetype")
        print("-" * 50)
        for i, row in enumerate(rows[:10], 1):  # Show top 10
            if row and row[0].strip():
                ign = row[0]
                level = ign_to_level.get(ign, 0)
                job = ign_to_job.get(ign, 'Unknown')
                faction = job_to_faction.get(job, 'Unknown')
                archetype = job_to_archetype.get(job, 'Unknown')
                print(f"{i:4d} | {ign:15s} | {level:5d} | {faction:15s} | {archetype}")

if __name__ == '__main__':
    main()
