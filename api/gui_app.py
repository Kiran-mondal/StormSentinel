import tkinter as tk
from tkinter import scrolledtext
import threading
import time

from sensor_simulator import get_frequency
from location import get_location
from risk_zone import get_risk_level
from utils import log_event

running = False

def start_monitor():
    global running
    running = True
    threading.Thread(target=monitor_loop, daemon=True).start()

def stop_monitor():
    global running
    running = False
    log_output.insert(tk.END, "🛑 Monitoring stopped.\n")

def monitor_loop():
    while running:
        freq = get_frequency()
        location = get_location()
        region = location.split(",")[1].strip() if "," in location else "Unknown"
        risk = get_risk_level(region, freq)
        log_line = log_event(freq, location)

        # Update GUI elements
        freq_label.config(text=f"⚡ Frequency: {freq} Hz")
        location_label.config(text=f"📍 Location: {location}")
        risk_label.config(text=f"Risk Level: {risk}")
        log_output.insert(tk.END, log_line)
        log_output.yview(tk.END)

        time.sleep(5)

# --- GUI Setup ---
root = tk.Tk()
root.title("⚡ StormSentinel - Lightning Monitor")
root.geometry("600x400")
root.resizable(False, False)

title_label = tk.Label(root, text="⚡ StormSentinel", font=("Helvetica", 16, "bold"))
title_label.pack(pady=10)

freq_label = tk.Label(root, text="⚡ Frequency: N/A", font=("Arial", 12))
freq_label.pack()

location_label = tk.Label(root, text="📍 Location: N/A", font=("Arial", 12))
location_label.pack()

risk_label = tk.Label(root, text="Risk Level: N/A", font=("Arial", 12, "bold"))
risk_label.pack(pady=5)

log_output = scrolledtext.ScrolledText(root, width=70, height=12, font=("Courier", 10))
log_output.pack(pady=10)

button_frame = tk.Frame(root)
button_frame.pack()

start_btn = tk.Button(button_frame, text="▶️ Start Monitoring", command=start_monitor, bg="green", fg="white")
start_btn.grid(row=0, column=0, padx=10)

stop_btn = tk.Button(button_frame, text="⏹️ Stop", command=stop_monitor, bg="red", fg="white")
stop_btn.grid(row=0, column=1, padx=10)

# Start GUI loop
root.mainloop()
