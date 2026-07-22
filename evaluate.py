from ultralytics import YOLO

import os
from collections import Counter

counter = Counter()

label_dir = "dataset/test/labels"

for file in os.listdir(label_dir):

    if file.endswith(".txt"):

        with open(os.path.join(label_dir, file)) as f:

            for line in f:

                cls = int(line.split()[0])

                counter[cls] += 1

print(counter)