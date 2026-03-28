"""
Outlook COM tool — read-only, silent, fast DASL queries.
Reads directly from local Outlook desktop app.
No network calls, no marks-as-read, completely invisible.
"""
import re
from datetime import datetime, timedelta


def _get_inbox():
    import win32com.client
    ns = win32com.client.Dispatch("Outlook.Application").GetNamespace("MAPI")
    return ns.GetDefaultFolder(6)  # 6 = Inbox


def search_emails(from_name=None, subject_contains=None, days_back=7):
    """Fast DASL search — no looping, uses Outlook's native index."""
    inbox = _get_inbox()
    cutoff = (datetime.now() - timedelta(days=days_back)).strftime("%Y-%m-%d")

    filters = [f"@SQL=(\"urn:schemas:microsoft-com:office:office#Keywords\" IS NULL OR 1=1)"]
    filters = [f"@SQL=(\"DAV:getlastmodified\" >= '{cutoff}')"]

    if from_name:
        f = from_name.replace("'", "''")
        filters.append(
            f"(\"urn:schemas:httpmail:fromname\" LIKE '%{f}%' OR "
            f"\"urn:schemas:httpmail:fromemail\" LIKE '%{f}%')"
        )
    if subject_contains:
        s = subject_contains.replace("'", "''")
        filters.append(f"\"urn:schemas:httpmail:subject\" LIKE '%{s}%'")

    query = "@SQL=" + " AND ".join(
        [f.replace("@SQL=", "") if f.startswith("@SQL=") else f for f in filters]
    )

    try:
        items = inbox.Items.Restrict(query)
        items.Sort("[ReceivedTime]", True)
    except Exception:
        # Fallback: sort without restrict
        items = inbox.Items
        items.Sort("[ReceivedTime]", True)

    results = []
    count = 0
    for msg in items:
        if count >= 20:
            break
        try:
            received = msg.ReceivedTime
            # Manual filter fallback
            if from_name and from_name.lower() not in (msg.SenderName or "").lower() \
                    and from_name.lower() not in (msg.SenderEmailAddress or "").lower():
                continue
            if subject_contains and subject_contains.lower() not in (msg.Subject or "").lower():
                continue

            results.append({
                "id":              msg.EntryID,
                "from":            msg.SenderName or "",
                "from_email":      msg.SenderEmailAddress or "",
                "subject":         msg.Subject or "",
                "received":        received.strftime("%Y-%m-%d %H:%M"),
                "preview":         (msg.Body or "")[:300].strip(),
                "conversation_id": msg.ConversationID,
            })
            count += 1
        except Exception:
            continue

    return results


def get_email_thread(conversation_id):
    """Get all emails in a thread — sorted oldest to newest."""
    import win32com.client
    ns = win32com.client.Dispatch("Outlook.Application").GetNamespace("MAPI")

    thread = []
    # Search inbox + sent items
    for folder_id in [6, 5]:  # 6=Inbox, 5=Sent
        try:
            folder = ns.GetDefaultFolder(folder_id)
            for msg in folder.Items:
                try:
                    if msg.ConversationID == conversation_id:
                        thread.append({
                            "from":     msg.SenderName or msg.SenderEmailAddress,
                            "to":       msg.To,
                            "subject":  msg.Subject,
                            "received": msg.ReceivedTime.strftime("%Y-%m-%d %H:%M"),
                            "body":     (msg.Body or "").strip()[:2000],
                        })
                except Exception:
                    continue
        except Exception:
            continue

    thread.sort(key=lambda x: x["received"])
    return thread


def get_email_by_id(entry_id):
    import win32com.client
    ns = win32com.client.Dispatch("Outlook.Application").GetNamespace("MAPI")
    try:
        msg = ns.GetItemFromID(entry_id)
        return {
            "from":     msg.SenderName,
            "to":       msg.To,
            "subject":  msg.Subject,
            "received": msg.ReceivedTime.strftime("%Y-%m-%d %H:%M"),
            "body":     (msg.Body or "").strip(),
        }
    except Exception as e:
        return {"error": str(e)}


def get_ticket_number_from_email(body):
    for p in [r"#(\d{4,})", r"INC[-\s]?(\d+)", r"ticket[:\s#]+(\d+)"]:
        m = re.search(p, body, re.IGNORECASE)
        if m:
            return m.group(1)
    return None
