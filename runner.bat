@echo OFF
FOR /L %%y IN (0, 1, 19) DO python main.py
PAUSE
python analysis.py