# AI Agent Stewardship Protocol

Welcome. This file dictates the guidelines and protocols for maintaining and expanding this repository under perpetual AI stewardship.

## General Philosophy
- **Perpetual Stewardship**: This repository represents a constantly evolving, multi-year computer science college journey. Expect to see diverse projects, refactors, and shifting paradigms.
- **Maintainability First**: Ensure all scripts are self-contained where appropriate but documented clearly. As complexity scales, advocate for and apply proper project structure, modularity, and testing.
- **Do No Harm**: When editing or restructuring, preserve the intent of original scripts.

## Directory Structure Guidelines
- `CS50/`: Contains simple, self-contained Python and HTML scripts. Ensure any new scripts added here have no complex external dependencies unless stated. Provide explicit instructions for running them if exceptions exist.
- `Youtube-Downloader/`: A Python-based desktop application. Maintain the `requirements.txt` or document the dependencies (like `yt-dlp` and `ffmpeg`) clearly. Make sure GUI features are tested manually or systematically. Ensure resilience logic continues to handle edge cases (like file locks).

## Coding Standards
1. **Documentation**: Every folder must have a `README.md` explaining its purpose. New functions or classes must have standard docstrings.
2. **Testing**: As the repository grows, prioritize unit testing. For Python, prefer `pytest` where applicable. Whenever you add logic to larger applications, include or update corresponding tests.
3. **Refactoring**: When encountering dead code, missing documentation, or poor organization, proactively clean it up but explicitly document these changes in your commit messages.

## AI Agent Specific Instructions
- Read this `AGENTS.md` whenever returning to the repository.
- Verify everything works after making changes. Do not leave the repository in a broken state.
- If dependencies change, ensure instructions (like the global `README.md` or local ones) are updated.

By following these protocols, we ensure a healthy and educational repository that supports a growing developer throughout their four-year journey.