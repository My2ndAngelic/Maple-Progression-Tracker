#!/usr/bin/env python3
"""
This script reads the account.csv file and sorts the entries by level.
It can sort in either ascending or descending order.
"""

import csv
import os
import argparse

def sort_account_csv_by_level(file_path, ascending=False):
    """
    Sort the account.csv file by level.
    
    Args:
        file_path: Path to the account.csv file
        ascending: If True, sort in ascending order; otherwise, sort in descending order
    """
    # Check if file exists
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} not found.")
        return False
        
    try:
        # Read CSV file
        with open(file_path, 'r') as file:
            # Check if the first line is a comment
            first_line = file.readline().strip()
            has_comment = first_line.startswith('//')
            
            # Reset file pointer to beginning
            file.seek(0)
            
            # Read the data
            reader = csv.reader(file)
            data = list(reader)
            
            # Extract header and data
            if has_comment:
                comment = data[0]
                header = data[1]
                rows = data[2:]
            else:
                comment = None
                header = data[0]
                rows = data[1:]
                
            # Sort the data by level
            sorted_rows = sorted(rows, key=lambda x: int(x[2]) if len(x) >= 3 and x[2].strip() else 0, 
                               reverse=not ascending)
            
            # Write the sorted data back to the file
            with open(file_path, 'w') as file:
                writer = csv.writer(file)
                
                # Write comment if it exists
                if has_comment:
                    writer.writerow(comment)
                    
                # Write header and sorted data
                writer.writerow(header)
                writer.writerows(sorted_rows)
            
            order_text = "ascending" if ascending else "descending"
            print(f"Successfully sorted {file_path} by level in {order_text} order.")
            return True
        
    except Exception as e:
        print(f"Error sorting file: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    # Set up argument parser
    parser = argparse.ArgumentParser(description='Sort account.csv by level')
    parser.add_argument('-a', '--ascending', action='store_true', 
                      help='Sort in ascending order (lowest level first)')
    parser.add_argument('-d', '--descending', action='store_true', 
                      help='Sort in descending order (highest level first, default)')
    parser.add_argument('-f', '--file', type=str, 
                      help='Path to account.csv file (optional)')
    
    args = parser.parse_args()
    
    # Determine sort order (default is descending)
    ascending = args.ascending and not args.descending
    
    # Determine file path
    if args.file:
        file_path = args.file
    else:
        file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 
                               "data", "account.csv")
    
    # Print the path and sort order that will be used
    order_text = "ascending" if ascending else "descending"
    print(f"Sorting file: {file_path} in {order_text} order")
    
    # Sort the file
    success = sort_account_csv_by_level(file_path, ascending)
    
    if success:
        print(f"Account.csv has been sorted by level in {order_text} order.")
    else:
        print("Failed to sort account.csv. Check the error messages above.")
