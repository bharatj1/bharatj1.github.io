# PC Remote Setup

## 1. Install Python
Download from https://python.org — check "Add to PATH" during install.
No extra packages needed (uses only stdlib).

## 2. Set your USB device name
Open `server.py`, find this line near the top:
```
USB_DEVICE_NAME = "YOUR_DEVICE_NAME_HERE"
```
Replace with your recording device name from Device Manager.
Partial name is fine, e.g. "Focusrite" or "Scarlett".

## 3. Run the server
Double-click `start.bat`
A console window will show your IP, e.g.:
```
PC Remote running at  http://192.168.1.42:8080
```

## 4. Open on phone
Connect phone to same WiFi.
Open that URL in your phone browser.
Tap the share button → "Add to Home Screen" → done.

## 5. Auto-start on Windows boot
Press Win+R → type `shell:startup` → Enter.
Copy a shortcut of `start.bat` into that folder.
Server will start silently every time Windows boots.

---

## Teams Setup (optional — needs Microsoft 365 work/school account)

1. Go to https://portal.azure.com
2. Azure Active Directory → App registrations → New registration
   - Name: "PC Remote"
   - Supported account types: Single tenant
   - Click Register
3. Copy the **Application (client) ID** → paste as TEAMS_CLIENT_ID in server.py
4. Copy the **Directory (tenant) ID** → paste as TEAMS_TENANT_ID in server.py
5. Certificates & secrets → New client secret → copy value → paste as TEAMS_CLIENT_SECRET
6. API permissions → Add permission → Microsoft Graph → Application permissions
   - Add: `Presence.ReadWrite.All`
   - Click "Grant admin consent"

Then fill in server.py:
```python
TEAMS_CLIENT_ID     = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
TEAMS_CLIENT_SECRET = "your-secret-here"
TEAMS_TENANT_ID     = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

---

## Firewall (if phone can't connect)
Run this once in an admin CMD:
```
netsh advfirewall firewall add rule name="PC Remote" dir=in action=allow protocol=TCP localport=8080
```
