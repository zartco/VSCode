import os
import re
import yaml
from pathlib import Path

def redact_content(text):
    # Temporarily preserve URLs
    urls = []
    def replace_url(match):
        urls.append(match.group(0))
        return f"__URL_PLACEHOLDER_{len(urls)-1}__"
    text = re.sub(r'https?://[^\s<>"]+|www\.[^\s<>"]+', replace_url, text)

    # Redact local paths
    text = re.sub(r'(?:[a-zA-Z]:\\|/)[^\s<>"]+', '[REDACTED_PATH]', text)

    # Redact emails
    text = re.sub(r'[\w\.-]+@[\w\.-]+\.\w+', '[REDACTED_EMAIL]', text)

    # Restore URLs
    for i, url in enumerate(urls):
        text = text.replace(f"__URL_PLACEHOLDER_{i}__", url)

    return text

def parse_frontmatter(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    match = re.match(r'^---\n(.*?)\n---\n(.*)', content, re.DOTALL)
    if not match:
        return None, None

    try:
        frontmatter = yaml.safe_load(match.group(1))
        return frontmatter, match.group(2)
    except yaml.YAMLError:
        return None, None

def collect_artifacts():
    artifacts = {}
    for root, _, files in os.walk('.'):
        if 'node_modules' in root or '.git' in root:
            continue
        for file in files:
            if file.endswith('.md'):
                file_path = os.path.join(root, file)
                frontmatter, _ = parse_frontmatter(file_path)

                if frontmatter and isinstance(frontmatter, dict):
                    status = str(frontmatter.get('status', '')).lower()
                    tags = frontmatter.get('tags', [])

                    if isinstance(tags, str):
                        tags = [t.strip() for t in tags.split(',')]
                    elif not isinstance(tags, list):
                        tags = []

                    is_portfolio = any('portfolio' in str(t).lower() for t in tags)

                    if is_portfolio and ('completed' in status or 'done' in status):
                        competency = frontmatter.get('competency') or frontmatter.get('module') or 'Uncategorized'
                        title = frontmatter.get('title', file)

                        if competency not in artifacts:
                            artifacts[competency] = []

                        artifacts[competency].append({
                            'title': title,
                            'path': file_path,
                            'frontmatter': frontmatter
                        })
    return artifacts

def generate_portfolio_markdown(artifacts):
    md = "## 📋 Automated Discovery & System Logs\n\n"
    for competency, items in artifacts.items():
        md += f"### {competency}\n"
        for item in items:
            md += f"- **{item['title']}** (Source: `[REDACTED_PATH]`)\n"
    return redact_content(md)

def update_portfolio():
    artifacts = collect_artifacts()
    new_section = generate_portfolio_markdown(artifacts)

    portfolio_path = 'PORTFOLIO.md'
    with open(portfolio_path, 'r', encoding='utf-8') as f:
        content = f.read()

    header = "## 📋 Automated Discovery & System Logs"
    if header in content:
        content = re.sub(rf"{header}.*", new_section, content, flags=re.DOTALL)
    else:
        content += f"\n\n{new_section}"

    with open(portfolio_path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    update_portfolio()
