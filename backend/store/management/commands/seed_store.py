"""
Populate the database with demo categories and products.

Usage:
    python manage.py seed_store           # create or update demo data
    python manage.py seed_store --reset   # wipe catalog first
"""
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from store.models import Category, Order, Product

CATEGORIES = ["Electronics", "Home & Kitchen", "Fashion", "Books"]

# (name, category, price, stock, description)
PRODUCTS = [
    ("Wireless Noise-Cancelling Headphones", "Electronics", "129.99", 25,
     "Over-ear headphones with active noise cancellation and 30-hour battery life."),
    ("Smart Fitness Watch", "Electronics", "89.00", 40,
     "Track steps, heart rate and sleep with a bright AMOLED display."),
    ("Portable Bluetooth Speaker", "Electronics", "49.50", 60,
     "Water-resistant speaker with deep bass and 12 hours of playtime."),
    ("Mechanical Keyboard", "Electronics", "74.90", 18,
     "Compact 75% layout with hot-swappable switches and RGB backlight."),
    ("Ceramic Pour-Over Coffee Set", "Home & Kitchen", "34.00", 30,
     "Hand-glazed dripper, carafe and two cups for the perfect morning brew."),
    ("Cast Iron Skillet 10\"", "Home & Kitchen", "29.99", 45,
     "Pre-seasoned skillet that goes from stovetop to oven to table."),
    ("Linen Throw Blanket", "Home & Kitchen", "42.00", 22,
     "Breathable stonewashed linen in a soft neutral tone."),
    ("Classic Denim Jacket", "Fashion", "65.00", 15,
     "Timeless medium-wash denim jacket with a relaxed fit."),
    ("Leather Minimalist Wallet", "Fashion", "24.95", 70,
     "Slim full-grain leather wallet that holds up to 8 cards."),
    ("Everyday Canvas Sneakers", "Fashion", "54.00", 0,
     "Lightweight canvas sneakers with a cushioned insole."),
    ("The Pragmatic Programmer", "Books", "39.99", 35,
     "A classic guide to becoming a better, more effective developer."),
    ("Atomic Habits", "Books", "18.50", 50,
     "Tiny changes, remarkable results – a proven framework for building good habits."),
]


class Command(BaseCommand):
    help = "Seed the store with demo categories and products."

    def add_arguments(self, parser):
        parser.add_argument("--reset", action="store_true", help="Delete existing catalog data first.")

    @transaction.atomic
    def handle(self, *args, **options):
        if options["reset"]:
            Order.objects.all().delete()
            Product.objects.all().delete()
            Category.objects.all().delete()
            self.stdout.write("Cleared existing catalog and orders.")

        categories = {}
        for name in CATEGORIES:
            categories[name], _ = Category.objects.get_or_create(
                slug=slugify(name), defaults={"name": name}
            )

        for name, category, price, stock, description in PRODUCTS:
            slug = slugify(name)
            Product.objects.update_or_create(
                slug=slug,
                defaults={
                    "name": name,
                    "category": categories[category],
                    "price": Decimal(price),
                    "stock": stock,
                    "description": description,
                    # Deterministic placeholder image per product.
                    "image_url": f"https://picsum.photos/seed/{slug}/600/450",
                    "is_active": True,
                },
            )

        self.stdout.write(self.style.SUCCESS(
            f"Seeded {len(CATEGORIES)} categories and {len(PRODUCTS)} products."
        ))
