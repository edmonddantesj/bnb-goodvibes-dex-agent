#!/usr/bin/env python3
import sys, time, argparse

p=argparse.ArgumentParser()
p.add_argument('--delay', type=float, default=0.25, help='seconds per line')
p.add_argument('--flush', action='store_true', help='force flush after each line')
args=p.parse_args()

delay=args.delay
for line in sys.stdin:
    sys.stdout.write(line)
    if args.flush:
        sys.stdout.flush()
    time.sleep(delay)
