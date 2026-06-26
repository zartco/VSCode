import os
import yaml
import re
from collections import defaultdict

PORTFOLIO_FILE = 'PORTFOLIO.md'
HEADER = '## 📋 Automated Discovery & System Logs'

def anonymize(text):
    text = re.sub(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', '[REDACTED_EMAIL]', text)

    urls = re.findall(r'https?://[^\s]+', text)
    for i, url in enumerate(urls):
        text = text.replace(url, f"__URL_PLACEHOLDER_{i}__")

    text = re.sub(r'([A-Za-z]:\\[\w\\\-.]+)|(/[\w/\-.]+)', '[REDACTED_PATH]', text)

    for i, url in enumerate(urls):
        text = text.replace(f"__URL_PLACEHOLDER_{i}__", url)

    return text

def parse_frontmatter(content):
    match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if match:
        try:
            return yaml.safe_load(match.group(1))
        except yaml.YAMLError:
            pass
    return None

def build_portfolio():
    portfolio_files = []
    for root, dirs, files in os.walk('.'):
        if 'node_modules' in root or '.git' in root:
            continue
        for file in files:
            if file.endswith('.md'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                    fm = parse_frontmatter(content)
                    if fm and isinstance(fm, dict):
                        status = fm.get('status')
                        tags = fm.get('tags', [])
                        if isinstance(tags, str):
                            tags = [tags]
                        if not tags:
                            tags = []
                        is_portfolio = any('portfolio' in t.lower() for t in tags)
                        if status == 'completed' and is_portfolio:
                            portfolio_files.append((filepath, fm, content))

    grouped = defaultdict(list)
    for filepath, fm, content in portfolio_files:
        title = fm.get('title', os.path.basename(filepath))

        # Try to infer category from tags or use 'Misc'
        category = 'Misc'
        tags = fm.get('tags', [])
        if isinstance(tags, str):
             tags = [tags]
        if tags is None:
             tags = []

        if 'wgu-portfolio' in tags or 'learning' in tags or 'discovery' in tags:
            category = 'Academic Competency'
        elif 'git-stewardship' in tags or 'maintenance' in tags:
            category = 'System Automation'
        elif 'multi-agent' in tags or 'sync' in tags or 'handoff' in tags:
            category = 'Multi-Agent Workflows'
        elif 'precalc' in tags:
            category = 'Academic Competency'
        elif 'wgu' in [t.lower() for t in tags]:
             category = 'Academic Competency'

        content_no_fm = re.sub(r'^---\n.*?\n---', '', content, flags=re.DOTALL).strip()
        grouped[category].append((title, filepath, content_no_fm))

    with open(PORTFOLIO_FILE, 'r', encoding='utf-8') as f:
        existing_portfolio = f.read()

    if existing_portfolio.find(HEADER) != -1:
        base_portfolio = existing_portfolio[:existing_portfolio.find(HEADER)]
    else:
        base_portfolio = existing_portfolio + '\n\n'

    new_section = HEADER + '\n\n'
    for category, items in grouped.items():
        new_section += f'### {category}\n\n'
        for title, filepath, content in items:
            new_section += f'#### [{title}]({filepath})\n'
            preview = anonymize(content[:200]) + '...\n\n'
            new_section += preview

    with open(PORTFOLIO_FILE, 'w', encoding='utf-8') as f:
        f.write(base_portfolio + new_section)
    print(f"Portfolio built successfully. Found {len(portfolio_files)} artifacts.")

if __name__ == '__main__':
    build_portfolio()
