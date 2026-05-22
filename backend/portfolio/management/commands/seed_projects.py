from django.core.management.base import BaseCommand
from portfolio.models import Project


PROJECTS_DATA = [
    {
        'slug': 'ai-resume-builder',
        'title': 'AI Resume Builder',
        'shortDesc': 'MERN + OpenAI powered resume generator with real-time preview.',
        'longDesc': 'A full-stack resume builder that uses OpenAI GPT to generate tailored resume content based on job descriptions. Built with React, Node.js, MongoDB, and Express. Features real-time PDF preview, ATS scoring, and one-click export.',
        'thumbnail': '',
        'images': [],
        'techStack': ['React', 'Node.js', 'MongoDB', 'Express', 'OpenAI API', 'TailwindCSS'],
        'categories': ['MERN', 'AI/ML', 'Web'],
        'featured': True,
        'status': 'live',
        'links': {
            'demo': '',
            'github': 'https://github.com/Aman-0402/ai-resume-builder',
        },
        'year': 2024,
        'duration': '3 months',
        'highlights': ['1000+ users', 'ATS optimized output', 'PDF export'],
    },
    {
        'slug': 'ml-price-predictor',
        'title': 'ML Price Predictor',
        'shortDesc': 'Machine learning model to predict real estate prices with 92% accuracy.',
        'longDesc': 'End-to-end machine learning pipeline built with scikit-learn and deployed as a FastAPI service. Features data preprocessing, feature engineering, model training (XGBoost), and a React frontend for predictions.',
        'thumbnail': '',
        'images': [],
        'techStack': ['Python', 'scikit-learn', 'XGBoost', 'FastAPI', 'React', 'Pandas'],
        'categories': ['AI/ML', 'Python', 'Web'],
        'featured': True,
        'status': 'live',
        'links': {
            'demo': '',
            'github': 'https://github.com/Aman-0402/ml-price-predictor',
        },
        'year': 2024,
        'duration': '2 months',
        'highlights': ['92% accuracy', '10k+ predictions served', 'FastAPI backend'],
    },
    {
        'slug': 'devboard-dashboard',
        'title': 'DevBoard Dashboard',
        'shortDesc': 'Developer productivity dashboard with GitHub stats, tasks, and notes.',
        'longDesc': 'A personal developer dashboard built with MERN stack. Integrates GitHub API for repository stats, has a Kanban task board, markdown notes, and a Pomodoro timer. Dark mode first.',
        'thumbnail': '',
        'images': [],
        'techStack': ['React', 'Node.js', 'MongoDB', 'Express', 'GitHub API', 'Chart.js'],
        'categories': ['MERN', 'Web'],
        'featured': False,
        'status': 'live',
        'links': {
            'demo': '',
            'github': 'https://github.com/Aman-0402/devboard',
        },
        'year': 2023,
        'duration': '6 weeks',
        'highlights': ['GitHub API integration', 'Kanban board', 'Pomodoro timer'],
    },
    {
        'slug': 'echospace-blog',
        'title': 'EchoSpace – Blog Management System',
        'shortDesc': 'Full-stack blog management system for creating, editing, and managing content efficiently.',
        'longDesc': 'Developed a full-stack blog management system enabling users to create, edit, and manage content efficiently. Implemented CRUD operations with structured content handling and scalable architecture. Designed responsive UI for seamless user experience across devices. Built a modular system supporting future enhancements like authentication and user interaction.',
        'thumbnail': '',
        'images': [],
        'techStack': ['HTML', 'CSS', 'JavaScript'],
        'categories': ['Web'],
        'featured': False,
        'status': 'live',
        'links': {
            'demo': '',
            'github': 'https://github.com/Aman-0402/EchoSpace-Blog-Management-System-',
        },
        'year': 2024,
        'duration': '',
        'highlights': ['CRUD operations', 'Responsive UI', 'Modular architecture'],
    },
    {
        'slug': 'coursehub',
        'title': 'CourseHub – Online Learning Platform',
        'shortDesc': 'Web-based course platform for structured learning and content management.',
        'longDesc': 'Developed a web-based course platform for structured learning and content management. Designed intuitive UI for browsing courses and accessing learning materials. Implemented responsive design ensuring cross-device compatibility. Built scalable architecture to support future features like user tracking and recommendations.',
        'thumbnail': '',
        'images': [],
        'techStack': ['HTML', 'CSS', 'JavaScript'],
        'categories': ['Web'],
        'featured': False,
        'status': 'live',
        'links': {
            'demo': '',
            'github': 'https://github.com/Aman-0402/CourseHub',
        },
        'year': 2024,
        'duration': '',
        'highlights': ['Course browsing UI', 'Responsive design', 'Scalable architecture'],
    },
    {
        'slug': 'foodsphere',
        'title': 'FoodSphere – Food Ordering Web Platform',
        'shortDesc': 'Multi-role food ordering platform with Admin, Vendor, and User dashboards, cart, and checkout — built with Django.',
        'longDesc': 'FoodSphere is a full-stack food ordering web platform built with Django (Python). It supports a complete multi-role system with dedicated experiences for Admins, Vendors, and Users — covering everything from restaurant discovery to order placement and delivery confirmation.',
        'thumbnail': '',
        'images': [],
        'techStack': ['Django', 'Python', 'HTML', 'CSS', 'JavaScript', 'SQLite'],
        'categories': ['Web', 'Python'],
        'featured': False,
        'status': 'live',
        'links': {
            'demo': '',
            'github': 'https://github.com/Aman-0402/FoodSphere',
        },
        'year': 2024,
        'duration': '',
        'highlights': ['Multi-role system (Admin, Vendor, User)', 'End-to-end ordering flow', 'Vendor order confirmation', 'Shopping cart & checkout', 'Food & shop detail pages'],
    },
    {
        'slug': 'consultme',
        'title': 'ConsultMe – Consulting Services Platform',
        'shortDesc': 'Consulting platform to connect users with professional services.',
        'longDesc': 'Developed a consulting platform to connect users with professional services. Designed clean and responsive UI for service exploration and interaction. Implemented structured architecture for scalability and maintainability. Built a foundation for future features like booking and client management.',
        'thumbnail': '',
        'images': [],
        'techStack': ['HTML', 'CSS', 'JavaScript'],
        'categories': ['Web'],
        'featured': False,
        'status': 'live',
        'links': {
            'demo': '',
            'github': 'https://github.com/Aman-0402/ConsultMe',
        },
        'year': 2024,
        'duration': '',
        'highlights': ['Service listings', 'Responsive UI', 'Scalable architecture'],
    },
    {
        'slug': 'portfolio',
        'title': 'Personal Portfolio Website (aman.ai)',
        'shortDesc': 'Responsive portfolio showcasing projects, skills, and achievements.',
        'longDesc': 'Built a responsive portfolio to showcase projects, skills, and achievements. Designed modern UI/UX with smooth navigation and structured sections. Optimized performance for multiple devices and screen sizes. Deployed using GitHub Pages for public accessibility.',
        'thumbnail': '',
        'images': [],
        'techStack': ['React', 'TailwindCSS', 'Vite'],
        'categories': ['Web'],
        'featured': False,
        'status': 'live',
        'links': {
            'demo': '',
            'github': 'https://github.com/Aman-0402/aman.ai',
        },
        'year': 2025,
        'duration': '',
        'highlights': ['Modern UI/UX', 'GitHub Pages deployment', 'Responsive design'],
    },
]


class Command(BaseCommand):
    help = 'Seed the database with initial project data'

    def handle(self, *args, **options):
        for project_data in PROJECTS_DATA:
            project, created = Project.objects.get_or_create(
                slug=project_data['slug'],
                defaults=project_data
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'[+] Created project: {project.title}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'[-] Skipped project (already exists): {project.title}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'\n[SUCCESS] Seeding complete! {len(PROJECTS_DATA)} projects in database.')
        )
