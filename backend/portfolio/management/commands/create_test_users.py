from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from portfolio.models import UserProfile


class Command(BaseCommand):
    help = 'Create test admin and student users'

    def handle(self, *args, **kwargs):
        # Admin user
        if not User.objects.filter(username='admin').exists():
            admin = User.objects.create_superuser('admin', 'admin@thinkwithaman.com', 'Admin@123')
            UserProfile.objects.create(user=admin, full_name='Aman Raj', role='admin')
            self.stdout.write(self.style.SUCCESS('Created admin user (username: admin, password: Admin@123)'))
        else:
            admin = User.objects.get(username='admin')
            if not hasattr(admin, 'profile'):
                UserProfile.objects.create(user=admin, full_name='Aman Raj', role='admin')
                self.stdout.write(self.style.SUCCESS('Added profile to existing admin user'))
            else:
                self.stdout.write('admin user already exists')

        # Student user
        if not User.objects.filter(username='student1').exists():
            student = User.objects.create_user('student1', 'student@test.com', 'Student@123')
            UserProfile.objects.create(
                user=student,
                full_name='Test Student',
                phone='+91 9876543210',
                role='student',
            )
            self.stdout.write(self.style.SUCCESS('Created student1 user (username: student1, password: Student@123)'))
        else:
            self.stdout.write('student1 user already exists')
