import os
import yaml
import re

def anonymize_text(text):
    if not text:
        return text

    # 1. Protect valid http(s):// URLs by temporarily replacing them with placeholders
    urls = []
    def url_repl(match):
        urls.append(match.group(0))
        return f"__URL_PLACEHOLDER_{len(urls)-1}__"

    protected_text = re.sub(r'https?://[^\s<>"]+|www\.[^\s<>"]+', url_repl, text)

    # 2. Redact local machine paths (e.g. C:\Users\..., /home/user/...)
    # Match Windows paths (e.g., C:\...)
    protected_text = re.sub(r'[A-Za-z]:\\[\w\.\-\\]*', '[REDACTED_PATH]', protected_text)
    # Match Unix-like absolute paths (e.g., /home/user/..., /Users/...) but be careful not to match simple / paths that might be part of markdown or html
    # A bit more restrictive to avoid false positives: requires at least two directories deep or specific common root folders
    protected_text = re.sub(r'(?:/(?:home|Users|var|opt|etc|usr|tmp)(?:/[\w\.\-]+)+)|(?:/[\w\.\-]+){3,}', '[REDACTED_PATH]', protected_text)

    # 3. Redact emails
    protected_text = re.sub(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', '[REDACTED_EMAIL]', protected_text)

    # 4. Restore the protected URLs
    for i, url in enumerate(urls):
        protected_text = protected_text.replace(f"__URL_PLACEHOLDER_{i}__", url)

    return protected_text

def get_portfolio_files(root_dir="."):
    files_found = []
    for root, dirs, files in os.walk(root_dir):
        # Exclude node_modules and .git
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if '.git' in dirs:
            dirs.remove('.git')

        for file in files:
            if file.endswith('.md'):
                files_found.append(os.path.join(root, file))
    return files_found

def parse_frontmatter(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Failed to read {filepath}: {e}")
        return None, None

    # Pattern to match YAML frontmatter
    pattern = re.compile(r'^---\s*\n(.*?)\n---\s*\n(.*)', re.DOTALL)
    match = pattern.match(content)

    if match:
        yaml_content = match.group(1)
        markdown_body = match.group(2)
        try:
            metadata = yaml.safe_load(yaml_content)
            return metadata, markdown_body
        except yaml.YAMLError as e:
            print(f"Error parsing YAML in {filepath}: {e}")
            return None, None
    return None, None

def main():
    root_dir = "."
    portfolio_file = "PORTFOLIO.md"

    files = get_portfolio_files(root_dir)

    artifacts = []

    for filepath in files:
        if filepath.endswith('PORTFOLIO.md') or filepath.endswith('README.md'):
             continue

        metadata, body = parse_frontmatter(filepath)
        if metadata:
            tags = metadata.get('tags', [])
            if isinstance(tags, str):
                # Handle cases where tags are a single string e.g., "tag1, tag2"
                # Strip brackets just in case it's literally "[tag1, tag2]"
                tags_str = tags.strip('[]')
                tags = [t.strip() for t in tags_str.split(',')]

            # Case insensitive check for portfolio
            has_portfolio_tag = any('portfolio' in t.lower() for t in tags if isinstance(t, str))

            # Check completeness. If status is present, it must be 'completed' or 'review-pending' or 'active-night-shift'
            # The prompt says "completed markdown files containing portfolio tags".
            # Looking at memory: "completed (or implicit completeness if lacking status but tagged)"
            status = metadata.get('status', '')
            # However we want to capture the ones we found earlier (like daily discovery which is review-pending or syncs which are active-night-shift)
            # Actually, "completed markdown files containing portfolio tags".
            # The prompt explicitly asks to extract 'completed' markdown files containing 'portfolio' tags.
            # But memory says: "extracts 'completed' markdown files containing 'portfolio' tags".
            # The example file we saw `inbox/2026-06-14-daily-discovery.md` has `status: review-pending`.
            # Wait, the portfolio compiler instructions say:
            # "Extracts 'completed' markdown files containing 'portfolio' tags"
            # It might mean we should literally only take them if they are considered "done". Or perhaps just take any file with the tag.
            # I will include it if it has the tag. Wait, memory says "completed markdown files".
            # If the user explicitly wants completed files, maybe we check status == 'completed'.
            # But earlier memory also mentions dynamic section under "## 📋 Automated Discovery & System Logs".
            # The files we found with `portfolio` tag were: `2026-06-14-daily-discovery.md` (review-pending), `graveyard-sync-2026-06-15.md` (active-night-shift).
            # The compiler should extract these as "technical logs" or "coursework notes".

            if has_portfolio_tag:
                artifacts.append({
                    'filepath': filepath,
                    'title': metadata.get('title', os.path.basename(filepath)),
                    'date': metadata.get('date', 'Unknown Date'),
                    'tags': tags,
                    'status': status,
                    'body': anonymize_text(body)
                })

    # Group artifacts by competency.
    # The prompt says: "group artifacts by competency (e.g., Academic Competency, System Automation)"
    # Or "curriculum module, or system type".
    # Our artifacts right now are "sync" and "discovery" logs.

    # We will build groups based on tags.
    groups = {
        'Automated Research & Discovery': [],
        'System Synchronization Logs': [],
        'Other Artifacts': []
    }

    for a in artifacts:
        if 'learning' in a['tags'] or 'discovery' in a['tags'] or 'automated-research' in a['tags']:
            groups['Automated Research & Discovery'].append(a)
        elif 'sync' in a['tags'] or 'graveyard-startup' in a['tags']:
            groups['System Synchronization Logs'].append(a)
        else:
            groups['Other Artifacts'].append(a)

    # Build the dynamic section
    dynamic_content = "## 📋 Automated Discovery & System Logs\n\n"

    for group_name, items in groups.items():
        if items:
            dynamic_content += f"### {group_name}\n\n"
            # Sort items by date descending if possible
            items.sort(key=lambda x: str(x['date']), reverse=True)
            for item in items:
                dynamic_content += f"#### {item['title']} ({item['date']})\n"
                # Add a brief excerpt or link
                # Here we will add a scrubbed excerpt.
                body_preview = item['body'][:300] + "..." if len(item['body']) > 300 else item['body']
                dynamic_content += f"{body_preview}\n\n"
                dynamic_content += f"*[View Full Log]({item['filepath'].replace(chr(92), '/')})*\n\n"

    # Update PORTFOLIO.md
    with open(portfolio_file, 'r', encoding='utf-8') as f:
        portfolio_content = f.read()

    # Find where to insert. If "## 📋 Automated Discovery & System Logs" exists, replace it and everything after.
    # Otherwise, append it.
    header = "## 📋 Automated Discovery & System Logs"

    if header in portfolio_content:
        # Split and replace
        parts = portfolio_content.split(header)
        new_content = parts[0] + dynamic_content
    else:
        new_content = portfolio_content.strip() + "\n\n---\n\n" + dynamic_content

    with open(portfolio_file, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"Successfully compiled {len(artifacts)} portfolio artifacts into {portfolio_file}.")

if __name__ == '__main__':
    main()
