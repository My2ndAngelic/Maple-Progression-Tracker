from bs4 import BeautifulSoup

html = """
<h3>Title 3.1</h3>
<p>Whatever 1</p>
<p>Whatever 2</p>

<h3>Title 3.2</h3>
<p>Whatever 3</p>
<p>Whatever 4</p>
"""

soup = BeautifulSoup(html, 'html.parser')

# Find the specific <h3> tag
target_h3 = soup.find('h3', string='Title 3.1')

# Initialize an empty list to collect <p> tags
results = []

# Loop through the siblings after the target <h3>
for sibling in target_h3.find_next_siblings():
    if sibling.name == 'h3':
        break  # Stop when the next <h3> is found
    if sibling.name == 'p':
        results.append(sibling.get_text())

# Print the result
for text in results:
    print(text)
