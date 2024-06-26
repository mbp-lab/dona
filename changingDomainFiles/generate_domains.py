import string
import random

def random_str(str_length = 8):
    return ''.join(random.choice(string.digits + string.ascii_lowercase) for _ in range(str_length))

with open("domainPrefixes.csv", "w") as f:
    for _ in range(100):
        f.write(random_str() + "\n")
