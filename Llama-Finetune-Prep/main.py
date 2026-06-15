import os
import json
import yaml
import re
from datetime import datetime
from tqdm import tqdm
from config import OBSIDIAN_VAULT_PATH, OUTPUT_DATASET_PATH

def parse_markdown_file(file_path):
    """
    Parses an Obsidian markdown file to extract frontmatter and content.
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    metadata = {}
    body = content.strip()

    # Very basic frontmatter parsing
    if content.startswith('---'):
        parts = content.split('---', 2)
        if len(parts) >= 3:
            frontmatter_str = parts[1]
            body = parts[2].strip()
            try:
                metadata = yaml.safe_load(frontmatter_str) or {}
            except yaml.YAMLError as e:
                print(f"Error parsing YAML in {file_path}: {e}")
                metadata = {}

    wikilinks = re.findall(r'\[\[(.*?)\]\]', body)
    return metadata, body, wikilinks

def create_dataset():
    """
    Scans the Obsidian vault for markdown files and creates a JSONL dataset.
    Uses Alpaca format (instruction, input, output).
    """
    if not os.path.exists(OBSIDIAN_VAULT_PATH):
        print(f"Error: Vault path does not exist: {OBSIDIAN_VAULT_PATH}")
        return
    
    dataset = []
    md_files = []
    
    # Do not process the log file itself
    log_filename = "Llama Pipeline Progress.md"
    
    for root, _, files in os.walk(OBSIDIAN_VAULT_PATH):
        for file in files:
            if file.endswith('.md') and file != log_filename:
                md_files.append(os.path.join(root, file))

    if not md_files:
        print("No markdown files found to process.")

    # Process files
    for file_path in tqdm(md_files, desc="Processing Markdown Files"):
        metadata, body, wikilinks = parse_markdown_file(file_path)
        
        # Using filename as a basic concept for the instruction
        filename = os.path.basename(file_path).replace('.md', '')
        
        links_str = ", ".join([f"[[{link}]]" for link in wikilinks])
        input_text = f"Related concepts: {links_str}" if links_str else ""
        
        # Alpaca format
        item = {
            "instruction": f"Explain the concept of {filename}.",
            "input": input_text,
            "output": body
        }
        dataset.append(item)
        
    # Write to JSONL
    os.makedirs(os.path.dirname(OUTPUT_DATASET_PATH), exist_ok=True)
    with open(OUTPUT_DATASET_PATH, 'w', encoding='utf-8') as f:
        for item in dataset:
            f.write(json.dumps(item, ensure_ascii=False) + '\n')
            
    print(f"Dataset generated at {OUTPUT_DATASET_PATH} with {len(dataset)} items.")
    
    # Write progress log to vault
    log_path = os.path.join(OBSIDIAN_VAULT_PATH, log_filename)
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = (
        f"## Pipeline Run: {timestamp}\n"
        f"- **Files Processed:** {len(dataset)}\n"
        f"- **Output Dataset:** `{OUTPUT_DATASET_PATH}`\n\n"
    )
    
    mode = 'a' if os.path.exists(log_path) else 'w'
    with open(log_path, mode, encoding='utf-8') as f:
        if mode == 'w':
            f.write("# Llama Pipeline Progress Log\n\n")
        f.write(log_entry)
    
    print(f"Progress log updated at {log_path}")

if __name__ == "__main__":
    create_dataset()
