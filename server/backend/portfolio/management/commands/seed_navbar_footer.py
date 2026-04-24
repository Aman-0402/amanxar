from django.core.management.base import BaseCommand
from portfolio.models import NavbarLink, FooterSection, FooterLink, FooterCTA, SocialLink


class Command(BaseCommand):
    help = 'Seeds navbar links, footer sections/links, social links, and footer CTA'

    def handle(self, *args, **options):
        self.stdout.write('Seeding navbar and footer data...\n')

        # ──────────────────────────────────────────────────────────────────────
        # Navbar Links
        # ──────────────────────────────────────────────────────────────────────
        NavbarLink.objects.all().delete()
        navbar_links = [
            {'label': 'About', 'href': '/about', 'order': 1},
            {'label': 'Projects', 'href': '/projects', 'order': 2},
            {'label': 'Gallery', 'href': '/gallery', 'order': 3},
            {'label': 'eBooks', 'href': '/ebooks', 'order': 4},
            {'label': 'Hub', 'href': '/knowledge-hub', 'order': 5},
            {'label': 'Services', 'href': '/services', 'order': 6},
            {'label': 'Contact', 'href': '/contact', 'order': 7},
        ]
        for link_data in navbar_links:
            NavbarLink.objects.create(**link_data)
        self.stdout.write(self.style.SUCCESS(f'[OK] Created {len(navbar_links)} navbar links'))

        # ──────────────────────────────────────────────────────────────────────
        # Footer Sections & Links
        # ──────────────────────────────────────────────────────────────────────
        FooterSection.objects.all().delete()

        sections_data = {
            'Navigation': [
                {'label': 'About', 'href': '/about', 'external': False},
                {'label': 'Projects', 'href': '/projects', 'external': False},
                {'label': 'Services', 'href': '/services', 'external': False},
                {'label': 'Contact', 'href': '/contact', 'external': False},
            ],
            'Content': [
                {'label': 'Gallery', 'href': '/gallery', 'external': False},
                {'label': 'eBooks', 'href': '/ebooks', 'external': False},
                {'label': 'Knowledge Hub', 'href': '/knowledge-hub', 'external': False},
                {'label': 'Resources', 'href': '/resources', 'external': False},
            ],
            'Connect': [
                {'label': 'GitHub', 'href': 'https://github.com/Aman-0402', 'external': True},
                {'label': 'LinkedIn', 'href': 'https://www.linkedin.com/in/aman-raj-081905211/', 'external': True},
                {'label': 'Twitter/X', 'href': 'https://x.com/Code_Like_Aman', 'external': True},
                {'label': 'Email', 'href': 'mailto:think.like.ai.aman@gmail.com', 'external': False},
            ],
        }

        total_links = 0
        for section_order, (section_title, links) in enumerate(sections_data.items(), 1):
            section = FooterSection.objects.create(title=section_title, order=section_order)
            for link_order, link_data in enumerate(links, 1):
                FooterLink.objects.create(
                    section=section,
                    order=link_order,
                    **link_data
                )
                total_links += 1

        self.stdout.write(self.style.SUCCESS(f'[OK] Created {len(sections_data)} footer sections with {total_links} links'))

        # ──────────────────────────────────────────────────────────────────────
        # Social Links
        # ──────────────────────────────────────────────────────────────────────
        SocialLink.objects.all().delete()
        social_links = [
            {'platform': 'GitHub', 'url': 'https://github.com/Aman-0402', 'icon_name': 'Github', 'order': 1},
            {'platform': 'LinkedIn', 'url': 'https://www.linkedin.com/in/aman-raj-081905211/', 'icon_name': 'Linkedin', 'order': 2},
            {'platform': 'Twitter', 'url': 'https://x.com/Code_Like_Aman', 'icon_name': 'Twitter', 'order': 3},
            {'platform': 'YouTube', 'url': 'https://www.youtube.com/@Think_Like_Me', 'icon_name': 'Youtube', 'order': 4},
            {'platform': 'Email', 'url': 'mailto:think.like.ai.aman@gmail.com', 'icon_name': 'Mail', 'order': 5},
        ]
        for link_data in social_links:
            SocialLink.objects.create(**link_data)
        self.stdout.write(self.style.SUCCESS(f'[OK] Created {len(social_links)} social links'))

        # ──────────────────────────────────────────────────────────────────────
        # Footer CTA
        # ──────────────────────────────────────────────────────────────────────
        FooterCTA.objects.all().delete()
        cta = FooterCTA.objects.create(
            badge_text='Open to opportunities',
            heading="Let's build something amazing together",
            button_text='Get in touch',
            button_url='/contact',
        )
        self.stdout.write(self.style.SUCCESS('[OK] Created footer CTA'))

        self.stdout.write(self.style.SUCCESS('\n[SUCCESS] Navbar and footer data seeded successfully!'))
