import os
import re
import yaml
from collections import defaultdict

def anonymize(text):
    urls = []
    def url_repl(match):
        urls.append(match.group(0))
        return f"__URL_PLACEHOLDER_{len(urls)-1}__"

    text = re.sub(r'https?://[^\s<>"]+', url_repl, text)
    text = re.sub(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', '[REDACTED_EMAIL]', text)
    text = re.sub(r'[a-zA-Z]:\\[\S]*', '[REDACTED_PATH]', text)
    text = re.sub(r'(?<!\S)(?:/home|/Users|~)/[\S]*', '[REDACTED_PATH]', text)

    for i, url in enumerate(urls):
        text = text.replace(f"__URL_PLACEHOLDER_{i}__", url)
    return text

def parse_frontmatter(content):
    if content.startswith('---'):
        parts = content.split('---', 2)
        if len(parts) >= 3:
            try:
                fm = yaml.safe_load(parts[1])
                body = parts[2].strip()
                return fm, body
            except yaml.YAMLError:
                pass
    return None, content

def find_completed_portfolio_files():
    files_found = []
    for root, _, files in os.walk('.'):
        if '.git' in root or 'node_modules' in root or '.jules' in root:
            continue
        for file in files:
            if file.endswith('.md'):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                except UnicodeDecodeError:
                    continue

                fm, body = parse_frontmatter(content)
                if fm and isinstance(fm, dict):
                    tags = fm.get('tags', [])
                    if isinstance(tags, str):
                        tags = [t.strip() for t in tags.split(',')]

                    status = fm.get('status', '').lower()

                    if 'portfolio' in tags or 'wgu-portfolio' in tags:
                        if status == 'completed':
                            files_found.append((path, fm, body))
    return files_found

def determine_competency(tags):
    tags_lower = [t.lower() for t in tags]
    if 'system automation' in tags_lower or 'automation' in tags_lower:
        return 'System Automation'
    if 'multi-agent workflows' in tags_lower or 'multi-agent' in tags_lower or 'agent' in tags_lower:
        return 'Multi-Agent Workflows'
    if 'academic competency' in tags_lower or 'learning' in tags_lower or 'academic' in tags_lower:
        return 'Academic Competency'
    return 'Other'

def rebuild_portfolio():
    files = find_completed_portfolio_files()
    if not files:
        print("No completed portfolio files found.")
        return

    # Check if PORTFOLIO.md exists
    portfolio_content = ""
    if os.path.exists('PORTFOLIO.md'):
        with open('PORTFOLIO.md', 'r', encoding='utf-8') as f:
            portfolio_content = f.read()

    # We will look for a dynamic section header to append to
    dynamic_header = "## 📋 Automated Discovery & System Logs"

    if dynamic_header not in portfolio_content:
        portfolio_content += f"\n\n{dynamic_header}\n\n"

    parts = portfolio_content.split(dynamic_header)
    base_content = parts[0].strip()

    new_content = base_content + f"\n\n{dynamic_header}\n\n"

    # Group by competency
    grouped_files = defaultdict(list)
    for path, fm, body in files:
        tags = fm.get('tags', [])
        if isinstance(tags, str):
            tags = [t.strip() for t in tags.split(',')]
        competency = determine_competency(tags)
        grouped_files[competency].append((path, fm, body))

    for competency, comp_files in grouped_files.items():
        new_content += f"### {competency}\n\n"
        for path, fm, body in comp_files:
            title = fm.get('title', os.path.basename(path))
            date = fm.get('date', '')

            anonymized_body = anonymize(body)

            new_content += f"#### {title}\n"
            if date:
                new_content += f"**Date:** {date}\n"
            new_content += "\n" + anonymized_body + "\n\n"
        new_content += "---\n\n"

    with open('PORTFOLIO.md', 'w', encoding='utf-8') as f:
        f.write(new_content)

    print("Rebuilt PORTFOLIO.md")

if __name__ == '__main__':
    rebuild_portfolio()
