from django.core.management.base import BaseCommand
from portfolio.models import AboutStat, WhatIDo, BioParagraph, AboutHighlight


# Hardcoded data from About.jsx
STATS_DATA = [
    {'icon_name': 'Calendar', 'value': '5+', 'label': 'Years Experience', 'order': 0},
    {'icon_name': 'Users', 'value': '3000+', 'label': 'Students Trained', 'order': 1},
    {'icon_name': 'FolderGit2', 'value': '50+', 'label': 'Projects Delivered', 'order': 2},
    {'icon_name': 'Layers', 'value': '40+', 'label': 'Technologies', 'order': 3},
]

WHAT_I_DO_DATA = [
    {
        'icon_name': 'Code2',
        'title': 'Full-Stack Web Development',
        'description': 'End-to-end MERN stack applications — from pixel-perfect React frontends to scalable Node.js backends with RESTful APIs and MongoDB databases.',
        'tags': ['React', 'Node.js', 'MongoDB', 'Express'],
        'order': 0,
    },
    {
        'icon_name': 'Brain',
        'title': 'AI & Machine Learning',
        'description': 'Production-ready ML pipelines, LLM-powered applications, and intelligent features that transform raw data into business value.',
        'tags': ['Python', 'scikit-learn', 'LangChain', 'FastAPI'],
        'order': 1,
    },
    {
        'icon_name': 'GraduationCap',
        'title': 'Technical Training',
        'description': 'Hands-on workshops and 1-on-1 mentoring for developers at all levels — covering web development, Python, and AI/ML from fundamentals to production.',
        'tags': ['Workshops', 'Mentoring', '200+ Students'],
        'order': 2,
    },
    {
        'icon_name': 'Rocket',
        'title': 'AI Product Consulting',
        'description': 'Helping startups and teams integrate AI into their products strategically — architecture reviews, proof-of-concepts, and implementation roadmaps.',
        'tags': ['Strategy', 'Architecture', 'LLMs', 'APIs'],
        'order': 3,
    },
]

BIO_DATA = [
    {
        'text': 'I\'m Aman Raj — a Full-Stack Developer and AI/ML Engineer based in India. I specialise in building production-ready web applications with the MERN stack and Python, with a focus on integrating intelligent features that genuinely solve problems.',
        'order': 0,
    },
    {
        'text': 'Beyond writing code, I\'m passionate about sharing knowledge. Through YouTube tutorials, technical eBooks, and direct training, I\'ve helped 200+ developers level up in web development and machine learning — from complete beginners to production-ready engineers.',
        'order': 1,
    },
    {
        'text': 'I believe in clean architecture, thoughtful UI, and the power of continuous learning. Whether it\'s crafting pixel-perfect interfaces with React and TailwindCSS, building scalable APIs, or developing ML pipelines — I bring both technical depth and teaching clarity to everything I build.',
        'order': 2,
    },
]

HIGHLIGHTS_DATA = [
    {'text': 'MERN Stack & Python — full production experience', 'order': 0},
    {'text': 'AI/ML Engineering: LLMs, RAG, scikit-learn, XGBoost', 'order': 1},
    {'text': 'Technical Trainer — workshops, eBooks, 1-on-1 mentoring', 'order': 2},
    {'text': 'Open to freelance projects and AI/ML consulting', 'order': 3},
]


class Command(BaseCommand):
    help = 'Seed the database with About section data from About.jsx'

    def handle(self, *args, **options):
        # Clear existing data
        AboutStat.objects.all().delete()
        WhatIDo.objects.all().delete()
        BioParagraph.objects.all().delete()
        AboutHighlight.objects.all().delete()

        # Seed Stats
        for stat in STATS_DATA:
            AboutStat.objects.create(**stat)
            self.stdout.write(self.style.SUCCESS(f'[+] Created stat: {stat["label"]}'))

        # Seed What I Do
        for item in WHAT_I_DO_DATA:
            WhatIDo.objects.create(**item)
            self.stdout.write(self.style.SUCCESS(f'[+] Created What I Do: {item["title"]}'))

        # Seed Bio Paragraphs
        for bio in BIO_DATA:
            BioParagraph.objects.create(**bio)
            self.stdout.write(self.style.SUCCESS(f'[+] Created bio paragraph'))

        # Seed Highlights
        for highlight in HIGHLIGHTS_DATA:
            AboutHighlight.objects.create(**highlight)
            self.stdout.write(self.style.SUCCESS(f'[+] Created highlight: {highlight["text"][:50]}...'))

        self.stdout.write(
            self.style.SUCCESS(
                f'\n[SUCCESS] About section seeded!\n'
                f'- {len(STATS_DATA)} stats\n'
                f'- {len(WHAT_I_DO_DATA)} What I Do cards\n'
                f'- {len(BIO_DATA)} bio paragraphs\n'
                f'- {len(HIGHLIGHTS_DATA)} highlights'
            )
        )
