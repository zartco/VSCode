#!/bin/bash
for pr in $(gh pr list --limit 100 | awk '{print $1}'); do
  gh pr merge $pr --merge --delete-branch
done
