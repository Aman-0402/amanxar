from django.core.management.base import BaseCommand
from portfolio.models import KnowledgeHubCategory, KnowledgeTool


class Command(BaseCommand):
    help = 'Seed knowledge hub data (categories and tools)'

    def handle(self, *args, **options):
        data = {
            "categories": [
                {
                    "id": "ai-llm-tools",
                    "label": "AI & LLM Tools",
                    "description": "Local and cloud-based AI models, LLM runners, and AI chat platforms for building private AI tools.",
                    "icon_name": "Brain",
                    "color": "#6366F1",
                    "tools": [
                        {
                            "id": "ai-001",
                            "name": "Ollama",
                            "description": "Local LLM runner. Run AI models like Llama and Mistral on your own machine for private AI tools.",
                            "url": "https://ollama.ai",
                            "emoji": "🤖",
                            "tags": ["LLM", "Local", "Private", "Open Source"],
                            "pricing": "free",
                            "rating": 5,
                            "featured": True,
                        },
                        {
                            "id": "ai-002",
                            "name": "Yupp.ai",
                            "description": "Compare multiple AI models side-by-side and earn rewards for providing feedback on AI responses.",
                            "url": "https://yupp.ai",
                            "emoji": "⚖️",
                            "tags": ["Comparison", "AI Models", "Rewards", "Testing"],
                            "pricing": "freemium",
                            "rating": 4,
                            "featured": False,
                        },
                        {
                            "id": "ai-003",
                            "name": "Uncensored.ai",
                            "description": "AI chat platform with minimal content filtering for unrestricted conversations and experimentation.",
                            "url": "https://uncensored.ai",
                            "emoji": "🔓",
                            "tags": ["Chat", "Unfiltered", "Experimental", "Open"],
                            "pricing": "freemium",
                            "rating": 3,
                            "featured": False,
                        },
                        {
                            "id": "ai-004",
                            "name": "Pomelli (Google Labs)",
                            "description": "AI marketing assistant that generates brand-based marketing content and copywriting.",
                            "url": "https://pomelli.ai",
                            "emoji": "📢",
                            "tags": ["Marketing", "Copywriting", "Content", "Brand"],
                            "pricing": "freemium",
                            "rating": 4,
                            "featured": False,
                        },
                        {
                            "id": "ai-005",
                            "name": "Kling",
                            "description": "Advanced AI text-to-video generator capable of creating cinematic-style videos from text prompts.",
                            "url": "https://kling.ai",
                            "emoji": "🎬",
                            "tags": ["Video", "AI Video", "Generative", "Cinematic"],
                            "pricing": "freemium",
                            "rating": 5,
                            "featured": True,
                        },
                        {
                            "id": "ai-006",
                            "name": "Higgsfield",
                            "description": "AI video generation platform focused on creating realistic human visuals and character animations.",
                            "url": "https://higgsfield.ai",
                            "emoji": "👥",
                            "tags": ["Video", "Humanoid", "Animation", "AI"],
                            "pricing": "freemium",
                            "rating": 4,
                            "featured": False,
                        }
                    ]
                },
                {
                    "id": "ai-video-creative",
                    "label": "AI / Video / Creative Assets",
                    "description": "Stock libraries, animation tools, and asset platforms for VFX, video, motion graphics, and creative projects.",
                    "icon_name": "Zap",
                    "color": "#EC4899",
                    "tools": [
                        {
                            "id": "av-001",
                            "name": "ProductionCrate",
                            "description": "Huge library of VFX, sound effects, 3D assets, and motion graphics templates for video production.",
                            "url": "https://productioncrate.com",
                            "emoji": "🎥",
                            "tags": ["VFX", "Assets", "Motion Graphics", "SFX"],
                            "pricing": "paid",
                            "rating": 5,
                            "featured": True,
                        },
                        {
                            "id": "av-002",
                            "name": "Animagraffs",
                            "description": "Interactive 3D mechanical explainers for engineering visualization and product demonstrations.",
                            "url": "https://animagraffs.com",
                            "emoji": "⚙️",
                            "tags": ["3D", "Animation", "Engineering", "Explainers"],
                            "pricing": "free",
                            "rating": 4,
                            "featured": False,
                        },
                        {
                            "id": "av-003",
                            "name": "LottieFiles",
                            "description": "Library and editor for lightweight animated UI using Lottie JSON format animations.",
                            "url": "https://lottiefiles.com",
                            "emoji": "✨",
                            "tags": ["Animation", "Lottie", "UI", "Interactive"],
                            "pricing": "freemium",
                            "rating": 5,
                            "featured": True,
                        },
                        {
                            "id": "av-004",
                            "name": "LottieFlow",
                            "description": "Free customizable Lottie animations. Perfect for Webflow, React, and web UI projects.",
                            "url": "https://lottieflow.com",
                            "emoji": "🎞️",
                            "tags": ["Animation", "Lottie", "Webflow", "UI"],
                            "pricing": "free",
                            "rating": 4,
                            "featured": False,
                        }
                    ]
                },
                {
                    "id": "design-ui-inspiration",
                    "label": "Design & UI Inspiration",
                    "description": "Landing page galleries, layout templates, UI components, and inspiration platforms for design reference.",
                    "icon_name": "Palette",
                    "color": "#22D3EE",
                    "tools": [
                        {
                            "id": "di-001",
                            "name": "Lapa Ninja",
                            "description": "Landing page inspiration gallery showcasing beautiful marketing sites and SaaS homepages.",
                            "url": "https://lapa.ninja",
                            "emoji": "🥷",
                            "tags": ["Landing Pages", "Inspiration", "Design", "SaaS"],
                            "pricing": "free",
                            "rating": 4,
                            "featured": True,
                        },
                        {
                            "id": "di-002",
                            "name": "UI Layouts",
                            "description": "Modern dashboard and SaaS layout inspiration for building professional admin interfaces.",
                            "url": "https://uilayouts.com",
                            "emoji": "📊",
                            "tags": ["Dashboard", "Layouts", "SaaS", "Admin"],
                            "pricing": "free",
                            "rating": 4,
                            "featured": False,
                        },
                        {
                            "id": "di-003",
                            "name": "Uiverse",
                            "description": "Open-source UI components library with copy-paste HTML/CSS/Tailwind code snippets.",
                            "url": "https://uiverse.io",
                            "emoji": "🌌",
                            "tags": ["Components", "Open Source", "HTML/CSS", "Tailwind"],
                            "pricing": "free",
                            "rating": 5,
                            "featured": True,
                        },
                        {
                            "id": "di-004",
                            "name": "IconScout",
                            "description": "Icons, illustrations, 3D assets, and Lottie animations marketplace with millions of resources.",
                            "url": "https://iconscout.com",
                            "emoji": "🎨",
                            "tags": ["Icons", "Illustrations", "3D Assets", "Marketplace"],
                            "pricing": "freemium",
                            "rating": 5,
                            "featured": False,
                        }
                    ]
                },
                {
                    "id": "developer-tools",
                    "label": "Developer Tools & Utilities",
                    "description": "Essential development utilities for prototyping, testing, documentation, and browser compatibility checking.",
                    "icon_name": "Code",
                    "color": "#10B981",
                    "tools": [
                        {
                            "id": "dv-001",
                            "name": "CodePen",
                            "description": "Online HTML/CSS/JS playground for creating, sharing, and collaborating on web projects.",
                            "url": "https://codepen.io",
                            "emoji": "🖊️",
                            "tags": ["IDE", "Prototyping", "Frontend", "Collaboration"],
                            "pricing": "freemium",
                            "rating": 5,
                            "featured": True,
                        },
                        {
                            "id": "dv-002",
                            "name": "DevDocs",
                            "description": "Offline documentation browser for quick access to programming language and framework docs.",
                            "url": "https://devdocs.io",
                            "emoji": "📚",
                            "tags": ["Documentation", "Offline", "Reference", "Tools"],
                            "pricing": "free",
                            "rating": 5,
                            "featured": False,
                        },
                        {
                            "id": "dv-003",
                            "name": "Can I Use",
                            "description": "Browser compatibility checker for CSS features, JavaScript APIs, and web standards.",
                            "url": "https://caniuse.com",
                            "emoji": "🌐",
                            "tags": ["Browser Support", "CSS", "JavaScript", "Standards"],
                            "pricing": "free",
                            "rating": 5,
                            "featured": True,
                        },
                        {
                            "id": "dv-004",
                            "name": "Wave Terminal (Waveterm)",
                            "description": "AI-powered modern terminal emulator with advanced features and productivity enhancements.",
                            "url": "https://waveterm.dev",
                            "emoji": "💻",
                            "tags": ["Terminal", "AI", "DevOps", "CLI"],
                            "pricing": "free",
                            "rating": 4,
                            "featured": False,
                        }
                    ]
                },
                {
                    "id": "frontend-3d",
                    "label": "Frontend / Animation / 3D",
                    "description": "JavaScript libraries for 3D graphics, advanced animations, and interactive web components.",
                    "icon_name": "Sparkles",
                    "color": "#F59E0B",
                    "tools": [
                        {
                            "id": "fe-001",
                            "name": "Three.js",
                            "description": "JavaScript 3D library for creating interactive 3D web graphics and immersive experiences.",
                            "url": "https://threejs.org",
                            "emoji": "🎰",
                            "tags": ["3D", "Graphics", "WebGL", "JavaScript"],
                            "pricing": "free",
                            "rating": 5,
                            "featured": True,
                        },
                        {
                            "id": "fe-002",
                            "name": "ReactBits",
                            "description": "Library of animated and interactive React UI components with smooth transitions.",
                            "url": "https://reactbits.dev",
                            "emoji": "⚛️",
                            "tags": ["React", "Animation", "Components", "UI"],
                            "pricing": "freemium",
                            "rating": 4,
                            "featured": False,
                        },
                        {
                            "id": "fe-003",
                            "name": "React Tilt Button",
                            "description": "React component that adds 3D tilt hover effects to UI elements for interactive designs.",
                            "url": "https://react-tilt.org",
                            "emoji": "🎲",
                            "tags": ["React", "Effect", "3D", "Interaction"],
                            "pricing": "free",
                            "rating": 4,
                            "featured": False,
                        },
                        {
                            "id": "fe-004",
                            "name": "CSS-Tricks",
                            "description": "Advanced CSS learning resource with tutorials, techniques, and best practices for modern CSS.",
                            "url": "https://css-tricks.com",
                            "emoji": "🎨",
                            "tags": ["CSS", "Learning", "Design", "Best Practices"],
                            "pricing": "free",
                            "rating": 5,
                            "featured": True,
                        }
                    ]
                },
                {
                    "id": "design-tools",
                    "label": "Design Tools",
                    "description": "Professional design and prototyping tools for UI/UX design, mockups, and visual effects.",
                    "icon_name": "Edit",
                    "color": "#EF4444",
                    "tools": [
                        {
                            "id": "dt-001",
                            "name": "Penpot",
                            "description": "Open-source UI/UX design and prototyping tool. Self-hosted Figma alternative.",
                            "url": "https://penpot.app",
                            "emoji": "🎯",
                            "tags": ["Design", "UI/UX", "Prototyping", "Open Source"],
                            "pricing": "free",
                            "rating": 4,
                            "featured": True,
                        },
                        {
                            "id": "dt-002",
                            "name": "Mockey.ai",
                            "description": "AI mockup generator that creates product design previews automatically from descriptions.",
                            "url": "https://mockey.ai",
                            "emoji": "📦",
                            "tags": ["Mockups", "AI", "Product Design", "Generators"],
                            "pricing": "freemium",
                            "rating": 4,
                            "featured": False,
                        },
                        {
                            "id": "dt-003",
                            "name": "EndlessTools",
                            "description": "3D and visual effect generator for creating stunning creative visuals and animations.",
                            "url": "https://endlesstools.io",
                            "emoji": "🌈",
                            "tags": ["3D", "VFX", "Creative", "Generative"],
                            "pricing": "freemium",
                            "rating": 4,
                            "featured": False,
                        }
                    ]
                },
                {
                    "id": "learning-platforms",
                    "label": "Learning Platforms",
                    "description": "Practical education and training courses for AI, machine learning, and advanced development skills.",
                    "icon_name": "BookOpen",
                    "color": "#8B5CF6",
                    "tools": [
                        {
                            "id": "lp-001",
                            "name": "fast.ai",
                            "description": "Practical deep learning course with hands-on AI training using modern tools and frameworks.",
                            "url": "https://fast.ai",
                            "emoji": "🚀",
                            "tags": ["AI", "Deep Learning", "Python", "Course"],
                            "pricing": "free",
                            "rating": 5,
                            "featured": True,
                        }
                    ]
                }
            ]
        }

        KnowledgeHubCategory.objects.all().delete()
        KnowledgeTool.objects.all().delete()

        count_tools = 0
        for cat_data in data['categories']:
            category = KnowledgeHubCategory.objects.create(
                id=cat_data['id'],
                label=cat_data['label'],
                description=cat_data['description'],
                icon_name=cat_data['icon_name'],
                color=cat_data['color']
            )

            for idx, tool_data in enumerate(cat_data['tools']):
                KnowledgeTool.objects.create(
                    id=tool_data['id'],
                    name=tool_data['name'],
                    description=tool_data['description'],
                    url=tool_data['url'],
                    emoji=tool_data.get('emoji', ''),
                    category=category,
                    tags=tool_data['tags'],
                    pricing=tool_data['pricing'],
                    rating=tool_data['rating'],
                    featured=tool_data['featured'],
                    order=idx
                )
                count_tools += 1

        self.stdout.write(self.style.SUCCESS(f'[SUCCESS] Seeded {len(data["categories"])} categories and {count_tools} tools'))
