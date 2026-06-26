import os
import yaml
import re
import subprocess

PORTFOLIO_FILE = 'PORTFOLIO.md'

DEFAULT_PORTFOLIO = """# Zartco's Academic & Engineering Showcase

This portfolio documents a four-year computer science progression, dynamically aggregated from active workspace artifacts.

---

## 📚 Academic Competency

---

## ⚙️ System Automation

---

## 🤖 Multi-Agent Workflows

---

> *This showcase is maintained under perpetual AI stewardship.*
"""

# Read files
portfolio_items = []

for root, dirs, files in os.walk('.'):
    if 'node_modules' in root or '.git' in root:
        continue
    for file in files:
        if file.endswith('.md'):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()

                match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
                if match:
                    fm = yaml.safe_load(match.group(1))
                    if isinstance(fm, dict):
                        tags = fm.get('tags', [])
                        if isinstance(tags, list) and any('portfolio' in t.lower() for t in tags):
                            if fm.get('status') == 'completed':
                                # Do anonymization on the file and then add it
                                # the prompt specified "scrubbing local paths like C:\Users\Zartc\Vault and private email addresses"
                                anonymized_content = re.sub(r'C:\\Users\\Zartc\\[^\s\\]+', r'C:\\Users\\[REDACTED]\\', content)
                                anonymized_content = re.sub(r'C:\\Users\\Zartc', r'C:\\Users\\[REDACTED]', anonymized_content)
                                anonymized_content = re.sub(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', r'[REDACTED]@example.com', anonymized_content)

                                title = fm.get('title', os.path.basename(path).replace('.md', ''))
                                portfolio_items.append({
                                    'title': title,
                                    'path': path,
                                    'frontmatter': fm,
                                    'content': anonymized_content
                                })
            except Exception as e:
                pass

if not os.path.exists(PORTFOLIO_FILE):
    with open(PORTFOLIO_FILE, 'w', encoding='utf-8') as f:
        f.write(DEFAULT_PORTFOLIO)

with open(PORTFOLIO_FILE, 'r', encoding='utf-8') as f:
    portfolio_content = f.read()

def append_to_section(portfolio_text, item):
    tags = item['frontmatter'].get('tags', [])
    tags_str = ' '.join(tags).lower()

    if 'academic' in tags_str or 'wgu' in tags_str or 'learning' in tags_str:
        target_section = 'Academic Competency'
    elif 'automation' in tags_str:
        target_section = 'System Automation'
    elif 'agent' in tags_str or 'orchestration' in tags_str or 'discovery' in tags_str:
        target_section = 'Multi-Agent Workflows'
    else:
        target_section = 'System Automation'

    if target_section == 'Academic Competency':
        header = "## 📚 Academic Competency"
    elif target_section == 'System Automation':
        header = "## ⚙️ System Automation"
    else:
        header = "## 🤖 Multi-Agent Workflows"

    parts = portfolio_text.split(header)
    if len(parts) == 2:
        sub_parts = re.split(r'(\n---|\n## )', parts[1], maxsplit=1)

        clean_content = re.sub(r'^---\n.*?\n---\n', '', item['content'], flags=re.DOTALL).strip()

        # Avoid duplicating entries
        if item['title'] in parts[1]:
            return portfolio_text

        new_entry = f"\n\n### {item['title']}\n{clean_content}\n"

        if len(sub_parts) > 1:
            parts[1] = sub_parts[0] + new_entry + "".join(sub_parts[1:])
        else:
            parts[1] = sub_parts[0] + new_entry

        return parts[0] + header + parts[1]

    return portfolio_text

new_portfolio_content = portfolio_content

for item in portfolio_items:
    new_portfolio_content = append_to_section(new_portfolio_content, item)

with open(PORTFOLIO_FILE, 'w', encoding='utf-8') as f:
    f.write(new_portfolio_content)

print(f"Processed {len(portfolio_items)} completed portfolio items.")

# Commit changes if any
try:
    status_output = subprocess.check_output(['git', 'status', '--porcelain', PORTFOLIO_FILE]).decode('utf-8')
    if status_output:
        print("Changes detected in PORTFOLIO.md, committing...")
        subprocess.check_call(['git', 'add', PORTFOLIO_FILE])
        subprocess.check_call(['git', 'commit', '-m', 'docs(portfolio): dynamic update to academic showcase'])
        print("Committed successfully.")
    else:
        print("No changes to commit.")
except subprocess.CalledProcessError as e:
    print(f"Git operations failed: {e}")
