from django.core.management.base import BaseCommand
from portfolio.models import GalleryItem


class Command(BaseCommand):
    help = 'Seed gallery items'

    def handle(self, *args, **options):
        gallery_data = [
            {
                'id': 'gallery-001',
                'title': 'AI Resume Builder UI',
                'category': 'Design',
                'image': 'https://via.placeholder.com/400x300?text=AI+Resume+Builder',
                'description': 'Dashboard design for the AI-powered resume builder application.',
                'year': 2024,
                'order': 0,
            },
            {
                'id': 'gallery-002',
                'title': 'MERN Stack Architecture Diagram',
                'category': 'Diagrams',
                'image': 'https://via.placeholder.com/400x300?text=MERN+Architecture',
                'description': 'System architecture diagram for a full-stack MERN application.',
                'year': 2024,
                'order': 1,
            },
            {
                'id': 'gallery-003',
                'title': 'Machine Learning Workshop',
                'category': 'Events',
                'image': 'https://via.placeholder.com/400x300?text=ML+Workshop',
                'description': 'Conducted a hands-on machine learning workshop for 50+ students.',
                'year': 2024,
                'order': 2,
            },
            {
                'id': 'gallery-004',
                'title': 'TensorFlow Developer Certificate',
                'category': 'Certificates',
                'image': 'https://via.placeholder.com/400x300?text=TensorFlow+Cert',
                'description': 'Google TensorFlow Developer Professional Certificate.',
                'year': 2023,
                'order': 3,
            },
            {
                'id': 'gallery-005',
                'title': 'FastAPI Microservices Design',
                'category': 'Design',
                'image': 'https://via.placeholder.com/400x300?text=FastAPI+Design',
                'description': 'API architecture and endpoint design for a microservices backend.',
                'year': 2024,
                'order': 4,
            },
            {
                'id': 'gallery-006',
                'title': 'React Dashboard Screenshot',
                'category': 'Screenshots',
                'image': 'https://via.placeholder.com/400x300?text=React+Dashboard',
                'description': 'Live screenshot of an analytics dashboard built with React and Recharts.',
                'year': 2024,
                'order': 5,
            },
            {
                'id': 'gallery-007',
                'title': 'Python Bootcamp — Session',
                'category': 'Events',
                'image': 'https://via.placeholder.com/400x300?text=Python+Bootcamp',
                'description': 'Teaching Python fundamentals at a college bootcamp event.',
                'year': 2023,
                'order': 6,
            },
            {
                'id': 'gallery-008',
                'title': 'AWS Cloud Practitioner',
                'category': 'Certificates',
                'image': 'https://via.placeholder.com/400x300?text=AWS+Certificate',
                'description': 'AWS Certified Cloud Practitioner — Foundational level certification.',
                'year': 2023,
                'order': 7,
            },
            {
                'id': 'gallery-009',
                'title': 'Portfolio v1 — Dark Mode',
                'category': 'Screenshots',
                'image': 'https://via.placeholder.com/400x300?text=Portfolio+v1',
                'description': 'First version of the personal portfolio website in dark mode.',
                'year': 2023,
                'order': 8,
            },
            {
                'id': 'gallery-010',
                'title': 'Neural Network Visualization',
                'category': 'Diagrams',
                'image': 'https://via.placeholder.com/400x300?text=Neural+Network',
                'description': 'Visual representation of a multi-layer neural network architecture.',
                'year': 2024,
                'order': 9,
            },
            {
                'id': 'gallery-011',
                'title': 'Hackathon — 1st Place',
                'category': 'Events',
                'image': 'https://via.placeholder.com/400x300?text=Hackathon+Win',
                'description': 'Won first place at a national-level AI hackathon with an NLP project.',
                'year': 2024,
                'order': 10,
            },
            {
                'id': 'gallery-012',
                'title': 'MongoDB Atlas Data Model',
                'category': 'Diagrams',
                'image': 'https://via.placeholder.com/400x300?text=MongoDB+Model',
                'description': 'NoSQL data model diagram for a multi-tenant SaaS application.',
                'year': 2024,
                'order': 11,
            },
        ]

        GalleryItem.objects.all().delete()

        for data in gallery_data:
            GalleryItem.objects.create(**data)

        self.stdout.write(self.style.SUCCESS(f'[SUCCESS] Seeded {len(gallery_data)} gallery items'))
