import yaml

def cleanup_skills(data):
    if not isinstance(data, dict) or 'jobs' not in data:
        print("Error: Invalid YAML structure")
        return None

    for job in data['jobs']:
        if not isinstance(job, dict):
            continue

        # Initialize skill structure if not present
        if 'skill' not in job:
            job['skill'] = {
                'hyper': {
                    'passive': [],
                    'active': []
                },
                'v': [],
                'hexa': {
                    'origin': [],
                    'mastery': [],
                    'enhancement': []
                }
            }

        # Handle old format skills and merge them into the new structure
        # Handle hyper skills
        if 'hyper' in job and isinstance(job['hyper'], list):
            if len(job['hyper']) > 3:
                job['skill']['hyper']['passive'] = job['hyper'][:-3]
                job['skill']['hyper']['active'] = job['hyper'][-3:]
            else:
                job['skill']['hyper']['active'] = job['hyper']

        # Handle v skills
        if 'v' in job and isinstance(job['v'], list):
            job['skill']['v'].extend(job['v'])
        if 'vskills' in job and isinstance(job['vskills'], list):
            job['skill']['v'].extend(job['vskills'])

        # Handle hexa skills
        if 'hexa' in job and isinstance(job['hexa'], dict):
            for section in ['origin', 'mastery', 'enhancement']:
                if section in job['hexa'] and isinstance(job['hexa'][section], list):
                    job['skill']['hexa'][section].extend(job['hexa'][section])
        if 'hexaskills' in job and isinstance(job['hexaskills'], dict):
            for section in ['origin', 'mastery', 'enhancement']:
                if section in job['hexaskills'] and isinstance(job['hexaskills'][section], list):
                    job['skill']['hexa'][section].extend(job['hexaskills'][section])

        # Remove duplicates while preserving order
        if 'skill' in job:
            if isinstance(job['skill'].get('v'), list):
                job['skill']['v'] = list(dict.fromkeys(s for s in job['skill']['v'] if s))
            if isinstance(job['skill'].get('hexa'), dict):
                for section in ['origin', 'mastery', 'enhancement']:
                    if isinstance(job['skill']['hexa'].get(section), list):
                        job['skill']['hexa'][section] = list(dict.fromkeys(s for s in job['skill']['hexa'][section] if s))

        # Remove old format entries
        for key in ['hyper', 'v', 'vskills', 'hexa', 'hexaskills']:
            if key in job:
                job.pop(key)
        
        # Ensure there's a skill section with the correct structure
        if 'skill' not in job:
            job['skill'] = {
                'hyper': {
                    'passive': [],
                    'active': []
                },
                'v': [],
                'hexa': {
                    'origin': [],
                    'mastery': [],
                    'enhancement': []
                }
            }
        else:
            # Make sure all sections exist
            if 'hyper' not in job['skill']:
                job['skill']['hyper'] = {'passive': [], 'active': []}
            elif isinstance(job['skill']['hyper'], dict):
                if 'passive' not in job['skill']['hyper']:
                    job['skill']['hyper']['passive'] = []
                if 'active' not in job['skill']['hyper']:
                    job['skill']['hyper']['active'] = []
            
            if 'v' not in job['skill']:
                job['skill']['v'] = []
            
            if 'hexa' not in job['skill']:
                job['skill']['hexa'] = {'origin': [], 'mastery': [], 'enhancement': []}
            elif isinstance(job['skill']['hexa'], dict):
                for section in ['origin', 'mastery', 'enhancement']:
                    if section not in job['skill']['hexa']:
                        job['skill']['hexa'][section] = []
    
    return data

def main():
    input_file = '../data/joblist.yaml'
    output_file = '../data/joblist_cleaned.yaml'
    
    try:
        # Read the YAML file
        with open(input_file, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)
        
        # Clean up the skills
        cleaned_data = cleanup_skills(data)
        if cleaned_data is None:
            print("Error: Failed to clean up skills")
            return
        
        # Write the cleaned YAML
        with open(output_file, 'w', encoding='utf-8') as f:
            yaml.dump(cleaned_data, f, allow_unicode=True, sort_keys=False, default_flow_style=False)
        
        print(f"Cleaned YAML has been written to {output_file}")
        
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    main()
