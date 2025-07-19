from datetime import datetime
import os

def log_event(frequency, location):
    # Get current timestamp
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"{timestamp} | Location: {location} | Frequency: {frequency} Hz\n"

    # Ensure 'data' directory exists
    os.makedirs("data", exist_ok=True)

    # Append log entry to file
    with open("data/lightning_log.txt", "a") as f:
        f.write(line)

    return line
