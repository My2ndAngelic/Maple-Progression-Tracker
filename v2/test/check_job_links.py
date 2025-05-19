#!/usr/bin/env python3
import yaml
import csv

# Full name mappings for CSV abbreviations
JOB_FULL_NAMES = {
    'ab': 'Angelic Buster',
    'aran': 'Aran',
    'ark': 'Ark',
    'bam': 'Battle Mage',
    'bishop': 'Bishop',
    'blaster': 'Blaster',
    'bm': 'Bowmaster',
    'bucc': 'Buccaneer',
    'bw': 'Blaze Wizard',
    'cadena': 'Cadena',
    'cm': 'Cannon Master',
    'da': 'Demon Avenger',
    'db': 'Dual Blade',
    'dk': 'Dark Knight',
    'ds': 'Demon Slayer',
    'dw': 'Dawn Warrior',
    'evan': 'Evan',
    'fp': 'Arch Mage (Fire/Poison)',
    'hayato': 'Hayato',
    'hero': 'Hero',
    'hy': 'Hoyoung',
    'il': 'Arch Mage (Ice/Lightning)',
    'illium': 'Illium',
    'kain': 'Kain',
    'kaiser': 'Kaiser',
    'kanna': 'Kanna',
    'khali': 'Khali',
    'kine': 'Kinesis',
    'lara': 'Lara',
    'lumi': 'Luminous',
    'lynn': 'Lynn',
    'mech': 'Mechanic',
    'merc': 'Mercedes',
    'mihile': 'Mihile',
    'mm': 'Marksman',
    'mx': 'Mo Xuan',
    'nl': 'Night Lord',
    'nw': 'Night Walker',
    'pally': 'Paladin',
    'pf': 'Pathfinder',
    'phantom': 'Phantom',
    'sair': 'Corsair',
    'shade': 'Shade',
    'shad': 'Shadower',
    'tb': 'Thunder Breaker',
    'wa': 'Wind Archer',
    'wh': 'Wild Hunter',
    'xenon': 'Xenon',
    'zero': 'Zero',
    'adele': 'Adele'  # Add mapping for lowercase adele
}

def load_csv_data():
    """Load the original CSV data and create a job to link skill mapping."""
    try:
        job_links = {}
        with open('../a_data/joblist.csv', 'r', encoding='utf-8') as f:
            print("Reading CSV file...")
            reader = csv.DictReader(f)
            for row in reader:
                # Convert abbreviated name to full name
                orig_name = row['jobName'].lower()
                job_name = JOB_FULL_NAMES.get(orig_name, row['jobName'])
                link_level = int(row['linkSkillMaxLevel']) if row['linkSkillMaxLevel'] else 0
                job_links[job_name] = link_level
                print(f"CSV: {orig_name} -> {job_name} (Level {link_level})")
        return job_links
    except Exception as e:
        print(f"Error reading CSV: {e}")
        raise

def load_yaml_data():
    """Load the YAML data and create a job to link skill mapping."""
    try:
        with open('../data/joblist.yaml', 'r', encoding='utf-8') as f:
            print("Reading YAML file...")
            data = yaml.safe_load(f)
            job_links = {}
            for job in data['jobs']:
                name = job['jobName']
                level = job.get('linkSkillMaxLevel', 0)
                job_links[name] = level
                print(f"YAML: {name} (Level {level})")
            return job_links
    except Exception as e:
        print(f"Error reading YAML: {e}")
        raise

def compare_link_skills():
    print("Loading data files...")
    csv_data = load_csv_data()
    yaml_data = load_yaml_data()

    print("\nComparing link skill levels...")
    differences = []
    only_in_yaml = []
    only_in_csv = []

    # Check all jobs in both files
    all_jobs = set(csv_data.keys()) | set(yaml_data.keys())
    
    for job in sorted(all_jobs):
        csv_level = csv_data.get(job)
        yaml_level = yaml_data.get(job)
        
        if csv_level is None:
            only_in_yaml.append((job, yaml_level))
        elif yaml_level is None:
            only_in_csv.append((job, csv_level))
        elif csv_level != yaml_level:
            differences.append({
                'job': job,
                'yaml_level': yaml_level,
                'csv_level': csv_level
            })

    # Print results
    if differences:
        print("\nDifferences in link skill levels:")
        print("Job Name".ljust(30) + "YAML Level".ljust(15) + "CSV Level")
        print("-" * 55)
        for diff in differences:
            print(f"{diff['job']:<30}{str(diff['yaml_level']):<15}{diff['csv_level']}")

    if only_in_yaml:
        print("\nJobs only in YAML:")
        for job, level in sorted(only_in_yaml):
            print(f"- {job} (Link Level: {level})")

    if only_in_csv:
        print("\nJobs only in CSV:")
        for job, level in sorted(only_in_csv):
            print(f"- {job} (Link Level: {level})")

    if not any([differences, only_in_yaml, only_in_csv]):
        print("\nAll job names and link skill levels match perfectly!")

if __name__ == '__main__':
    compare_link_skills()
