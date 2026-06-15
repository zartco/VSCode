import os
import glob
from pathlib import Path

def hydrate_payload(payload: dict, workspace_root: str = r"C:\VSCode") -> dict:
    """
    Dynamically reads the subagent delegation protocol and any GEMINI.md files
    and explicitly injects them into the payload before dispatch_subagent.
    """
    context_blocks = []
    
    # 1. Read the Delegation Protocol
    protocol_path = os.path.join(workspace_root, ".agent", "rules", "subagent-delegation-protocol.md")
    if os.path.exists(protocol_path):
        try:
            with open(protocol_path, "r", encoding="utf-8") as f:
                protocol_content = f.read()
                context_blocks.append(f"### Subagent Delegation Protocol ###\n{protocol_content}")
        except Exception as e:
            print(f"Failed to read protocol: {e}")
            
    # 2. Dynamically find and read all GEMINI.md files
    try:
        gemini_files = list(Path(workspace_root).rglob("GEMINI.md"))
        for g_file in gemini_files:
            try:
                with open(g_file, "r", encoding="utf-8") as f:
                    content = f.read()
                    rel_path = g_file.relative_to(workspace_root)
                    context_blocks.append(f"### Context from {rel_path} ###\n{content}")
            except Exception as e:
                print(f"Failed to read {g_file}: {e}")
    except Exception as e:
        print(f"Error searching for GEMINI.md files: {e}")
        
    # 3. Inject into payload
    if context_blocks:
        combined_context = "\n\n".join(context_blocks)
        
        payload["agent_hydration_context"] = combined_context
        
        # If there's an existing system prompt, we append it
        if "system_prompt" in payload:
            payload["system_prompt"] = payload["system_prompt"] + "\n\n" + combined_context
            
    return payload
