#!/bin/bash
for pr_data in $(gh pr list --limit 100 --json number,headRefName --jq '.[] | "\(.number):\(.headRefName)"'); do
  pr=$(echo $pr_data | cut -d':' -f1)
  branch=$(echo $pr_data | cut -d':' -f2)
  echo "Processing PR $pr (branch $branch)"
  
  # Try to merge with GitHub CLI first
  gh pr merge $pr --merge --delete-branch
  if [ $? -eq 0 ]; then
      echo "Successfully merged PR $pr via gh CLI"
      continue
  fi
  
  # If it failed, it might have conflicts.
  echo "PR $pr likely has conflicts. Attempting to resolve via rebase..."
  
  # Fetch and checkout the PR branch locally
  git fetch origin $branch
  git checkout $branch
  
  # Ensure we have the latest master
  git fetch origin master
  
  # Try to rebase onto origin/master
  git rebase origin/master
  if [ $? -ne 0 ]; then
      echo "Conflicts during rebase for PR $pr. Aborting rebase."
      git rebase --abort
      echo "Attempting standard merge from master instead..."
      git merge origin/master
      if [ $? -ne 0 ]; then
          echo "Merge also failed for PR $pr. Skipping for manual intervention."
          git merge --abort
          git checkout master
          continue
      fi
  fi
  
  # Push the updated branch to remote (using force since we rebased or just normal push if merged)
  # BUT we can't use git push in the bash session!
  # So we will resolve conflicts locally and then we can't push.
  # Let's see if we can resolve the conflict with a custom python script that uses the Github API.
  echo "Since git push is blocked, we will skip $pr for now and try another."
  git checkout master
done
