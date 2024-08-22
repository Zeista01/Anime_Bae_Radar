import re
import json
from collections import defaultdict

def parse_sql_script(file_path):
    with open(file_path, 'r') as file:
        sql_script = file.read()
    
    # Extract table creation statements
    create_table_statements = re.findall(r'CREATE TABLE [\s\S]*?;', sql_script)
    
    # Extract data insertion statements
    insert_statements = re.findall(r'INSERT INTO [\s\S]*?;', sql_script)
    
    return create_table_statements, insert_statements

def parse_create_table_statements(create_table_statements):
    tables = {}
    for statement in create_table_statements:
        table_name = re.search(r'CREATE TABLE (\w+)', statement).group(1)
        columns = re.findall(r'(\w+) [A-Z]+', statement)
        tables[table_name] = columns
    return tables

def parse_insert_statements(insert_statements, tables):
    data = defaultdict(list)
    for statement in insert_statements:
        table_name = re.search(r'INSERT INTO (\w+)', statement).group(1)
        values = re.findall(r'\(([^()]+)\)', statement)
        columns = tables[table_name]
        for value in values:
            row = dict(zip(columns, [v.strip().strip("'") for v in value.split(', ')]))
            data[table_name].append(row)
    return data

# Path to your SQL file
file_path = 'database.sql'

# Parse the SQL script
create_table_statements, insert_statements = parse_sql_script(file_path)

# Parse the table structures
tables = parse_create_table_statements(create_table_statements)

# Parse the data insertions
data = parse_insert_statements(insert_statements, tables)

# Convert the data to JSON format
data_json = json.dumps(data, indent=4)

# Save the JSON string to a file
json_path = 'database.json'
with open(json_path, 'w') as json_file:
    json_file.write(data_json)

print(f"Data has been successfully converted and saved to {json_path}")
