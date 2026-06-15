/*
 * ══════════════════════════════════════════════════════════════════════════════
 *    ___  _  _ _____ ___ ___ ___  _  ___   _____ _____ _  _ 
 *   / _ \| \| |_   _|_ _| __| _ \/_\ \ \ / /_ _|_   _\ \ / / 
 *  | (_) | .` | | |  | || _||   / _ \ \ V / | |  | |  \ V /  
 *   \___/|_|\_| |_| |___|___|_|_\_/ \_\ \_/ |___| |_|   |_|   
 *
 *   QUANTUM GRAVITY WELL - TERMINAL CHAT INTERFACE
 * ══════════════════════════════════════════════════════════════════════════════
 */

import { createInterface } from 'readline';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ═══════════════════════════════════════════════════════════════
//  ANSI Color Constants - Matrix Neon Theme
// ═══════════════════════════════════════════════════════════════
const C = {
  reset:    '\x1b[0m',
  bold:     '\x1b[1m',
  dim:      '\x1b[2m',
  italic:   '\x1b[3m',
  green:    '\x1b[38;2;0;255;0m',
  darkGreen:'\x1b[38;2;0;140;0m',
  dimGreen: '\x1b[38;2;0;80;0m',
  black:    '\x1b[38;2;0;0;0m',
  bgBlack:  '\x1b[48;2;0;0;0m',
  bgGreen:  '\x1b[48;2;0;255;0m',
  bgDkGreen:'\x1b[48;2;0;40;0m',
  yellow:   '\x1b[38;2;255;255;0m',
  red:      '\x1b[38;2;255;60;60m',
  cyan:     '\x1b[38;2;0;255;180m',
  white:    '\x1b[38;2;200;255;200m',
};

const AGENTAPI = 'C:\\Users\\Zartc\\.gemini\\antigravity-ide\\bin\\agentapi.bat';

// ═══════════════════════════════════════════════════════════════
//  State
// ═══════════════════════════════════════════════════════════════
let conversationId = null;
let model = 'pro';
let messageHistory = [];

// ═══════════════════════════════════════════════════════════════
//  Drawing Utilities
// ═══════════════════════════════════════════════════════════════
const cols = () => process.stdout.columns || 80;
const rows = () => process.stdout.rows || 24;

function clear() {
  process.stdout.write('\x1b[2J\x1b[H');
}

function line(ch = '─', color = C.dimGreen) {
  return `${color}${ch.repeat(cols() - 1)}${C.reset}`;
}

function center(text, width) {
  const stripped = text.replace(/\x1b\[[0-9;]*m/g, '');
  const pad = Math.max(0, Math.floor((width - stripped.length) / 2));
  return ' '.repeat(pad) + text;
}

function wordWrap(text, maxWidth) {
  const lines = [];
  for (const rawLine of text.split('\n')) {
    if (rawLine.length <= maxWidth) {
      lines.push(rawLine);
      continue;
    }
    let current = '';
    for (const word of rawLine.split(' ')) {
      if (current.length + word.length + 1 > maxWidth) {
        lines.push(current);
        current = word;
      } else {
        current = current ? current + ' ' + word : word;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

// ═══════════════════════════════════════════════════════════════
//  Banner
// ═══════════════════════════════════════════════════════════════
function drawBanner() {
  const w = cols();
  const banner = [
    `   ___   _  _ _____ ___ ___ ___  _  ___   _____ _____ _  _ `,
    `  /_\\ | \\| |_   _|_ _/ __| _ \\/_\\ \\ \\ / /_ _|_   _\\ \\ / / `,
    ` / _ \\| .\` | | |  | | (_ |   / _ \\ \\ V / | |  | |  \\ V /  `,
    `/_/ \\_\\_|\\_| |_| |___\\___|_|_/_/ \\_\\ \\_/ |___| |_|   |_|   `,
    `      ⟁  Q U A N T U M   G R A V I T Y   W E L L  ⟁`
  ];

  console.log();
  for (let i = 0; i < banner.length; i++) {
    const color = i === banner.length - 1 ? C.cyan : C.green;
    console.log(center(`${C.bold}${color}${banner[i]}${C.reset}`, w));
  }
  console.log();
  console.log(center(`${C.dimGreen}── ${C.darkGreen}A N T I G R A V I T Y   S E S S I O N   I N T E R F A C E${C.dimGreen} ──${C.reset}`, w));
  console.log();
  console.log(line('═', C.dimGreen));
}

// ═══════════════════════════════════════════════════════════════
//  Status Bar
// ═══════════════════════════════════════════════════════════════
function statusBar() {
  const w = cols();
  const convLabel = conversationId
    ? `SESSION: ● ACTIVE (${conversationId.slice(0, 8)})`
    : `SESSION: ○ INACTIVE`;
  const modelLabel = `MODEL: ${model.toUpperCase()}`;
  const time = new Date().toLocaleTimeString('en-US', { hour12: false });
  const timeLabel = `SYS_TIME: ${time}`;

  // Let's create a beautiful box status HUD
  const content = ` ║ ${C.green}${convLabel}${C.reset} ║ ${C.cyan}${modelLabel}${C.reset} ║ ${C.yellow}${timeLabel}${C.reset} ║`;
  const rawLength = ` ║ ${convLabel} ║ ${modelLabel} ║ ${timeLabel} ║`.length;
  const fill = '═'.repeat(Math.max(0, w - rawLength));

  console.log(`${C.dimGreen}╔${'═'.repeat(rawLength - 2)}${fill}╗${C.reset}`);
  console.log(`${C.dimGreen}║${C.reset}${content}${' '.repeat(Math.max(0, w - rawLength - 2))}${C.dimGreen}║${C.reset}`);
  console.log(`${C.dimGreen}╚${'═'.repeat(rawLength - 2)}${fill}╝${C.reset}`);
}

// ═══════════════════════════════════════════════════════════════
//  Agent API Calls
// ═══════════════════════════════════════════════════════════════
import { exec } from 'child_process';
import util from 'util';
const execAsync = util.promisify(exec);

async function callAgent(command) {
  try {
    const env = { ...process.env };
    if (!env.ANTIGRAVITY_LS_ADDRESS || !env.ANTIGRAVITY_CSRF_TOKEN) {
      try {
        const envPath = path.join(__dirname, '.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split(/\r?\n/).forEach(line => {
          const match = line.match(/^([^=]+)=(.*)$/);
          if (match) env[match[1].trim()] = match[2].trim();
        });
      } catch (e) {}
    }
    if (!env.ANTIGRAVITY_LS_ADDRESS) {
      return { error: 'ANTIGRAVITY_LS_ADDRESS is missing.\nPlease run this CLI inside the IDE integrated terminal (or restart the terminal).' };
    }
    const { stdout, stderr } = await execAsync(`cmd /c ""${AGENTAPI}" ${command}"`, {
      encoding: 'utf8',
      cwd: 'C:\\VSCode',
      env: env
    });
    return JSON.parse(stdout);
  } catch (err) {
    if (err.stdout) {
      const out = err.stdout.toString();
      if (out.includes('ANTIGRAVITY_LS_ADDRESS is not set')) {
        return { error: 'ANTIGRAVITY_LS_ADDRESS is missing.\nPlease run this CLI inside the IDE integrated terminal (or restart the terminal).' };
      }
      try { return JSON.parse(out); } catch {}
    }
    return { error: err.message };
  }
}

async function newConversation(prompt) {
  const escaped = prompt.replace(/"/g, '\\"');
  const result = await callAgent(`new-conversation --model=${model} "${escaped}"`);
  if (result.response?.newConversation?.conversationId) {
    conversationId = result.response.newConversation.conversationId;
  } else if (result.response?.conversation_id) {
    conversationId = result.response.conversation_id;
  }
  return result;
}

async function sendMessage(content) {
  if (!conversationId) {
    return await newConversation(content);
  }
  const escaped = content.replace(/"/g, '\\"');
  return await callAgent(`send-message ${conversationId} "${escaped}"`);
}

async function getMetadata() {
  if (!conversationId) return { error: 'No active conversation' };
  return await callAgent(`get-conversation-metadata ${conversationId}`);
}

// ═══════════════════════════════════════════════════════════════
//  Message Display
// ═══════════════════════════════════════════════════════════════
function displayUserMessage(text) {
  const w = cols();
  const maxBubble = Math.min(w - 8, 70);
  const wrapped = wordWrap(text, maxBubble);
  const innerWidth = maxBubble + 4;

  console.log();
  const header = ` USER `;
  const borderRight = '═'.repeat(Math.max(0, innerWidth - header.length - 2));
  console.log(`  ${C.cyan}╔═${header}${borderRight}╗${C.reset}`);
  for (const l of wrapped) {
    const pad = Math.max(0, maxBubble - l.length);
    console.log(`  ${C.cyan}║${C.reset}  ${C.white}${l}${' '.repeat(pad)}  ${C.cyan}║${C.reset}`);
  }
  console.log(`  ${C.cyan}╚${'═'.repeat(innerWidth)}╝${C.reset}`);
}

function displayAgentMessage(text) {
  const w = cols();
  const maxBubble = Math.min(w - 8, 70);
  const wrapped = wordWrap(text, maxBubble);
  const innerWidth = maxBubble + 4;

  console.log();
  const header = ` ANTIGRAVITY `;
  const borderRight = '═'.repeat(Math.max(0, innerWidth - header.length - 2));
  console.log(`  ${C.green}╔═${header}${borderRight}╗${C.reset}`);
  for (const l of wrapped) {
    const pad = Math.max(0, maxBubble - l.length);
    console.log(`  ${C.green}║${C.reset}  ${C.green}${C.bold}${l}${' '.repeat(pad)}${C.reset}  ${C.green}║${C.reset}`);
  }
  console.log(`  ${C.green}╚${'═'.repeat(innerWidth)}╝${C.reset}`);
}

// ═══════════════════════════════════════════════════════════════
//  Outputs
// ═══════════════════════════════════════════════════════════════
function displaySystem(text) {
  console.log(`  ${C.dimGreen}${C.italic}⟫ ${text}${C.reset}`);
}

function displayError(text) {
  console.log(`  ${C.red}✖ ERROR: ${text}${C.reset}`);
}

function displayToolCalls(calls) {
  if (!calls || calls.length === 0) return;
  const w = cols();
  const maxW = Math.min(w - 8, 70);
  
  for (const call of calls) {
    const fn = call.function || {};
    const name = fn.name;
    let args = {};
    try { args = fn.arguments ? JSON.parse(fn.arguments) : {}; } catch(e) {}
    
    if (name === 'write_to_file' || name === 'replace_file_content' || name === 'multi_replace_file_content') {
      const file = args.TargetFile ? path.basename(args.TargetFile) : 'Unknown';
      const meta = args.ArtifactMetadata;
      const isArtifact = !!meta;
      const title = isArtifact ? `ARTIFACT ─ ${file}` : `FILE CHANGED ─ ${file}`;
      
      console.log();
      console.log(`  ${C.yellow}┌─ ${title} ${'─'.repeat(Math.max(0, maxW - 6 - title.length))}┐${C.reset}`);
      if (meta?.Summary) {
        const lines = wordWrap(`Summary: ${meta.Summary}`, maxW - 4);
        lines.forEach(l => console.log(`  ${C.yellow}│${C.reset}  ${C.white}${l}${' '.repeat(Math.max(0, maxW - 4 - l.length))}  ${C.yellow}│${C.reset}`));
      } else if (!isArtifact && args.Description) {
        const lines = wordWrap(`Changes: ${args.Description}`, maxW - 4);
        lines.forEach(l => console.log(`  ${C.yellow}│${C.reset}  ${C.dim}${l}${' '.repeat(Math.max(0, maxW - 4 - l.length))}  ${C.yellow}│${C.reset}`));
      }
      
      if (meta?.RequestFeedback) {
        console.log(`  ${C.yellow}│${C.reset}  ${C.red}${C.bold}REVIEW REQUIRED - Type /proceed to approve${C.reset}${' '.repeat(Math.max(0, maxW - 46))}  ${C.yellow}│${C.reset}`);
      } else {
        const status = isArtifact ? 'Status: Updated' : (name === 'write_to_file' ? 'Status: Created' : 'Status: Modified');
        console.log(`  ${C.yellow}│${C.reset}  ${C.cyan}${status}${C.reset}${' '.repeat(Math.max(0, maxW - 4 - status.length))}  ${C.yellow}│${C.reset}`);
      }
      console.log(`  ${C.yellow}└${'─'.repeat(maxW)}┘${C.reset}`);
    } else if (name === 'invoke_subagent') {
      const subs = args.Subagents || [];
      subs.forEach(s => {
        const role = s.Role || 'Agent';
        console.log();
        console.log(`  ${C.cyan}┌─ SUBAGENT SPAWNED ─ ${role} ${'─'.repeat(Math.max(0, maxW - 23 - role.length))}┐${C.reset}`);
        const promptLines = wordWrap(`Task: ${s.Prompt}`, maxW - 4);
        promptLines.forEach(l => console.log(`  ${C.cyan}│${C.reset}  ${C.dim}${l}${' '.repeat(Math.max(0, maxW - 4 - l.length))}  ${C.cyan}│${C.reset}`));
        console.log(`  ${C.cyan}└${'─'.repeat(maxW)}┘${C.reset}`);
      });
    } else if (name === 'run_command') {
      const cmd = args.CommandLine || 'Unknown Command';
      const truncCmd = cmd.length > maxW - 10 ? cmd.substring(0, maxW - 13) + '...' : cmd;
      console.log();
      console.log(`  ${C.dimGreen}┌─ EXECUTING COMMAND ${'─'.repeat(Math.max(0, maxW - 21))}┐${C.reset}`);
      console.log(`  ${C.dimGreen}│${C.reset}  ${C.white}> ${truncCmd}${' '.repeat(Math.max(0, maxW - 6 - truncCmd.length))}  ${C.dimGreen}│${C.reset}`);
      console.log(`  ${C.dimGreen}└${'─'.repeat(maxW)}┘${C.reset}`);
    } else if (name === 'view_file' || name === 'grep_search' || name === 'list_dir') {
      let target = args.AbsolutePath || args.SearchPath || args.DirectoryPath || 'Filesystem';
      if (name === 'grep_search') target = `"${args.Query}" in ${path.basename(target)}`;
      else target = path.basename(target);
      const truncTarget = target.length > maxW - 18 ? target.substring(0, maxW - 21) + '...' : target;
      console.log();
      console.log(`  ${C.dimGreen}┌─ INVESTIGATING ${'─'.repeat(Math.max(0, maxW - 17))}┐${C.reset}`);
      console.log(`  ${C.dimGreen}│${C.reset}  ${C.dim}Reading: ${truncTarget}${' '.repeat(Math.max(0, maxW - 13 - truncTarget.length))}  ${C.dimGreen}│${C.reset}`);
      console.log(`  ${C.dimGreen}└${'─'.repeat(maxW)}┘${C.reset}`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════
//  Spinner
// ═══════════════════════════════════════════════════════════════
function startSpinner(label = 'Processing') {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  return setInterval(() => {
    process.stdout.write(`\r  ${C.green}${frames[i++ % frames.length]} ${label}...${C.reset}  `);
  }, 80);
}

function stopSpinner(timer) {
  clearInterval(timer);
  process.stdout.write('\r' + ' '.repeat(cols()) + '\r');
}

// ═══════════════════════════════════════════════════════════════
//  Command Handler
// ═══════════════════════════════════════════════════════════════
function handleCommand(input) {
  const [cmd, ...args] = input.trim().split(/\s+/);

  switch (cmd.toLowerCase()) {
    case '/help':
      console.log();
      const hw = Math.min(cols() - 4, 76);
      console.log(`  ${C.green}┌${'─'.repeat(hw - 2)}┐${C.reset}`);
      console.log(`  ${C.green}│${C.reset}  ${C.bold}${C.cyan}AVAILABLE INTERFACE COMMANDS${C.reset}${' '.repeat(Math.max(0, hw - 32))} ${C.green}│${C.reset}`);
      console.log(`  ${C.green}├${'─'.repeat(hw - 2)}┤${C.reset}`);
      
      const commands = [
        { cmd: '/new', desc: 'Start a brand new session context' },
        { cmd: '/connect <id>', desc: 'Attach CLI to an existing session ID' },
        { cmd: '/model <name>', desc: 'Set model (flash_lite, flash, pro)' },
        { cmd: '/status', desc: 'Display active session diagnostics' },
        { cmd: '/proceed', desc: 'Approve an implementation plan or artifact' },
        { cmd: '/clear', desc: 'Clear the terminal console screen' },
        { cmd: '/exit', desc: 'Disconnect and shut down the session' },
        { cmd: '/help', desc: 'Show this interactive command table' },
      ];

      for (const c of commands) {
        const cmdCol = `${C.green}${c.cmd.padEnd(16)}${C.reset}`;
        const descCol = `${C.white}${c.desc}${C.reset}`;
        const descText = c.desc;
        const linePad = ' '.repeat(Math.max(0, hw - 26 - descText.length));
        console.log(`  ${C.green}│${C.reset}  ${cmdCol}  ${C.dimGreen}│${C.reset}  ${descCol}${linePad} ${C.green}│${C.reset}`);
      }
      
      console.log(`  ${C.green}└${'─'.repeat(hw - 2)}┘${C.reset}`);
      return true;

    case '/new':
      conversationId = null;
      messageHistory = [];
      lastProcessedIndex = -1;
      displaySystem('New conversation initialized. Send a message to begin.');
      return true;
      
    case '/connect':
      if (args[0]) {
        conversationId = args[0];
        lastProcessedIndex = -1; // Reset to pull full history
        displaySystem(`Connected to session ${conversationId}`);
        // The background poller will automatically start pulling the transcript
      } else {
        displayError('Usage: /connect <conversation_id>');
      }
      return true;

    case '/model':
      if (args[0] && ['flash_lite', 'flash', 'pro'].includes(args[0])) {
        model = args[0];
        displaySystem(`Model set to ${model.toUpperCase()}`);
      } else {
        displayError('Usage: /model <flash_lite|flash|pro>');
      }
      return true;

    case '/status':
      // Status command relies on an async call to getMetadata()
      getMetadata().then(meta => {
        console.log();
        const shw = Math.min(cols() - 4, 76);
        console.log(`  ${C.green}┌${'─'.repeat(shw - 2)}┐${C.reset}`);
        console.log(`  ${C.green}│${C.reset}  ${C.bold}${C.cyan}SESSION METADATA DIAGNOSTICS${C.reset}${' '.repeat(Math.max(0, shw - 32))} ${C.green}│${C.reset}`);
        console.log(`  ${C.green}├${'─'.repeat(shw - 2)}┤${C.reset}`);

        const rows = [
          { label: 'CONV_ID', val: conversationId || 'NONE' },
          { label: 'MODEL', val: model.toUpperCase() },
        ];
        if (meta.response) {
          rows.push({ label: 'RAW_METADATA', val: JSON.stringify(meta.response).slice(0, shw - 24) });
        }

        for (const r of rows) {
          const labelText = r.label.padEnd(14);
          const valText = r.val;
          const labelCol = `${C.darkGreen}${labelText}${C.reset}`;
          const valCol = `${C.white}${valText}${C.reset}`;
          const linePad = ' '.repeat(Math.max(0, shw - 24 - valText.length));
          console.log(`  ${C.green}│${C.reset}  ${labelCol}  ${C.dimGreen}│${C.reset}  ${valCol}${linePad} ${C.green}│${C.reset}`);
        }
        console.log(`  ${C.green}└${'─'.repeat(shw - 2)}┘${C.reset}`);
      });
      return true;

    case '/clear':
      clear();
      drawBanner();
      statusBar();
      return true;

    case '/exit':
    case '/quit':
      console.log();
      displaySystem('Disconnecting from Antigravity...');
      console.log(line('═'));
      process.exit(0);

    default:
      return false;
  }
}


// ═══════════════════════════════════════════════════════════════
//  Main Loop & Background Polling
// ═══════════════════════════════════════════════════════════════
let rl;
let lastProcessedIndex = -1;
let backgroundSpinner = null;

function clearCurrentLine() {
  process.stdout.write('\x1b[2K\r');
}

async function pollTranscript() {
  while (true) {
    await new Promise(r => setTimeout(r, 1000));
    if (!conversationId) continue;

    const transcriptPath = path.join(
      process.env.USERPROFILE || process.env.HOMEPATH || 'C:\\Users\\Zartc',
      '.gemini', 'antigravity', 'brain', conversationId, '.system_generated', 'logs', 'transcript.jsonl'
    );

    if (fs.existsSync(transcriptPath)) {
      try {
        const content = fs.readFileSync(transcriptPath, 'utf8');
        const lines = content.split(/\r?\n/).filter(l => l.trim());
        
        let hasNewUpdates = false;
        const updates = [];

        for (const line of lines) {
          try {
            const step = JSON.parse(line);
            if (step.step_index !== undefined && step.step_index > lastProcessedIndex) {
              if (step.type === 'PLANNER_RESPONSE' && step.status === 'DONE') {
                updates.push(step);
                lastProcessedIndex = step.step_index;
                hasNewUpdates = true;
              }
            }
          } catch (e) {}
        }

        if (hasNewUpdates) {
          // Pause readline to safely print
          clearCurrentLine();
          if (backgroundSpinner) {
            stopSpinner(backgroundSpinner);
            backgroundSpinner = null;
          }

          for (const step of updates) {
            if (step.tool_calls && step.tool_calls.length > 0) {
              displayToolCalls(step.tool_calls);
            }
            if (step.content) {
              displayAgentMessage(step.content);
              messageHistory.push({ role: 'agent', content: step.content });
            }
          }

          console.log();
          statusBar();
          console.log();
          
          rl.prompt(true);
        }
      } catch (e) {}
    }
  }
}

async function main() {
  clear();
  drawBanner();

  console.log();
  displaySystem('Antigravity CLI v1.0 — Matrix Interface');
  displaySystem(`Backend: ${AGENTAPI}`);
  displaySystem('Type /help for commands, or just start typing.');
  console.log();

  statusBar();
  console.log();

  rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `${C.cyan}AGY${C.dimGreen} ⟫ ${C.reset}`,
  });

  // Start the background poller
  pollTranscript();

  rl.prompt();

  rl.on('line', async (input) => {
    let trimmed = input.trim();
    if (!trimmed) {
      rl.prompt();
      return;
    }

    if (trimmed.toLowerCase() === '/proceed') {
      trimmed = 'Proceed.';
    } else if (trimmed.startsWith('/')) {
      if (!handleCommand(trimmed)) {
        displayError(`Unknown command: ${trimmed}. Type /help for commands.`);
      }
      console.log();
      rl.prompt();
      return;
    }

    displayUserMessage(trimmed);
    messageHistory.push({ role: 'user', content: trimmed });

    if (backgroundSpinner) stopSpinner(backgroundSpinner);
    backgroundSpinner = startSpinner('Antigravity is thinking');

    // Run send message in background
    sendMessage(trimmed).then(result => {
      if (result && result.error) {
        clearCurrentLine();
        if (backgroundSpinner) {
          stopSpinner(backgroundSpinner);
          backgroundSpinner = null;
        }
        displayError(result.error);
        console.log();
        statusBar();
        console.log();
        rl.prompt(true);
      }
    }).catch(err => {
      clearCurrentLine();
      if (backgroundSpinner) {
        stopSpinner(backgroundSpinner);
        backgroundSpinner = null;
      }
      displayError(err.message);
      console.log();
      statusBar();
      console.log();
      rl.prompt(true);
    });
  });

  rl.on('close', () => {
    console.log();
    displaySystem('Session terminated.');
    console.log(line('═'));
    process.exit(0);
  });
}

main();

