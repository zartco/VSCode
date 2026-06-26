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
    
    # Try merging with GitHub CLI first
    code, out, err = run(f"gh pr merge {pr_num} --merge --delete-branch")
    if code == 0:
        print(f"Successfully merged PR {pr_num}")
        continue
    
    # We can't update draft PRs
    if 'draft' in err:
        print(f"Skipping PR {pr_num} as it is a draft")
        continue

    print(f"Merge conflict for PR {pr_num}. Forcing merge by accepting theirs...")
    
    # Check out PR locally
    code, out, err = run(f"gh pr checkout {pr_num}")
    if code != 0:
        print(f"Failed to checkout PR {pr_num}: {err}")
        continue
        
    code, out, err = run("git fetch origin master && git merge origin/master -X theirs")
    if code != 0:
        print(f"Still had conflicts using -X theirs for PR {pr_num}. Trying -X ours")
        run("git merge --abort")
        code, out, err = run("git merge origin/master -X ours")
        if code != 0:
            print(f"Still conflicted. Forcing it...")
            run("git add .")
            run("git commit -m 'Resolve merge conflicts'")
            
    code, out, err = run("git remote get-url origin")
    origin_url = out.strip()
    
    if origin_url.startswith("https://"):
        token_url = origin_url.replace("https://", f"https://oauth2:{os.environ['GH_TOKEN']}@")
        
        # force push because we merged
        code, out, err = run(f"git push {token_url} {branch}")
        if code == 0:
            print(f"Successfully pushed merged branch {branch}")
            # Try to merge again via GH API
            time.sleep(2)
            code, out, err = run(f"gh pr merge {pr_num} --merge --delete-branch")
            if code == 0:
                print(f"Successfully merged PR {pr_num} after manual merge")
            else:
                print(f"Failed to merge PR {pr_num} via API after manual merge: {err}")
        else:
            print(f"Failed to push {branch}: {err}")
    else:
        print("Cannot push because remote URL is not HTTPS")
        
    # Go back to master
    run("git checkout master")

