from datetime import datetime
import os
import re

def log_event(frequency, location):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # SECURITY FIX: Strip newline/carriage return characters to prevent Log Injection
    safe_location = re.sub(r'[\r\n|]', '', str(location)).strip()[:60]
    try:
        safe_freq = float(frequency)
    except (ValueError, TypeError):
        safe_freq = 0.0

    line = f"{timestamp} | Location: {safe_location} | Frequency: {safe_freq} Hz\n"

    os.makedirs("data", exist_ok=True)

    with open("data/lightning_log.txt", "a", encoding="utf-8") as f:
        f.write(line)

    return line
    
