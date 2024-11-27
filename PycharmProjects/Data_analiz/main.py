import subprocess
import os
import sys
import time

def go_to_sleep():
    # Для Windows
    os.system("rundll32.exe powrprof.dll,SetSuspendState 0,1,0")
    # Для Linux
    # os.system("systemctl suspend")

def run_program():
    # Запуск другого Python скрипта (например, program.py)
    subprocess.run([sys.executable, ""])

# Ваша основная программа
try:
    # Запускаем внешний файл
    run_program()
finally:
    # После завершения работы программы
    time.sleep(5)  # Дополнительная задержка перед переходом в спящий режим (если нужно)
    #go_to_sleep()
