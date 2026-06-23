import os
import yaml
import re

def sanitize_content(text):
    # Temporarily replace URLs to avoid corruption
    urls = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', text)
    placeholder_map = {f"__URL_{i}__": url for i, url in enumerate(urls)}
    for placeholder, url in placeholder_map.items():
        text = text.replace(url, placeholder)

    # Redact local paths and emails
    text = re.sub(r'[A-Z]:\\[^\s<>"]+', '[REDACTED_PATH]', text, flags=re.IGNORECASE)
    text = re.sub(r'/[^\s<>"]+/[^\s<>"]+', '[REDACTED_PATH]', text) # simple unix path match
    text = re.sub(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', '[REDACTED_EMAIL]', text)

    # Restore URLs
    for placeholder, url in placeholder_map.items():
        text = text.replace(placeholder, url)

    return text

def parse_frontmatter(content):
    match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if match:
        try:
            return yaml.safe_load(match.group(1)), content[match.end():]
        except yaml.YAMLError:
            pass
    return None, content

def get_portfolio_artifacts():
    artifacts = []
    for root, _, files in os.walk('.'):
        if 'node_modules' in root or '.subagents' in root:
            continue
        for file in files:
            if file.endswith('.md'):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    frontmatter, body = parse_frontmatter(content)
                    if frontmatter and isinstance(frontmatter, dict):
                        tags = frontmatter.get('tags', [])
                        if isinstance(tags, str):
                            tags = [t.strip() for t in tags.split(',')]

                        status = frontmatter.get('status', '')

                        if any('portfolio' in t.lower() for t in tags) and status == 'completed':
                            artifacts.append({
                                'path': path,
                                'frontmatter': frontmatter,
                                'body': body,
                                'tags': tags
                            })
                except Exception as e:
                    print(f"Error parsing {path}: {e}")
    return artifacts

def build_portfolio():
    artifacts = get_portfolio_artifacts()
    grouped_artifacts = {}

    for artifact in artifacts:
        tags = artifact['tags']
        group_name = "Uncategorized"
        if tags:
            # Group artifacts dynamically based on the first tag, replacing hyphens and title-casing
            group_name = tags[0].replace('-', ' ').title()

        if group_name not in grouped_artifacts:
            grouped_artifacts[group_name] = []

        grouped_artifacts[group_name].append(artifact)

    new_section = "\n## 📋 Automated Discovery & System Logs\n"
    for group, items in grouped_artifacts.items():
        new_section += f"\n### {group}\n"
        for item in items:
            title = item['frontmatter'].get('title', 'Untitled')
            date = item['frontmatter'].get('date', '')
            body_preview = sanitize_content(item['body'].strip()[:200] + "...")
            new_section += f"- **{title}** ({date})\n  - {body_preview}\n"

    try:
        with open('PORTFOLIO.md', 'r', encoding='utf-8') as f:
            portfolio_content = f.read()

        if "## 📋 Automated Discovery & System Logs" in portfolio_content:
            portfolio_content = portfolio_content.split("## 📋 Automated Discovery & System Logs")[0]

        with open('PORTFOLIO.md', 'w', encoding='utf-8') as f:
            f.write(portfolio_content.strip() + "\n" + new_section)
    except Exception as e:
        print(f"Error updating PORTFOLIO.md: {e}")

if __name__ == '__main__':
    build_portfolio()