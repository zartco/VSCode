# Llama Fine-Tune Prep

This project converts Obsidian vault notes into a JSONL dataset shaped like Alpaca instruction records. It is a preparation step for learning how personal notes might become supervised fine-tuning examples.

## Learning Context

- **Course / concept:** Data preparation for machine learning, file parsing, and structured dataset generation.
- **What it demonstrates:** Walking a directory tree, parsing Markdown frontmatter, extracting wiki links, writing JSONL records, and logging a pipeline run.
- **Portfolio role:** An early ML data-engineering exercise connected to the local learning vault.

## Pipeline

1. `config.py` points to the local Obsidian vault and output dataset path.
2. `main.py` scans Markdown files under the vault.
3. Each note becomes one JSONL record:
   - `instruction`: `Explain the concept of <filename>.`
   - `input`: related wiki links, if any.
   - `output`: the Markdown body after frontmatter is removed.
4. The script appends a short run summary to `Llama Pipeline Progress.md` in the vault.

## Run It

```bash
python -m pip install -r requirements.txt
python main.py
```

Before running, verify that the paths in `config.py` match the local machine:

```python
OBSIDIAN_VAULT_PATH = "C:/Users/Zartc/Vault"
OUTPUT_DATASET_PATH = "C:/VSCode/Llama-Finetune-Prep/train.jsonl"
```

## Known Limitations

- The frontmatter parser is intentionally basic; unusual Markdown fences may need a stronger parser later.
- The generated records are raw study-note examples, not curated training data.
- The current output may include private vault content, so review `train.jsonl` before sharing or publishing it.
