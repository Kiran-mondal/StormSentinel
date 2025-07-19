import os
import platform

def send_alert(message):
    system = platform.system()

    if system == "Windows":
        try:
            from win10toast import ToastNotifier
            toaster = ToastNotifier()
            toaster.show_toast("⚡ Lightning Alert", message, duration=10)
        except:
            print("[!] win10toast not installed.")
            print("⚠️ " + message)

    elif system == "Linux":
        # Try notify-send (for GUI Linux), fallback to Termux
        if os.system("which notify-send > /dev/null 2>&1") == 0:
            os.system(f'notify-send "⚡ Lightning Alert" "{message}"')
        else:
            # Fallback: print message for Termux
            print("🔔 ALERT: " + message)

    else:
        # For Termux or unknown systems
        print("⚠️ " + message)
