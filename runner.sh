for i in $(seq 1 9); do
  python3 main.py 2
done

python3 analysis.py
