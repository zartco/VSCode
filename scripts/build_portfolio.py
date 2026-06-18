import os
import yaml
import re

def redact_content(text):
    text = re.sub(r'C:\\Users\\[^\\]+\\', '[REDACTED_PATH]\\\\', text)
    text = re.sub(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', '[REDACTED_EMAIL]', text)
    return text

def find_markdown_files(root_dir):
    md_files = []
    for dirpath, _, filenames in os.walk(root_dir):
        if 'node_modules' in dirpath or '.git' in dirpath:
            continue
        for f in filenames:
            if f.endswith('.md'):
                md_files.append(os.path.join(dirpath, f))
    return md_files

def parse_frontmatter(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    match = re.match(r'^---\n(.*?)\n---\n(.*)', content, re.DOTALL)
    if match:
        try:
            frontmatter = yaml.safe_load(match.group(1))
            body = match.group(2)
            return frontmatter, body
        except yaml.YAMLError:
            return None, None
    return None, None

def main():
    root_dir = '.'
    md_files = find_markdown_files(root_dir)

    portfolio_items = []
    for filepath in md_files:
        frontmatter, body = parse_frontmatter(filepath)
        if frontmatter:
            status = frontmatter.get('status', '')
            tags = frontmatter.get('tags', [])
            if status == 'completed' and any('portfolio' in tag for tag in tags):
                title = frontmatter.get('title', os.path.basename(filepath))
                date = frontmatter.get('date', 'Unknown Date')
                portfolio_items.append({
                    'title': title,
                    'date': date,
                    'tags': tags,
                    'filepath': filepath,
                    'body': body
                })

    grouped_items = {}
    for item in portfolio_items:
        # Just put them under a default category or group by first tag
        category = 'General'
        if item['tags']:
            category = item['tags'][0].title().replace('-', ' ')
        if category not in grouped_items:
            grouped_items[category] = []
        grouped_items[category].append(item)

    portfolio_file = 'PORTFOLIO.md'
    if os.path.exists(portfolio_file):
        with open(portfolio_file, 'r', encoding='utf-8') as f:
            content = f.read()
    else:
        content = "# Zartco's Academic & Engineering Showcase\n\n"

    header = '## 📋 Automated Discovery & System Logs'

    new_content = f"\n\n{header}\n\n"
    for category, items in grouped_items.items():
        new_content += f"### {category}\n\n"
        for item in items:
            new_content += f"#### [{item['title']}]({item['filepath']}) - {item['date']}\n"
            # A short preview
            preview = item['body'][:200].strip() + '...'
            preview = redact_content(preview)
            new_content += f"{preview}\n\n"

    if header in content:
        content = content.split(header)[0] + new_content
    else:
        content += new_content

    with open(portfolio_file, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    main()