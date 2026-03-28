"""
Outlook COM tool — read-only, runs on Windows only.
Reads directly from your local Outlook desktop app.
No network calls, no marks-as-read, completely silent.
"""
import re
from datetime import datetime, timedelta


def _get_outlook():
    import win32com.client
    return win32com.client.Dispatch("Outlook.Application").GetNamespace("MAPI")


def search_emails(from_name=None, subject_contains=None, days_back=7):
    """
    Search inbox for emails. Returns list of email summaries.
    from_name: partial name or email of sender
    subject_contains: keyword in subject
    days_back: how many days to look back (default 7)
    """
    mapi = _get_outlook()
    inbox = mapi.GetDefaultFolder(6)  # 6 = Inbox
    messages = inbox.Items
    messages.Sort("[ReceivedTime]", True)  # newest first

    cutoff = datetime.now() - timedelta(days=days_back)
    results = []

    for msg in messages:
        try:
            received = msg.ReceivedTime.replace(tzinfo=None)
            if received < cutoff:
                break

            sender = msg.SenderName or ""
            sender_email = msg.SenderEmailAddress or ""
            subject = msg.Subject or ""

            if from_name and from_name.lower() not in sender.lower() and from_name.lower() not in sender_email.lower():
                continue
            if subject_contains and subject_contains.lower() not in subject.lower():
                continue

            results.append({
                "id":           msg.EntryID,
                "from":         sender,
                "from_email":   sender_email,
                "subject":      subject,
                "received":     received.strftime("%Y-%m-%d %H:%M"),
                "preview":      (msg.Body or "")[:200].strip(),
                "has_thread":   msg.ConversationID is not None,
                "conversation_id": msg.ConversationID,
            })

            if len(results) >= 20:
                break
        except Exception:
            continue

    return results


def get_email_thread(conversation_id):
    """
    Get all emails in a conversation thread by conversation ID.
    Returns full bodies — sorted oldest to newest.
    """
    mapi = _get_outlook()
    inbox = mapi.GetDefaultFolder(6)
    messages = inbox.Items

    thread = []
    for msg in messages:
        try:
            if msg.ConversationID == conversation_id:
                thread.append({
                    "from":     msg.SenderName or msg.SenderEmailAddress,
                    "to":       msg.To,
                    "subject":  msg.Subject,
                    "received": msg.ReceivedTime.strftime("%Y-%m-%d %H:%M"),
                    "body":     (msg.Body or "").strip()[:3000],  # cap per email
                })
        except Exception:
            continue

    thread.sort(key=lambda x: x["received"])
    return thread


def get_email_by_id(entry_id):
    """Get a single email by its EntryID."""
    mapi = _get_outlook()
    try:
        msg = mapi.GetItemFromID(entry_id)
        return {
            "from":     msg.SenderName,
            "to":       msg.To,
            "subject":  msg.Subject,
            "received": msg.ReceivedTime.strftime("%Y-%m-%d %H:%M"),
            "body":     (msg.Body or "").strip(),
        }
    except Exception as e:
        return {"error": str(e)}


def get_ticket_number_from_email(email_body):
    """Extract ticket numbers from email body (e.g. #1234 or INC-1234)."""
    patterns = [r"#(\d{4,})", r"INC[-\s]?(\d+)", r"ticket[:\s#]+(\d+)"]
    for p in patterns:
        m = re.search(p, email_body, re.IGNORECASE)
        if m:
            return m.group(1)
    return None
