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
        os.system(f'notify-send "⚡ Lightning Alert" "{message}"')
    else:
        print("⚠️ " + message)  # Fallback for Termux etc.
