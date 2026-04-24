from django.core.management.base import BaseCommand
from portfolio.models import SkillCategory, TechStackCategory, TimelineItem


# Skills data from skills.json
SKILLS_DATA = [
    {
        'category': 'Frontend Development',
        'icon': 'Layout',
        'color': '#6366F1',
        'skills': [
            {'name': 'React.js', 'level': 95},
            {'name': 'JavaScript / ES6+', 'level': 92},
            {'name': 'TypeScript', 'level': 75},
            {'name': 'TailwindCSS', 'level': 95},
            {'name': 'Next.js', 'level': 78},
            {'name': 'Framer Motion', 'level': 85},
        ],
        'order': 0,
    },
    {
        'category': 'Backend & APIs',
        'icon': 'Server',
        'color': '#22D3EE',
        'skills': [
            {'name': 'Python', 'level': 92},
            {'name': 'Node.js', 'level': 88},
            {'name': 'Express.js', 'level': 88},
            {'name': 'FastAPI', 'level': 80},
            {'name': 'REST API Design', 'level': 90},
            {'name': 'MongoDB', 'level': 90},
        ],
        'order': 1,
    },
    {
        'category': 'AI & Machine Learning',
        'icon': 'Brain',
        'color': '#F59E0B',
        'skills': [
            {'name': 'scikit-learn', 'level': 85},
            {'name': 'Pandas & NumPy', 'level': 90},
            {'name': 'XGBoost', 'level': 80},
            {'name': 'TensorFlow / Keras', 'level': 72},
            {'name': 'LangChain / RAG', 'level': 70},
            {'name': 'Data Visualisation', 'level': 82},
        ],
        'order': 2,
    },
    {
        'category': 'DevOps & Tooling',
        'icon': 'GitBranch',
        'color': '#10B981',
        'skills': [
            {'name': 'Git & GitHub', 'level': 95},
            {'name': 'GitHub Actions', 'level': 82},
            {'name': 'Docker', 'level': 70},
            {'name': 'PostgreSQL', 'level': 72},
            {'name': 'Figma', 'level': 75},
            {'name': 'Linux / Bash', 'level': 78},
        ],
        'order': 3,
    },
]

# TechStack data from techstack.json
TECHSTACK_DATA = [
    {
        'category': 'Frontend',
        'techs': [
            {'name': 'HTML5', 'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg'},
            {'name': 'CSS3', 'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg'},
            {'name': 'JavaScript', 'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg'},
            {'name': 'TypeScript', 'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg'},
            {'name': 'React.js', 'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg'},
            {'name': 'Next.js', 'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg', 'invert': True},
            {'name': 'TailwindCSS', 'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-plain.svg'},
            {'name': 'Bootstrap', 'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg'},
            {'name': 'Redux', 'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg'},
            {'name': 'Framer Motion', 'icon': 'https://cdn.simpleicons.org/framer/0055FF'},
        ],
        'order': 0,
    },
    {
        'category': 'Backend',
        'techs': [
            {'name': 'Node.js', 'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg'},
            {'name': 'Express.js', 'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg', 'invert': True},
            {'name': 'Python', 'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg'},
            {'name': 'Django', 'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg'},
            {'name': 'Flask', 'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg', 'invert': True},
            {'name': 'FastAPI', 'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-plain.svg'},
            {'name': 'GraphQL', 'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg'},
        ],
        'order': 1,
    },
    {
        'category': 'AI & Machine Learning',
        'techs': [
            {'name': 'TensorFlow', 'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg'},
            {'name': 'Keras', 'icon': 'https://cdn.simpleicons.org/keras/D00000'},
            {'name': 'scikit-learn', 'icon': 'https://cdn.simpleicons.org/scikitlearn/F7931E'},
            {'name': 'Pandas', 'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg'},
            {'name': 'NumPy', 'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/numpy/numpy-original.svg'},
            {'name': 'OpenCV', 'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/opencv/opencv-original.svg'},
            {'name': 'Jupyter', 'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jupyter/jupyter-original.svg'},
            {'name': 'Matplotlib', 'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/matplotlib/matplotlib-original.svg'},
            {'name': 'XGBoost', 'icon': 'https://cdn.simpleicons.org/xgboost/189AB4'},
        ],
        'order': 2,
    },
    {
        'category': 'Database',
        'techs': [
            {'name': 'MongoDB', 'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg'},
            {'name': 'PostgreSQL', 'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg'},
            {'name': 'MySQL', 'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg'},
            {'name': 'Redis', 'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg'},
            {'name': 'Firebase', 'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg'},
        ],
        'order': 3,
    },
    {
        'category': 'DevOps & Tools',
        'techs': [
            {'name': 'Git', 'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg'},
            {'name': 'GitHub', 'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg', 'invert': True},
            {'name': 'Docker', 'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg'},
            {'name': 'Linux', 'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg'},
            {'name': 'AWS', 'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg'},
            {'name': 'Vercel', 'icon': 'https://cdn.simpleicons.org/vercel/000000', 'invert': True},
            {'name': 'Vite', 'icon': 'https://cdn.simpleicons.org/vite/646CFF'},
            {'name': 'VS Code', 'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg'},
            {'name': 'Figma', 'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg'},
            {'name': 'Postman', 'icon': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg'},
        ],
        'order': 4,
    },
]

# Timeline data from timeline.json
TIMELINE_DATA = [
    {
        'year': '2019',
        'title': 'Started the Developer Journey',
        'type': 'education',
        'description': 'Began learning web development with HTML, CSS, and JavaScript. Fell in love with programming and decided to pursue it seriously, spending hours building small projects every day.',
        'tags': ['HTML', 'CSS', 'JavaScript', 'Self-Taught'],
        'order': 0,
    },
    {
        'year': '2020',
        'title': 'First Freelance Project & MERN Stack',
        'type': 'work',
        'description': 'Landed my first freelance client and shipped a business website. Discovered the MERN stack and went all-in on React + Node.js, building multiple full-stack applications.',
        'tags': ['React', 'Node.js', 'MongoDB', 'Freelance'],
        'order': 1,
    },
    {
        'year': '2021',
        'title': 'Deep Dive into Python & Machine Learning',
        'type': 'milestone',
        'description': 'Expanded into the Python ecosystem - data science, scikit-learn, and statistical modelling. Built my first end-to-end ML pipelines and started combining web and AI in projects.',
        'tags': ['Python', 'scikit-learn', 'Pandas', 'Data Science'],
        'order': 2,
    },
    {
        'year': '2022',
        'title': 'Started Teaching & Content Creation',
        'type': 'milestone',
        'description': 'Launched the Think_Like_Me YouTube channel and began training 50+ developers. Discovered that teaching is the fastest way to deepen your own expertise.',
        'tags': ['YouTube', 'Teaching', '50+ Students', 'Mentorship'],
        'order': 3,
    },
    {
        'year': '2023',
        'title': 'AI-Powered Products & Technical eBooks',
        'type': 'work',
        'description': 'Built production AI applications integrating LLMs, RAG pipelines, and ML models via FastAPI. Published technical eBooks to share knowledge with the wider developer community.',
        'tags': ['LangChain', 'FastAPI', 'LLMs', 'eBooks'],
        'order': 4,
    },
    {
        'year': '2024',
        'title': '200+ Students & AI/ML Consulting',
        'type': 'milestone',
        'description': 'Crossed the 200+ students trained milestone. Expanded into corporate training workshops and started AI/ML consulting for startups looking to integrate intelligent features.',
        'tags': ['200+ Students', 'Consulting', 'Workshops', 'AI Engineering'],
        'order': 5,
    },
    {
        'year': '2025',
        'title': 'Launched aman.ai - Personal Brand Platform',
        'type': 'launch',
        'description': 'Built and launched aman.ai - a unified personal brand platform combining projects, services, technical blog, eBooks, and the AI/ML Knowledge Hub.',
        'tags': ['React', 'Vite', 'TailwindCSS', 'Personal Brand'],
        'order': 6,
    },
]


class Command(BaseCommand):
    help = 'Seed Skills, TechStack, and Timeline data'

    def handle(self, *args, **options):
        # Clear existing data
        SkillCategory.objects.all().delete()
        TechStackCategory.objects.all().delete()
        TimelineItem.objects.all().delete()

        # Seed Skills
        for skill in SKILLS_DATA:
            SkillCategory.objects.create(**skill)
            self.stdout.write(self.style.SUCCESS(f'[+] Created skill category: {skill["category"]}'))

        # Seed TechStack
        for tech in TECHSTACK_DATA:
            TechStackCategory.objects.create(**tech)
            self.stdout.write(self.style.SUCCESS(f'[+] Created tech stack category: {tech["category"]}'))

        # Seed Timeline
        for item in TIMELINE_DATA:
            TimelineItem.objects.create(**item)
            self.stdout.write(self.style.SUCCESS(f'[+] Created timeline item: {item["year"]} - {item["title"]}'))

        self.stdout.write(
            self.style.SUCCESS(
                f'\n[SUCCESS] Skills, TechStack, and Timeline seeded!\n'
                f'- {len(SKILLS_DATA)} skill categories\n'
                f'- {len(TECHSTACK_DATA)} tech stack categories\n'
                f'- {len(TIMELINE_DATA)} timeline items'
            )
        )
