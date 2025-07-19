from datetime import datetime

def log_event(frequency, location):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"{timestamp} | Location: {location} | Frequency: {frequency} Hz\n"
    with open("data/lightning_log.txt", "a") as f:
        f.write(line)
    return line
