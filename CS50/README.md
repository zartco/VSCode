# CS50 Learning Scripts

Self-contained Python and HTML exercises for practicing fundamentals. Each file covers one concept and runs independently with no dependencies beyond the Python standard library.

## Running

```powershell
python CS50\<script>.py
```

Open HTML files directly in a browser — no server required.

## Python scripts

| Script | Concepts | Pattern |
|---|---|---|
| `helloworld.py` | `input()`, f-strings, `.strip()`, `.title()` | Top-level statements |
| `hello.py` | Functions, default parameters | `main()` + `hello(to="world")` |
| `cat.py` | `print()` repetition, `end=` | One-liner loop via string multiplication |
| `calculator.py` | Functions, return values | `main()` calls `square(n)` |
| `calculator1.py` | `float()` casting, arithmetic | Top-level `input()` → print |
| `compare.py` | `if` / `elif` chains | Two `int` inputs, relational comparison |
| `grade.py` | Range checks with `and` | Score → letter grade |
| `parity.py` | Boolean functions, modulo | `is_even(n)` helper called from `main()` |
| `house.py` | `match` / `case` statements | String matching (Python 3.10+) |

### Typical script shape

Scripts that use functions follow this pattern:

```python
def main():
    x = int(input("What's x? "))
    print("result:", some_function(x))

def some_function(n):
    return n * 2

main()
```

Simpler exercises omit `main()` and run statements at the top level.

## HTML exercises

| File | Purpose |
|---|---|
| `html_skeleton.html` | Annotated page structure — headings, paragraphs, lists, links |
| `index.html` | Blank starter page (fill in during exercises) |

## Constraints

- **Python 3.10+** required for `house.py` (`match`/`case`); all other scripts work on 3.8+.
- No virtual environment, `pip` packages, or build step — run scripts directly.
- Scripts are interactive: they block on `input()` and print to stdout.
