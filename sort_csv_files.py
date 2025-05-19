import csv
import os

def read_csv(filename):
    rows = []
    with open(filename, 'r') as f:
        # Skip comment lines that start with //
        lines = [line for line in f if not line.strip().startswith('//')]
        reader = csv.DictReader(lines)
        return list(reader)

def write_csv(filename, fieldnames, rows):
    # Read original file to preserve comments at the top
    with open(filename, 'r') as f:
        comments = [line for line in f if line.strip().startswith('//')]
    
    # Write the file with comments preserved
    with open(filename, 'w') as f:
        # Write comments first
        f.writelines(comments)
        
        # Write the sorted data
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

def sort_csv_files():
    # Read account.csv to get the IGN order
    account_data = read_csv('data/account.csv')
    # Create a list of IGNs in the order they appear
    ign_list = [row['IGN'] for row in account_data]
    
    # Create a dictionary mapping IGN to its position
    ign_order = {ign: i for i, ign in enumerate(ign_list)}

    # List of CSV files to sort
    csv_files = ['accessory.csv', 'arcane.csv', 'cash.csv', 'equipment.csv', 'innerability.csv', 'sacred.csv']

    for csv_file in csv_files:
        filepath = os.path.join('data', csv_file)
        if not os.path.exists(filepath):
            print(f"Warning: {filepath} not found")
            continue

        # Read the CSV file
        rows = read_csv(filepath)
        if not rows:
            continue

        # Create a list for sorted rows
        sorted_rows = []
        # First add rows that match IGNs in account.csv in order
        for ign in ign_list:
            for row in rows:
                if row['IGN'] == ign:
                    sorted_rows.append(row)
                    break
        
        # Then add any remaining rows that weren't in account.csv
        for row in rows:
            if row['IGN'] not in ign_list:
                sorted_rows.append(row)

        # Write the sorted rows back to the file
        write_csv(filepath, rows[0].keys(), sorted_rows)
        print(f"Sorted {filepath}")

if __name__ == '__main__':
    sort_csv_files()
