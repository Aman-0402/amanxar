from django.core.management.base import BaseCommand
from portfolio.models import Assessment, Question, AnswerOption


QUESTIONS = [
    {
        'type': 'mcq_single',
        'text': 'What is the correct way to define a function in Python?',
        'explanation': '`def` is the keyword used to define functions in Python. `function`, `fun`, and `define` are not valid Python keywords.',
        'options': [
            ('def greet():', True),
            ('function greet():', False),
            ('fun greet():', False),
            ('define greet():', False),
        ],
    },
    {
        'type': 'mcq_single',
        'text': 'What does `len("hello")` return?',
        'explanation': '`len()` returns the number of characters in a string. "hello" has 5 characters, so it returns 5.',
        'options': [
            ('4', False),
            ('5', True),
            ('6', False),
            ('Error', False),
        ],
    },
    {
        'type': 'mcq_single',
        'text': 'What is the output of `2 ** 3` in Python?',
        'explanation': '`**` is the exponentiation operator. `2 ** 3` means 2 raised to the power 3, which equals 8.',
        'options': [
            ('6', False),
            ('5', False),
            ('8', True),
            ('9', False),
        ],
    },
    {
        'type': 'mcq_single',
        'text': 'Which of the following is used to create an empty dictionary in Python?',
        'explanation': '`{}` creates an empty dictionary. `[]` creates an empty list, `()` creates an empty tuple, and `set()` creates an empty set.',
        'options': [
            ('{}', True),
            ('[]', False),
            ('()', False),
            ('set()', False),
        ],
    },
    {
        'type': 'mcq_single',
        'text': 'What does the `//` operator do in Python?',
        'explanation': '`//` performs floor (integer) division — it divides and rounds down to the nearest whole number. For example, `7 // 2` returns `3`.',
        'options': [
            ('Regular division', False),
            ('Modulo (remainder)', False),
            ('Floor (integer) division', True),
            ('Exponentiation', False),
        ],
    },
    {
        'type': 'mcq_single',
        'text': 'What is the output of `"python"[0]`?',
        'explanation': 'String indexing in Python starts at 0. So `"python"[0]` gives the first character, which is `p`.',
        'options': [
            ('"python"', False),
            ('p', True),
            ('y', False),
            ('Error: index out of range', False),
        ],
    },
    {
        'type': 'true_false',
        'text': 'Python lists are mutable (they can be changed after creation).',
        'explanation': 'True. Python lists are mutable — you can add, remove, or modify elements. Tuples are immutable (cannot be changed).',
        'options': [
            ('True', True),
            ('False', False),
        ],
    },
    {
        'type': 'mcq_single',
        'text': 'Which method removes AND returns the last element of a Python list?',
        'explanation': '`list.pop()` removes and returns the last element by default. `remove()` removes by value, `delete` is not a method, and `discard()` is a set method.',
        'options': [
            ('remove()', False),
            ('pop()', True),
            ('delete()', False),
            ('discard()', False),
        ],
    },
    {
        'type': 'mcq_multi',
        'text': 'Which of the following are valid ways to create a list in Python? (Select ALL that apply)',
        'explanation': 'Both `my_list = []` and `my_list = list()` are valid ways to create an empty list. `my_list = {}` creates a dict, and `my_list = ()` creates a tuple.',
        'options': [
            ('my_list = []', True),
            ('my_list = list()', True),
            ('my_list = {}', False),
            ('my_list = ()', False),
        ],
    },
    {
        'type': 'mcq_single',
        'text': 'What is the output of `bool(0)` in Python?',
        'explanation': 'In Python, `0`, empty strings `""`, empty lists `[]`, and `None` all evaluate to `False`. Any non-zero number is `True`.',
        'options': [
            ('True', False),
            ('False', True),
            ('0', False),
            ('None', False),
        ],
    },
]


class Command(BaseCommand):
    help = 'Create a Python test assessment with 10 questions'

    def handle(self, *args, **kwargs):
        # Delete existing test assessment if present
        Assessment.objects.filter(title='Python Fundamentals Quiz').delete()

        assessment = Assessment.objects.create(
            title='Python Fundamentals Quiz',
            description='Test your understanding of Python basics — syntax, data types, operators, and built-in methods. 10 questions, 15 minutes.',
            category='Python',
            tags=['python', 'beginner', 'fundamentals'],
            is_free=True,
            time_limit=15,
            pass_mark=60,
            is_active=True,
            order=1,
        )

        for i, qdata in enumerate(QUESTIONS):
            question = Question.objects.create(
                assessment=assessment,
                type=qdata['type'],
                text=qdata['text'],
                explanation=qdata['explanation'],
                order=i,
            )
            for j, (text, is_correct) in enumerate(qdata['options']):
                AnswerOption.objects.create(
                    question=question,
                    text=text,
                    is_correct=is_correct,
                    order=j,
                )

        self.stdout.write(self.style.SUCCESS(
            f'Created assessment "{assessment.title}" with {len(QUESTIONS)} questions (ID: {assessment.id})'
        ))
        self.stdout.write('  → Login as student1 / Student@123 to test it at /student/assessments')
