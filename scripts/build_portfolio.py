import os
import re
import yaml
from pathlib import Path

def redact_content(content):
    # Scrub local paths/emails ([REDACTED_PATH], [REDACTED_EMAIL])
    # Windows paths like C:\Users\Zartc\...
    content = re.sub(r'[a-zA-Z]:\\[\w\\\-\.]+', '[REDACTED_PATH]', content)
    # Unix-like paths (heuristics)
    content = re.sub(r'(?<= )/[a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-/]+', '[REDACTED_PATH]', content)
    # Emails
    content = re.sub(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', '[REDACTED_EMAIL]', content)
    return content

def extract_frontmatter(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        return None, None

    match = re.match(r'^---\n(.*?)\n---\n(.*)', content, re.DOTALL)
    if match:
        try:
            frontmatter = yaml.safe_load(match.group(1))
            body = match.group(2)
            return frontmatter, body
        except yaml.YAMLError:
            pass
    return None, content

def build_portfolio():
    completed_artifacts = []
    for root, dirs, files in os.walk('.'):
        if '.git' in root or 'node_modules' in root:
            continue
        for file in files:
            if file.endswith('.md'):
                file_path = os.path.join(root, file)
                if 'PORTFOLIO.md' in file_path or 'README.md' in file_path:
                    continue

                fm, body = extract_frontmatter(file_path)
                if fm:
                    tags = fm.get('tags', [])
                    if not isinstance(tags, list):
                        tags = [str(tags)]

                    has_portfolio = any('portfolio' in tag.lower() for tag in tags)

                    if has_portfolio and fm.get('status') == 'completed':
                        completed_artifacts.append((fm, body, file_path))

    # Group by competency
    groups = {}
    for fm, body, file_path in completed_artifacts:
        tags = fm.get('tags', [])
        if not isinstance(tags, list):
            tags = [str(tags)]
        tags = [t.lower() for t in tags]

        group_name = "General Documentation"
        if any(t in ['academic', 'learning', 'wgu-portfolio'] for t in tags):
            group_name = "Academic Competency"
        if any(t in ['automation', 'system-automation', 'orchestration'] for t in tags):
            group_name = "System Automation"
        if any(t in ['multi-agent', 'discovery', 'research'] for t in tags):
            group_name = "Automated Discovery"

        groups.setdefault(group_name, []).append((fm, body, file_path))

    dynamic_content = "## 📋 Automated Discovery & System Logs\n\n"
    if not groups:
        dynamic_content += "*No newly completed automated discovery logs available at this time.*\n\n"
    else:
        for group_name, artifacts in groups.items():
            dynamic_content += f"### {group_name}\n\n"
            for fm, body, file_path in artifacts:
                title = fm.get('title', 'Untitled Document')
                date = fm.get('date', 'Unknown Date')

                safe_body = redact_content(body)

                # Extract first meaningful paragraph
                lines = safe_body.split('\n')
                snippet = ""
                for line in lines:
                    line = line.strip()
                    if line and not line.startswith('#') and not line.startswith('-') and not line.startswith('>'):
                        snippet = line
                        break
                if len(snippet) > 200:
                    snippet = snippet[:197] + "..."

                dynamic_content += f"**{title}** ({date})\n"
                dynamic_content += f"> {snippet}\n\n"

    with open('PORTFOLIO.md', 'r', encoding='utf-8') as f:
        portfolio_content = f.read()

    if '## 📋 Automated Discovery & System Logs' in portfolio_content:
        portfolio_content = re.sub(
            r'## 📋 Automated Discovery & System Logs.*?(?=\n> \*This showcase is maintained)',
            dynamic_content,
            portfolio_content,
            flags=re.DOTALL
        )
    else:
        insertion_point = portfolio_content.find('> *This showcase is maintained')
        if insertion_point != -1:
            portfolio_content = portfolio_content[:insertion_point] + dynamic_content + '\n' + portfolio_content[insertion_point:]
        else:
            portfolio_content += '\n' + dynamic_content

    with open('PORTFOLIO.md', 'w', encoding='utf-8') as f:
        f.write(portfolio_content)

if __name__ == "__main__":
    build_portfolio()
