"""
Persistent memory for the Second Brain.
Extracts and stores key facts after every conversation.
Grows over time — the brain gets smarter the more you use it.
"""
import json
import os
import datetime
import anthropic

MEMORY_FILE = os.path.join(os.path.dirname(__file__), "memory.json")
MAX_ENTRIES = 200  # keep last 200 memory entries before compressing


def load_memory():
    """Load all memory entries. Returns list of strings."""
    if not os.path.exists(MEMORY_FILE):
        return []
    try:
        with open(MEMORY_FILE) as f:
            data = json.load(f)
        return data.get("entries", [])
    except Exception:
        return []


def save_memory(entries):
    with open(MEMORY_FILE, "w") as f:
        json.dump({"entries": entries, "updated": datetime.datetime.now().isoformat()}, f, indent=2)


def format_memory_for_prompt(entries):
    """Format memory entries into a block for the system prompt."""
    if not entries:
        return ""
    lines = "\n".join(f"- {e}" for e in entries[-100:])  # last 100 in prompt
    return f"\nWHAT YOU KNOW FROM PAST CONVERSATIONS:\n{lines}\n"


def extract_and_save(conversation_history, api_key):
    """
    After a conversation, extract key facts worth remembering.
    Runs a quick Claude call to distil what matters.
    """
    if not conversation_history or len(conversation_history) < 2:
        return

    # Build a compact version of the conversation for extraction
    convo_text = ""
    for msg in conversation_history:
        role = msg.get("role", "")
        content = msg.get("content", "")
        if isinstance(content, str) and content.strip():
            label = "Bharat" if role == "user" else "Brain"
            convo_text += f"{label}: {content[:500]}\n"

    if not convo_text.strip():
        return

    existing = load_memory()

    try:
        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",  # fast + cheap for memory extraction
            max_tokens=1024,
            system="""You extract facts worth remembering from a work conversation.
Output ONLY a JSON array of short fact strings. Each fact should be:
- Specific and actionable (not vague)
- About people, projects, issues, decisions, or context
- Written as a statement e.g. "Liz is a client at [company] who raised concerns about integration delays"
- Max 20 words per fact

Output ONLY valid JSON like: ["fact 1", "fact 2"]
If nothing meaningful to remember, output: []""",
            messages=[{"role": "user", "content": f"Extract facts from this conversation:\n\n{convo_text[:3000]}"}]
        )

        text = response.content[0].text.strip()
        # Extract JSON array from response
        start = text.find("[")
        end = text.rfind("]") + 1
        if start >= 0 and end > start:
            new_facts = json.loads(text[start:end])
            if new_facts:
                # Add timestamp to each fact
                dated = [f"{f} [{datetime.date.today().strftime('%d %b %Y')}]" for f in new_facts]
                combined = existing + dated
                # Trim if too large
                if len(combined) > MAX_ENTRIES:
                    combined = combined[-MAX_ENTRIES:]
                save_memory(combined)
    except Exception:
        pass  # Memory extraction is best-effort, never crash the main flow
