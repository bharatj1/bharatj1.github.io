"""
Outlook COM tool — read-only, silent.
Searches across ALL folders: Inbox, LINEDATA, GraitITSupport, Sent, etc.
No network calls, no marks-as-read, completely invisible.
"""
import re
import threading
import time
from datetime import datetime, timedelta

_FOLDER_CACHE = {"folders": None, "ts": 0}
_FOLDER_LOCK  = threading.Lock()
FOLDER_TTL    = 300  # 5 minutes


def _get_ns():
    import win32com.client
    return win32com.client.Dispatch("Outlook.Application").GetNamespace("MAPI")


def _get_all_folders(ns):
    """Recursively collect all mail folders. Cached for 5 minutes."""
    now = time.time()
    if _FOLDER_CACHE["folders"] and (now - _FOLDER_CACHE["ts"]) < FOLDER_TTL:
        return _FOLDER_CACHE["folders"]

    with _FOLDER_LOCK:
        # Double-check after acquiring lock
        if _FOLDER_CACHE["folders"] and (time.time() - _FOLDER_CACHE["ts"]) < FOLDER_TTL:
            return _FOLDER_CACHE["folders"]

        folders = []

        def recurse(folder):
            try:
                if folder.DefaultItemType == 0:  # olMailItem
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
                recurse(store.GetRootFolder())
            except Exception:
                continue

        _FOLDER_CACHE["folders"] = folders
        _FOLDER_CACHE["ts"] = time.time()
        return folders


def list_folders():
    """Return all folder names — useful for debugging."""
    ns = _get_ns()
    folders = _get_all_folders(ns)
    return [f.FolderPath for f in folders]


def search_emails(from_name=None, subject_contains=None, days_back=7, folder_name=None):
    """
    Search emails — returns METADATA ONLY (no body). Use get_emails_by_ids() for full content.
    """
    ns = _get_ns()
    cutoff = datetime.now() - timedelta(days=days_back)
    all_folders = _get_all_folders(ns)

    if folder_name:
        all_folders = [f for f in all_folders if folder_name.lower() in f.Name.lower()]
    else:
        def folder_priority(f):
            name = f.Name.lower()
            if name == "inbox":          return 0
            if "linedata" in name:       return 1
            if "sent" in name:           return 2
            if "graititsupport" in name: return 99
            if "alert" in name:          return 99
            return 3
        all_folders = [f for f in all_folders if folder_priority(f) < 99]
        all_folders.sort(key=folder_priority)

    results = []
    for folder in all_folders:
        if len(results) >= 20:
            break
        try:
            items = folder.Items
            items.Sort("[ReceivedTime]", True)
            for msg in items:
                if len(results) >= 20:
                    break
                try:
                    received = msg.ReceivedTime
                    recv_dt = received.replace(tzinfo=None) if hasattr(received, 'replace') else received
                    if recv_dt < cutoff:
                        break
                    sender      = (msg.SenderName or "").lower()
                    sender_mail = (msg.SenderEmailAddress or "").lower()
                    subject     = (msg.Subject or "").lower()
                    if from_name and from_name.lower() not in sender \
                            and from_name.lower() not in sender_mail:
                        continue
                    if subject_contains and subject_contains.lower() not in subject:
                        continue
                    # Metadata only — no body preview
                    results.append({
                        "id":      msg.EntryID,
                        "folder":  folder.Name,
                        "from":    msg.SenderName or "",
                        "subject": msg.Subject or "",
                        "date":    recv_dt.strftime("%Y-%m-%d %H:%M"),
                        "conv_id": msg.ConversationID,
                    })
                except Exception:
                    continue
        except Exception:
            continue

    results.sort(key=lambda x: x["date"], reverse=True)
    return results


def get_emails_by_ids(ids):
    """Fetch full email content (body) for a list of entry IDs."""
    try:
        import pythoncom
        pythoncom.CoInitialize()
    except Exception:
        pass
    ns = _get_ns()
    results = []
    for entry_id in ids:
        try:
            msg = ns.GetItemFromID(entry_id)
            recv_dt = msg.ReceivedTime.replace(tzinfo=None)
            results.append({
                "id":      entry_id,
                "from":    msg.SenderName or "",
                "subject": msg.Subject or "",
                "date":    recv_dt.strftime("%Y-%m-%d %H:%M"),
                "body":    (msg.Body or "").strip()[:2500],
                "conv_id": msg.ConversationID,
            })
        except Exception:
            continue
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
