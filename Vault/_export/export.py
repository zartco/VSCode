#!/usr/bin/env python3
"""Export an Obsidian note to a polished WGU-themed PDF via pandoc + xelatex.

Usage:   python3 "_export/export.py" "Modules/M01 Algebraic Expressions.md"
Output:  Exports/<note>.pdf

Translates Obsidian-only syntax into clean Markdown/LaTeX:
  - callouts  > [!type] Title   -> a bold-headed blockquote
  - embeds    ![[image.png]]    -> ![](Attachments/image.png)  (embedded in the PDF)
  - wikilinks [[Note|Alias]]    -> **Alias**  (plain styled text in a standalone PDF)
  - strips the Obsidian-only "## Flashcards" section and stray emoji
  - maps a few unicode symbols to LaTeX so xelatex never chokes
"""
import sys, re, os, subprocess

VAULT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT   = os.path.join(VAULT, "Exports"); os.makedirs(OUT, exist_ok=True)

LABEL = {'goal':'Goal','example':'Example','warning':'Watch out',
         'question':'Solution','info':'Note','tip':'Tip'}
SAN = {'→':r'$\to$','⟶':r'$\to$','✓':r'$\checkmark$','×':r'$\times$',
       '≠':r'$\ne$','≤':r'$\le$','≥':r'$\ge$','±':r'$\pm$',
       '·':r'$\cdot$','–':'--','—':'---'}

HEADER = r"""\usepackage{xcolor}
\definecolor{wgunavy}{HTML}{0B1533}
\usepackage{sectsty}
\allsectionsfont{\color{wgunavy}\sffamily}
\usepackage{fancyhdr}
\pagestyle{fancy}\fancyhf{}
\fancyhead[L]{\textcolor{wgunavy}{\textbf{WGU Precalculus}}}
\fancyhead[R]{\textcolor{wgunavy}{\small Companion export}}
\fancyfoot[C]{\thepage}
\renewcommand{\headrulewidth}{0.8pt}
"""

def preprocess(md):
    md = re.sub(r'^---\n.*?\n---\n', '', md, flags=re.S)      # drop frontmatter
    md = re.sub(r'^#\s+.*\n', '', md, count=1)                # drop leading H1 (title set via metadata)
    md = re.sub(r'\n##\s+Flashcards.*?(?=\n##\s|\Z)', '\n', md, flags=re.S)  # drop SR flashcards
    md = re.sub(r'!\[\[([^\]]+?)\]\]', lambda m: '![](Attachments/%s)' % m.group(1), md)  # embeds
    md = re.sub(r'\[\[[^\]|]+\|([^\]]+)\]\]', r'**\1**', md)  # [[A|B]] -> B
    md = re.sub(r'\[\[([^\]]+)\]\]', r'**\1**', md)            # [[A]]   -> A
    out, lines, i = [], md.split('\n'), 0                      # callouts -> bold-headed blockquote
    while i < len(lines):
        m = re.match(r'^>\s*\[!(\w+)\]-?\s*(.*)$', lines[i])
        if m:
            typ, ttl = m.group(1).lower(), m.group(2).strip()
            disp = LABEL.get(typ, typ.capitalize()) + (' — ' + ttl if ttl else '')
            i += 1; body = []
            while i < len(lines) and lines[i].startswith('>'):
                body.append(re.sub(r'^>\s?', '', lines[i])); i += 1
            out.append('> **' + disp + '**'); out.append('>')
            out += ['> ' + b for b in body]; out.append('')
        else:
            out.append(lines[i]); i += 1
    md = '\n'.join(out)
    for k, v in SAN.items(): md = md.replace(k, v)            # unicode -> LaTeX-safe
    md = re.sub(r'[\U0001F000-\U0001FAFF☀-➿️]', '', md)  # strip emoji/dingbats
    return md

def export(rel):
    raw = open(os.path.join(VAULT, rel), encoding='utf-8').read()
    tm = re.search(r'^title:\s*(.+)$', raw, re.M)
    title = tm.group(1).strip() if tm else os.path.splitext(os.path.basename(rel))[0]
    open(os.path.join(OUT, '_tmp.md'), 'w', encoding='utf-8').write(preprocess(raw))
    open(os.path.join(OUT, '_wgu.tex'), 'w').write(HEADER)
    pdf = os.path.join(OUT, os.path.splitext(os.path.basename(rel))[0] + '.pdf')
    base = ['pandoc', os.path.join(OUT, '_tmp.md'), '-o', pdf, '--pdf-engine=xelatex',
            '-V', 'geometry:margin=1in', '-V', 'colorlinks=true', '-V', 'linkcolor=blue',
            '-V', 'urlcolor=blue', '-M', 'title=' + title,
            '-M', 'subtitle=WGU Precalculus · Companion', '--resource-path=' + VAULT]
    try:
        subprocess.run(base + ['-H', os.path.join(OUT, '_wgu.tex')],
                       check=True, cwd=VAULT, capture_output=True, text=True)
        print('PDF (themed) ->', pdf)
    except subprocess.CalledProcessError as e:
        print('themed pass failed; falling back to plain template\n', (e.stderr or '')[-700:])
        subprocess.run(base, check=True, cwd=VAULT, capture_output=True, text=True)
        print('PDF (plain) ->', pdf)

if __name__ == '__main__':
    export(sys.argv[1] if len(sys.argv) > 1 else 'Modules/M01 Algebraic Expressions.md')
