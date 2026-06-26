import subprocess
import json
import sys
import os
import time

def run(cmd):
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return result.returncode, result.stdout, result.stderr

code, stdout, stderr = run("gh pr list --limit 100 --json number,headRefName,mergeStateStatus,mergeable")
if code != 0:
    print(f"Failed to list PRs: {stderr}")
    sys.exit(1)

prs = json.loads(stdout)

for pr in prs:
    pr_num = pr['number']
    branch = pr['headRefName']
    print(f"Processing PR {pr_num} ({branch})...")
    
    # Check if we can merge it directly
    code, out, err = run(f"gh pr merge {pr_num} --merge --delete-branch")
    if code == 0:
        print(f"Successfully merged PR {pr_num}")
        continue

    # We can't update draft PRs
    if 'draft' in err:
        print(f"Skipping PR {pr_num} as it is a draft")
        continue

    print(f"Merge conflict for PR {pr_num}. Recreating the branch using patch...")
    
    # First checkout master and pull the latest
    run("git checkout master")
    
    # Let's try `git rebase` instead of `git merge`
    # Check out PR locally
    code, out, err = run(f"gh pr checkout {pr_num}")
    if code != 0:
        print(f"Failed to checkout PR {pr_num}: {err}")
        continue
        
    code, out, err = run("git fetch origin master && git rebase origin/master")
    if code != 0:
        # Resolve by taking their changes (-X theirs is original branch for rebase? No, for rebase --onto master, 'ours' is master, 'theirs' is the branch being rebased. So to keep branch changes, use -X theirs)
        print("Rebase conflicted. Trying to rebase with -X theirs...")
        run("git rebase --abort")
        code, out, err = run("git rebase origin/master -X theirs")
        if code != 0:
            print("Still conflicted. Forcing it...")
            run("git add .")
            run("GIT_EDITOR=true git rebase --continue")
            
    code, out, err = run("git remote get-url origin")
    origin_url = out.strip()
    
    if origin_url.startswith("https://"):
        token_url = origin_url.replace("https://", f"https://oauth2:{os.environ['GH_TOKEN']}@")
        
        # force push because we rebased
        code, out, err = run(f"git push --force {token_url} {branch}")
        if code == 0:
            print(f"Successfully force pushed rebased branch {branch}")
            # Try to merge again via GH API
            time.sleep(2)
            code, out, err = run(f"gh pr merge {pr_num} --merge --delete-branch")
            if code == 0:
                print(f"Successfully merged PR {pr_num} after manual rebase")
            else:
                print(f"Failed to merge PR {pr_num} via API after manual rebase: {err}")
        else:
            print(f"Failed to push {branch}: {err}")
    else:
        print("Cannot push because remote URL is not HTTPS")
        
    # Go back to master
    run("git checkout master")

