import os
import platform
import subprocess
import shutil

def send_alert(message):
    system = platform.system()

    if system == "Windows":
        try:
            from win10toast import ToastNotifier
            toaster = ToastNotifier()
            toaster.show_toast("⚡ Lightning Alert", message, duration=10)
        except Exception:
            print("[!] win10toast not installed.")
            print("⚠️ " + message)

    elif system == "Linux":
        # Try notify-send (for GUI Linux), fallback to Termux
        if shutil.which("notify-send") is not None:
            # SECURITY: Using subprocess with a list of arguments to prevent command injection
            # instead of os.system which is vulnerable to injection via string interpolation
            subprocess.run(["notify-send", "⚡ Lightning Alert", message], check=False)
        else:
            # Fallback: print message for Termux
            print("🔔 ALERT: " + message)

    else:
        # For Termux or unknown systems
        print("⚠️ " + message)
