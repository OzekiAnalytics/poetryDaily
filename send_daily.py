from poemlib import get_poem_of_day

poem = get_poem_of_day()

print(poem["title"])
print(poem["author"])
print()
print(poem["text"])