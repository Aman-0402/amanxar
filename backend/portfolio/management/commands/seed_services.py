from django.core.management.base import BaseCommand
from portfolio.models import Service


class Command(BaseCommand):
    help = 'Seed services'

    def handle(self, *args, **options):
        services_data = [
            {
                'id': 'svc-001',
                'slug': 'full-stack-development',
                'title': 'Full-Stack Web Development',
                'icon': '💻',
                'description': 'I design and develop complete full-stack web applications tailored to your needs. Whether you\'re a student or a business, I can help you build scalable and modern solutions.',
                'features': [
                    'Final Year Projects (End-to-End Development)',
                    'MERN Stack / Java Spring Boot Projects',
                    'Responsive UI + Backend Integration',
                    'Deployment & Documentation Support',
                ],
                'pricing': 'Pricing depends on project complexity',
                'cta': 'Contact Me',
                'cta_link': '/contact?service=full-stack',
                'order': 0,
            },
            {
                'id': 'svc-002',
                'slug': 'ai-ml-development',
                'title': 'AI / ML Engineering',
                'icon': '🤖',
                'description': 'Let\'s build intelligent systems using Machine Learning and AI — from model development to real-world deployment.',
                'features': [
                    'ML Model Development (Regression, Classification, NLP)',
                    'AI-Powered Projects for Students',
                    'Data Analysis & Visualization',
                    'Real-world Problem Solving',
                ],
                'pricing': None,
                'cta': 'Get a Quote',
                'cta_link': '/contact?service=ai-ml',
                'order': 1,
            },
            {
                'id': 'svc-003',
                'slug': 'technical-training',
                'title': 'Technical Training & Consulting',
                'icon': '🎓',
                'description': 'I provide training and consulting for students and professionals looking to grow their skills and build real projects.',
                'features': [
                    'Web Development (Frontend + Backend)',
                    'Python & Machine Learning',
                    'Project Guidance & Mentorship',
                    'Career Guidance & Interview Prep',
                ],
                'pricing': None,
                'cta': 'Book a Session',
                'cta_link': '/contact?service=training',
                'order': 2,
            },
        ]

        Service.objects.all().delete()

        for data in services_data:
            Service.objects.create(**data)

        self.stdout.write(self.style.SUCCESS(f'[SUCCESS] Seeded {len(services_data)} services'))
