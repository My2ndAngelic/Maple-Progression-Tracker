#!/usr/bin/env python3
import yaml
import csv

def load_csv_data():
    """Load the original CSV data and create a job to link skill mapping."""
    job_links = {}
    with open('../a_data/joblist.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            job_name = row['jobName']
            link_level = int(row['linkSkillMaxLevel']) if row['linkSkillMaxLevel'] else 0
            job_links[job_name] = link_level
    return job_links

def load_yaml_data():
    """Load the YAML data and create a job to link skill mapping."""
    with open('../data/joblist.yaml', 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)
    return {job['jobName']: job.get('linkSkillMaxLevel', 0) for job in data['jobs']}

def compare_link_skills():
    print("Loading data files...")
    csv_data = load_csv_data()
    yaml_data = load_yaml_data()

    print("\nComparing link skill levels...")
    differences = []
    only_in_yaml = []
    only_in_csv = []

    # Check for differences and jobs only in YAML
    for job, yaml_link in yaml_data.items():
        if job in csv_data:
            csv_link = csv_data[job]
            if yaml_link != csv_link:
                differences.append({
                    'job': job,
                    'yaml_level': yaml_link,
                    'csv_level': csv_link
                })
        else:
            only_in_yaml.append(job)

    # Check for jobs only in CSV
    for job in csv_data:
        if job not in yaml_data:
            only_in_csv.append(job)

    # Print results
    if differences:
        print("\nDifferences found:")
        print("Job Name".ljust(30) + "YAML Level".ljust(15) + "CSV Level")
        print("-" * 55)
        for diff in differences:
            print(f"{diff['job']:<30}{str(diff['yaml_level']):<15}{diff['csv_level']}")

    if only_in_yaml:
        print("\nJobs only in YAML:")
        for job in only_in_yaml:
            print(f"- {job} (Link Level: {yaml_data[job]})")

    if only_in_csv:
        print("\nJobs only in CSV:")
        for job in only_in_csv:
            print(f"- {job} (Link Level: {csv_data[job]})")

    if not any([differences, only_in_yaml, only_in_csv]):
        print("\nNo differences found! All link skill levels match.")

if __name__ == '__main__':
    compare_link_skills()
