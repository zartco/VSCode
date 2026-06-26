import os
import re
import yaml

def get_portfolio_files():
    portfolio_files = []
    for root, _, files in os.walk('.'):
        if 'node_modules' in root or '.git' in root:
            continue
        for file in files:
            if file.endswith('.md'):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()

                    match = re.match(r'^---\n(.*?)\n---\n(.*)', content, re.DOTALL)
                    if match:
                        frontmatter = yaml.safe_load(match.group(1))
                        body = match.group(2)

                        if frontmatter and isinstance(frontmatter, dict):
                            tags = frontmatter.get('tags', [])
                            status = frontmatter.get('status', '')

                            if isinstance(tags, str):
                                tags = [tags]
                                frontmatter['tags'] = tags

                            has_portfolio_tag = any('portfolio' in tag.lower() for tag in tags)

                            if has_portfolio_tag and status == 'completed':
                                portfolio_files.append({
                                    'filepath': filepath,
                                    'frontmatter': frontmatter,
                                    'body': body
                                })
                except Exception as e:
                    print(f"Error reading {filepath}: {e}")
    return portfolio_files

def scrub_content(content):
    # Scrub local machine path strings (e.g., C:\Users\...)
    content = re.sub(r'[A-Z]:\\[^\s`\'"]+', '[REDACTED_PATH]', content, flags=re.IGNORECASE)
    # Scrub emails
    content = re.sub(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', '[REDACTED_EMAIL]', content)
    return content

def rebuild_portfolio():
    portfolio_files = get_portfolio_files()

    # Read current PORTFOLIO.md or create one
    if os.path.exists('PORTFOLIO.md'):
        with open('PORTFOLIO.md', 'r', encoding='utf-8') as f:
            content = f.read()
    else:
        content = "# Zartco's Academic & Engineering Showcase\n\nThis portfolio documents a four-year computer science progression, dynamically aggregated from active workspace artifacts.\n"

    # We want to replace the dynamic section of PORTFOLIO.md under '## 📋 Automated Discovery & System Logs'
    header = '## 📋 Automated Discovery & System Logs'

    # If the header doesn't exist, append it
    if header not in content:
        # Check if there is a '---' before the last blockquote, insert before it
        if '---\n\n> *This showcase is maintained under perpetual AI stewardship.*' in content:
            content = content.replace('---\n\n> *This showcase is maintained under perpetual AI stewardship.*',
                                      f'---\n\n{header}\n\n---\n\n> *This showcase is maintained under perpetual AI stewardship.*')
        else:
            content += f'\n\n---\n\n{header}\n'

    # Rebuild dynamic section
    dynamic_content = f"{header}\n\n"

    # Group artifacts by competency/tag (using tags or frontmatter to determine group)
    # Since we need to "group artifacts by competency", let's extract groups
    groups = {}
    for item in portfolio_files:
        # Default group
        group = "General"
        # We can extract "competency" from frontmatter or tags. If not, maybe use first tag that is not 'portfolio'
        tags = item['frontmatter'].get('tags', [])
        # Find a suitable group name
        for tag in tags:
            if tag.lower() not in ['portfolio', 'wgu-portfolio', 'completed']:
                # Capitalize words for group name
                group = tag.replace('-', ' ').title()
                break

        if group not in groups:
            groups[group] = []
        groups[group].append(item)

    for group, items in groups.items():
        dynamic_content += f"### {group}\n\n"
        for item in items:
            title = item['frontmatter'].get('title', os.path.basename(item['filepath']))
            date = item['frontmatter'].get('date', '')
            date_str = f" ({date})" if date else ""
            dynamic_content += f"#### {title}{date_str}\n\n"

            body_scrubbed = scrub_content(item['body'])

            # Extract first paragraph or summary for brevity, or just add the whole body?
            # Instructions: "Dynamically rebuild or append these projects to the main root README.md or a PORTFOLIO.md showcase file."
            # Let's include the body but indented or in a section
            dynamic_content += f"{body_scrubbed.strip()}\n\n"

    # Find the section to replace in PORTFOLIO.md
    # Replace from header to the next '---' or end of file
    pattern = re.compile(f'{re.escape(header)}.*?(?=\n\n---|\\Z)', re.DOTALL)
    if pattern.search(content):
        new_content = pattern.sub(dynamic_content.strip(), content)
    else:
        new_content = content # Fallback (shouldn't happen with code above)

    with open('PORTFOLIO.md', 'w', encoding='utf-8') as f:
        f.write(new_content)

if __name__ == '__main__':
    rebuild_portfolio()
