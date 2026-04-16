from pathlib import Path
from datetime import datetime
import shutil

FILES_TO_CLEAR = [
    Path("/Users/lapiscine/Dropbox/Apps/npsme/npsme/intercom/closing-the-loop/ctl_pause_events.jsonl"),
    Path("/Users/lapiscine/Dropbox/Apps/npsme/npsme/intercom/closing-the-loop/ctl_cases.jsonl"),
    Path("/Users/lapiscine/Dropbox/Apps/npsme/npsme/intercom/closing-the-loop/ctl_case_audit_log.jsonl"),
]

backup_root = Path("/Users/lapiscine/Dropbox/Apps/npsme/npsme/intercom/closing-the-loop/backups")
timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
backup_dir = backup_root / f"clp_backup_{timestamp}"

backup_dir.mkdir(parents=True, exist_ok=True)

print(f"Creating backup in: {backup_dir}")

for file_path in FILES_TO_CLEAR:
    if not file_path.exists():
        print(f"SKIP (not found): {file_path}")
        continue

    backup_path = backup_dir / file_path.name
    shutil.copy2(file_path, backup_path)
    print(f"Backed up: {file_path} -> {backup_path}")

    file_path.write_text("", encoding="utf-8")
    print(f"Cleared: {file_path}")

print("\nDone.")
print("Backups created and CLP files cleared.")
print("Survey data files were left untouched.")
