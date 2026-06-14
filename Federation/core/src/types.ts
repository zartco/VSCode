// Unified Data Model

export interface AgentNode {
    id: string;
    type: 'claude' | 'antigravity';
    status: 'idle' | 'working' | 'error';
    currentTask?: string;
}

export interface TaskNode {
    id: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    assignedTo?: string; // AgentNode id
}

export interface AgentEvent {
    id: string;
    timestamp: string;
    agentId: string;
    type: 'task_started' | 'task_completed' | 'error' | 'log';
    payload: any;
}
