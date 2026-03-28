"""
Outlook COM tool — read-only, silent.
Searches across ALL folders: Inbox, LINEDATA, GraitITSupport, Sent, etc.
No network calls, no marks-as-read, completely invisible.
"""
import re
from datetime import datetime, timedelta


def _get_ns():
    import win32com.client
    return win32com.client.Dispatch("Outlook.Application").GetNamespace("MAPI")


def _get_all_folders(ns):
    """Recursively collect all mail folders across all stores."""
    folders = []

    def recurse(folder):
        try:
            # Only include folders that contain mail items
            if folder.DefaultItemType == 0:  # 0 = olMailItem
                folders.append(folder)
            for i in range(folder.Folders.Count):
                try:
                    recurse(folder.Folders.Item(i + 1))
                except Exception:
                    continue
        except Exception:
            pass

    for i in range(ns.Stores.Count):
        try:
            store = ns.Stores.Item(i + 1)
            root = store.GetRootFolder()
            recurse(root)
        except Exception:
            continue

    return folders


def list_folders():
    """Return all folder names — useful for debugging."""
    ns = _get_ns()
    folders = _get_all_folders(ns)
    return [f.FolderPath for f in folders]


def search_emails(from_name=None, subject_contains=None, days_back=7, folder_name=None):
    """
    Search across ALL folders (or a specific one).
    from_name: partial sender name or email
    subject_contains: keyword in subject
    days_back: how many days back (default 7)
    folder_name: limit to a specific folder e.g. 'LINEDATA', 'GraitITSupport'
    """
    ns = _get_ns()
    cutoff = datetime.now() - timedelta(days=days_back)
    all_folders = _get_all_folders(ns)

    # Filter to specific folder if requested
    if folder_name:
        all_folders = [f for f in all_folders
                       if folder_name.lower() in f.Name.lower()]

    results = []

    for folder in all_folders:
        if len(results) >= 30:
            break
        try:
            items = folder.Items
            items.Sort("[ReceivedTime]", True)

            for msg in items:
                if len(results) >= 30:
                    break
                try:
                    received = msg.ReceivedTime
                    # Check date
                    recv_dt = received.replace(tzinfo=None) if hasattr(received, 'replace') else received
                    if recv_dt < cutoff:
                        break  # Items are sorted newest first, so we can stop

                    sender      = (msg.SenderName or "").lower()
                    sender_mail = (msg.SenderEmailAddress or "").lower()
                    subject     = (msg.Subject or "").lower()

                    if from_name and from_name.lower() not in sender \
                            and from_name.lower() not in sender_mail:
                        continue
                    if subject_contains and subject_contains.lower() not in subject:
                        continue

                    results.append({
                        "id":              msg.EntryID,
                        "folder":          folder.Name,
                        "from":            msg.SenderName or "",
                        "from_email":      msg.SenderEmailAddress or "",
                        "subject":         msg.Subject or "",
                        "received":        recv_dt.strftime("%Y-%m-%d %H:%M"),
                        "preview":         (msg.Body or "")[:300].strip(),
                        "conversation_id": msg.ConversationID,
                    })
                except Exception:
                    continue
        except Exception:
            continue

    # Sort all results by date, newest first
    results.sort(key=lambda x: x["received"], reverse=True)
    return results


def get_email_thread(conversation_id):
    """Get full thread across ALL folders — oldest to newest."""
    ns = _get_ns()
    all_folders = _get_all_folders(ns)
    thread = []

    for folder in all_folders:
        try:
            for msg in folder.Items:
                try:
                    if msg.ConversationID == conversation_id:
                        thread.append({
                            "folder":   folder.Name,
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
    ns = _get_ns()
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
