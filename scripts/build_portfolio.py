import os
import re
import yaml

VAULT_DIRS = ['.']

def redact_content(content):
    # Scrub local paths
    content = re.sub(r'[a-zA-Z]:\\[^\s]+', '[REDACTED_PATH]', content)
    # Scrub emails
    content = re.sub(r'[\w\.-]+@[\w\.-]+\.\w+', '[REDACTED_EMAIL]', content)
    return content

def get_portfolio_files():
    files_to_process = []
    for dir_path in VAULT_DIRS:
        if not os.path.exists(dir_path):
            continue
        for root, _, files in os.walk(dir_path):
            if 'node_modules' in root or '.git' in root or '.jules' in root:
                continue
            for file in files:
                if file.endswith('.md'):
                    files_to_process.append(os.path.join(root, file))

    portfolio_artifacts = []

    for filepath in files_to_process:
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            # Simple frontmatter parsing
            if not content.startswith('---'):
                continue

            parts = content.split('---', 2)
            if len(parts) < 3:
                continue

            frontmatter_str = parts[1]
            body = parts[2].strip()

            try:
                metadata = yaml.safe_load(frontmatter_str)
            except yaml.YAMLError:
                continue

            if not isinstance(metadata, dict):
                continue

            if metadata.get('status') != 'completed':
                continue

            tags = metadata.get('tags', [])
            if isinstance(tags, str):
                tags = [t.strip() for t in tags.split(',')]
            elif not isinstance(tags, list):
                tags = []

            is_portfolio = any('portfolio' in str(t).lower() for t in tags)
            if not is_portfolio:
                continue

            portfolio_artifacts.append({
                'title': metadata.get('title', os.path.basename(filepath)),
                'date': metadata.get('date', ''),
                'tags': tags,
                'body': redact_content(body),
                'path': filepath
            })

        except Exception as e:
            print(f"Error processing {filepath}: {e}")

    return portfolio_artifacts

def build_portfolio():
    artifacts = get_portfolio_files()

    groups = {
        'Academic Competency': [],
        'System Automation': [],
        'Multi-Agent Workflows': [],
        'Other Discovery': []
    }

    for item in artifacts:
        tags = [str(t).lower() for t in item['tags']]
        if 'academic' in tags or 'wgu-portfolio' in tags or 'learning' in tags:
            groups['Academic Competency'].append(item)
        elif 'system' in tags or 'automation' in tags:
            groups['System Automation'].append(item)
        elif 'agent' in tags or 'multi-agent' in tags or 'federation' in tags:
            groups['Multi-Agent Workflows'].append(item)
        else:
            groups['Other Discovery'].append(item)

    dynamic_section = "## 📋 Automated Discovery & System Logs\n\n"

    for group_name, items in groups.items():
        if not items:
            continue
        dynamic_section += f"### {group_name}\n\n"
        for item in items:
            dynamic_section += f"#### {item['title']} ({item['date']})\n"
            dynamic_section += f"{item['body']}\n\n"

    if os.path.exists('PORTFOLIO.md'):
        with open('PORTFOLIO.md', 'r', encoding='utf-8') as f:
            portfolio_content = f.read()
    else:
        portfolio_content = "# Zartco's Academic & Engineering Showcase\n\nThis portfolio documents a four-year computer science progression, dynamically aggregated from active workspace artifacts.\n"

    marker = "## 📋 Automated Discovery & System Logs"

    if marker in portfolio_content:
        parts = portfolio_content.split(marker)
        new_content = parts[0] + dynamic_section
    else:
        new_content = portfolio_content + "\n\n" + dynamic_section

    with open('PORTFOLIO.md', 'w', encoding='utf-8') as f:
        f.write(new_content)

    print("Portfolio built successfully.")

if __name__ == "__main__":
    build_portfolio()
