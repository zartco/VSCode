import os
from state_hydration import hydrate_payload

def test_hydration():
    print("Testing payload hydration...")
    test_payload = {
        "subagent_id": "test_agent_1",
        "system_prompt": "You are a subagent."
    }
    
    hydrated = hydrate_payload(test_payload, workspace_root=r"C:\VSCode")
    
    assert "agent_hydration_context" in hydrated, "Hydration context missing from payload"
    assert "Subagent Delegation Protocol" in hydrated["agent_hydration_context"], "Protocol missing from context"
    
    # We found GEMINI.md in Vault-Web earlier
    assert "GEMINI.md" in hydrated["agent_hydration_context"] or "Vault-Web" in hydrated["agent_hydration_context"], "GEMINI.md context missing"
    
    print("Hydration test passed! Payload has been successfully populated with state context.")
    print("Agent context length:", len(hydrated["agent_hydration_context"]))

if __name__ == "__main__":
    test_hydration()
