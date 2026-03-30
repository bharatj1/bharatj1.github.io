"""
Second Brain Agent — with conversation memory.
Read-only. Never sends, posts, or modifies anything.
"""

import json, os, datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
import anthropic
import memory as mem

cfg_path = os.path.join(os.path.dirname(__file__), "config.json")
with open(cfg_path) as f:
    CFG = json.load(f)

client = anthropic.Anthropic(api_key=CFG["anthropic_api_key"])

LOG_FILE = os.path.join(os.path.dirname(__file__), "audit.log")

def audit(action, detail=""):
    ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(LOG_FILE, "a") as f:
        f.write(f"[{ts}] {action}: {detail}\n")


# ── Tool implementations ───────────────────────────────────────────────────────

def tool_search_emails(from_name=None, subject_contains=None, days_back=7, folder_name=None):
    audit("search_emails", f"from={from_name} subject={subject_contains} days={days_back} folder={folder_name}")
    from tools.outlook import search_emails
    return search_emails(from_name=from_name, subject_contains=subject_contains, days_back=days_back, folder_name=folder_name)

def tool_get_email_thread(conversation_id):
    audit("get_email_thread", f"conv={str(conversation_id)[:20]}")
    from tools.outlook import get_email_thread
    return get_email_thread(conversation_id)

def tool_search_freshservice(query):
    audit("search_freshservice", f"query={query}")
    from tools.freshservice import Freshservice
    fs = Freshservice(CFG["freshservice_domain"], CFG["freshservice_api_key"])
    return fs.search_tickets(query)

def tool_get_ticket(ticket_id):
    audit("get_ticket", f"id={ticket_id}")
    from tools.freshservice import Freshservice
    fs = Freshservice(CFG["freshservice_domain"], CFG["freshservice_api_key"])
    return {"ticket": fs.get_ticket(ticket_id), "comments": fs.get_ticket_comments(ticket_id)}

def tool_search_teams_chats(person_name, days_back=7):
    audit("search_teams_chats", f"person={person_name} days={days_back}")
    from tools.teams import search_chat_messages
    results, err = search_chat_messages(person_name, days_back)
    return {"error": err} if err else results

def tool_get_channel_messages(team_name=None, days_back=3):
    audit("get_channel_messages", f"team={team_name} days={days_back}")
    from tools.teams import get_channel_messages
    results, err = get_channel_messages(team_name, days_back)
    return {"error": err} if err else results


TOOL_MAP = {
    "search_emails":        tool_search_emails,
    "get_email_thread":     tool_get_email_thread,
    "search_freshservice":  tool_search_freshservice,
    "get_ticket":           tool_get_ticket,
    "search_teams_chats":   tool_search_teams_chats,
    "get_channel_messages": tool_get_channel_messages,
}

TOOLS = [
    {
        "name": "search_emails",
        "description": "Search ALL Outlook folders — Inbox, LINEDATA, GraitITSupport, Sent, etc. Use when user mentions a person, topic, folder, or wants recent emails.",
        "input_schema": {
            "type": "object",
            "properties": {
                "from_name":        {"type": "string",  "description": "Sender name or email (partial ok)"},
                "subject_contains": {"type": "string",  "description": "Keyword in subject line"},
                "days_back":        {"type": "integer", "description": "Days back to search (default 7)"},
                "folder_name":      {"type": "string",  "description": "Limit to specific folder e.g. 'LINEDATA' or 'GraitITSupport' (optional)"},
            },
        },
    },
    {
        "name": "get_email_thread",
        "description": "Get the full conversation thread for an email using its conversation_id.",
        "input_schema": {
            "type": "object",
            "required": ["conversation_id"],
            "properties": {
                "conversation_id": {"type": "string"},
            },
        },
    },
    {
        "name": "search_freshservice",
        "description": "Search Freshservice helpdesk for tickets by keyword, person, or topic.",
        "input_schema": {
            "type": "object",
            "required": ["query"],
            "properties": {
                "query": {"type": "string"},
            },
        },
    },
    {
        "name": "get_ticket",
        "description": "Get full details and full comment history for a Freshservice ticket.",
        "input_schema": {
            "type": "object",
            "required": ["ticket_id"],
            "properties": {
                "ticket_id": {"type": "integer"},
            },
        },
    },
    {
        "name": "search_teams_chats",
        "description": "Search Teams direct messages and group chats involving a specific person.",
        "input_schema": {
            "type": "object",
            "required": ["person_name"],
            "properties": {
                "person_name": {"type": "string"},
                "days_back":   {"type": "integer", "description": "Days back (default 7)"},
            },
        },
    },
    {
        "name": "get_channel_messages",
        "description": "Get recent messages from Teams channels.",
        "input_schema": {
            "type": "object",
            "properties": {
                "team_name": {"type": "string", "description": "Filter by team name (optional)"},
                "days_back": {"type": "integer", "description": "Days back (default 3)"},
            },
        },
    },
]

SYSTEM = f"""You are the private AI assistant for Bharat Jagwani ({CFG['your_email']}), VP of Technology — responsible for enterprise IT service delivery, cybersecurity operations, automation programs, and client technology environments.

You have direct access to his Outlook inbox, Freshservice helpdesk, and Microsoft Teams chats.
Today is {datetime.date.today().strftime("%A, %d %B %Y")}.

ABSOLUTE RULES — NEVER BREAK:
1. READ ONLY. Never send emails, post messages, update tickets, or take any external action.
2. If asked to draft a reply or update — write it and say "Here's a draft. You send it."
3. You are invisible. Your access leaves no trace for anyone else.
4. Never dump raw email or ticket text. Always summarise and interpret.
5. Treat everything as confidential. Surface only what's relevant.

WHO BHARAT IS:
- Senior technology executive managing enterprise managed services and cybersecurity
- Operates in financial services client environments with strict compliance expectations
- Deals with: SOC operations, vulnerability management, cloud infrastructure, M365, endpoint security, IT governance, automation
- Needs to move fast, think clearly, communicate sharply

HOW TO RESPOND:
- Lead with the most important insight. Never bury the headline.
- Structure everything: headings, bullets, numbered steps. No walls of text.
- Be direct and confident. Write like an experienced peer, not a helpdesk bot.
- Every sentence must carry meaning. Cut anything that doesn't.
- Tone adjusts by task: strategic for executive decisions, precise for technical analysis.

WHAT YOU DO WHEN INVESTIGATING:
- Pull from all available sources — email, tickets, Teams — and connect the dots.
- Identify: what happened, who's involved, where it stands, what the risk is.
- Surface: easy wins, major risks, questions leadership will ask.
- Finish with: clear recommended next steps, prioritised.

TOOL FAILURES:
If a tool returns an error or empty results, work with what you have from other sources.
Never say "Cannot reach PC", "I can't access", or refuse to answer because one source failed.
Always give the best answer possible with available data. Note briefly if a source was unavailable.

WHAT YOU NEVER DO:
- Use corporate buzzwords (leveraging, synergy, cutting-edge)
- Use em dashes
- Give generic AI responses
- Agree blindly — challenge assumptions and flag blind spots when you see them
- Over-explain. If it can be said in fewer words without losing clarity, do it.

MEMORY:
You remember everything said earlier in this conversation. Reference it naturally.
If the user says "that ticket" or "her email" — you know what they mean from context.

EMAIL FOLDER STRUCTURE:
- Inbox: Fresh incoming emails, not yet filed. Search this first always.
- LINEDATA: Manually filed work emails. High signal. Search second.
- Sent Items: Outgoing mail. Useful for understanding what Bharat already communicated.
- GraitITSupport: Auto-moved rule-based emails. Mostly ticket notifications and automated alerts. Ignore completely unless Bharat explicitly says "check GraitITSupport".
- Alerts: Automated system alerts. Ignore completely unless explicitly asked.

Never mention GraitITSupport or Alerts folders in responses unless the user specifically asks about them.

PROFESSIONAL CONTEXT:
Managed IT services, SOC operations, M365, endpoint security, cloud infrastructure,
IT governance, automation and AI workflows. Clients in financial services with high compliance requirements.
"""


def build_system():
    """Build system prompt with current persistent memory injected."""
    memory_block = mem.format_memory_for_prompt(mem.load_memory())
    return SYSTEM + memory_block


TOOL_STATUS = {
    "search_emails":        lambda a: f"Searching emails{' from ' + a['from_name'] if a.get('from_name') else ''}{' about \"' + a['subject_contains'] + '\"' if a.get('subject_contains') else ''}{' in ' + a['folder_name'] if a.get('folder_name') else ''}...",
    "get_email_thread":     lambda a: "Reading full email thread...",
    "search_freshservice":  lambda a: f"Searching Freshservice for \"{a.get('query', '')}\"...",
    "get_ticket":           lambda a: f"Pulling ticket #{a.get('ticket_id', '')} and full history...",
    "search_teams_chats":   lambda a: f"Checking Teams chats with {a.get('person_name', '')}...",
    "get_channel_messages": lambda a: f"Reading Teams channel messages{' in ' + a['team_name'] if a.get('team_name') else ''}...",
}


def build_user_content(text, files):
    """
    Build Claude message content with text + optional files.
    Images → native vision. PDFs → native document. Others → extract text.
    """
    import base64
    from tools.files import extract

    content = []

    # Process attached files first
    for f in files:
        mime = f.get("mime", "")
        name = f.get("name", "file")
        data_b64 = f.get("data", "")
        data_bytes = base64.b64decode(data_b64)

        if mime.startswith("image/"):
            # Native vision
            content.append({
                "type": "image",
                "source": {"type": "base64", "media_type": mime, "data": data_b64}
            })
            content.append({"type": "text", "text": f"[Attached image: {name}]"})

        elif mime == "application/pdf":
            # Try native PDF first, fall back to text extraction
            content.append({
                "type": "document",
                "source": {"type": "base64", "media_type": "application/pdf", "data": data_b64}
            })
            content.append({"type": "text", "text": f"[Attached PDF: {name}]"})

        else:
            # Extract text from Word/Excel/PPT/etc
            extracted = extract(name, data_bytes)
            if extracted:
                content.append({
                    "type": "text",
                    "text": f"[Attached file: {name}]\n\n{extracted}"
                })

    # Add the user's text message
    if text:
        content.append({"type": "text", "text": text})
    elif not content:
        content.append({"type": "text", "text": "(no message)"})

    # If only one text item, return as plain string (simpler for history)
    if len(content) == 1 and content[0]["type"] == "text" and not files:
        return content[0]["text"]

    return content


def run(user_message, history=None, files=None, stream=None):
    """
    Run the agent with conversation memory and optional file attachments.
    history: list of previous messages [{"role": ..., "content": ...}]
    files:   list of {name, mime, data (base64)}
    stream:  optional callback(str) called with live status updates
    Returns (answer, updated_history)
    """
    if history is None:
        history = []
    if files is None:
        files = []

    def emit(msg):
        if stream:
            stream(msg)

    audit("user_query", f"{user_message[:80]} [{len(files)} files]")
    user_content = build_user_content(user_message, files)
    messages = history + [{"role": "user", "content": user_content}]

    while True:
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=4096,
            system=build_system(),
            tools=TOOLS,
            messages=messages,
        )

        text_parts = []
        tool_calls = []

        for block in response.content:
            if block.type == "text":
                text_parts.append(block.text)
            elif block.type == "tool_use":
                tool_calls.append(block)

        if not tool_calls:
            emit("Composing answer...")
            final = " ".join(text_parts).strip()
            audit("agent_response", final[:100])
            messages.append({"role": "assistant", "content": final})
            # Keep last 40 messages, but strip binary image/doc data from history
            def clean_msg(m):
                if not isinstance(m.get("content"), list):
                    return m
                cleaned = []
                for block in m["content"]:
                    # Handle both dicts and Anthropic SDK objects (ToolUseBlock, etc.)
                    if isinstance(block, dict):
                        btype = block.get("type")
                    else:
                        btype = getattr(block, "type", None)
                    if btype in ("image", "document"):
                        cleaned.append({"type": "text", "text": f"[{btype} attachment]"})
                    else:
                        cleaned.append(block)
                return {**m, "content": cleaned}
            trimmed = [clean_msg(m) for m in messages[-40:]]
            return final, trimmed

        messages.append({"role": "assistant", "content": response.content})

        # Emit all status messages upfront, then run tools in parallel
        for tc in tool_calls:
            status_msg = TOOL_STATUS.get(tc.name, lambda a: f"{tc.name.replace('_',' ')}...")(tc.input)
            emit(status_msg)

        tool_results_map = {}

        def run_tool(tc):
            try:
                result = TOOL_MAP[tc.name](**tc.input)
                return tc.id, result, None
            except Exception as e:
                return tc.id, {"error": str(e)}, str(e)

        with ThreadPoolExecutor(max_workers=len(tool_calls)) as ex:
            futures = {ex.submit(run_tool, tc): tc for tc in tool_calls}
            for future in as_completed(futures):
                tool_id, result, err = future.result()
                tool_results_map[tool_id] = result
                if err:
                    emit(f"Source unavailable: {err[:60]}")
                elif isinstance(result, list):
                    emit(f"Found {len(result)} result{'s' if len(result) != 1 else ''}.")
                elif isinstance(result, dict) and "ticket" in result:
                    emit(f"Got ticket details and {len(result.get('comments', []))} comments.")

        tool_results = [
            {
                "type":        "tool_result",
                "tool_use_id": tc.id,
                "content":     json.dumps(tool_results_map.get(tc.id, {"error": "no result"})),
            }
            for tc in tool_calls
        ]

        messages.append({"role": "user", "content": tool_results})
