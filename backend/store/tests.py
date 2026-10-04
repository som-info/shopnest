"""API tests for the store app. Run with: python manage.py test"""
from decimal import Decimal

from django.core.management import call_command
from rest_framework.test import APITestCase

from .models import Order, Product


class StoreApiTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        call_command("seed_store", verbosity=0)

    def test_list_products(self):
        res = self.client.get("/api/products/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data), 12)

    def test_filter_by_category_and_search(self):
        res = self.client.get("/api/products/", {"category": "books"})
        self.assertTrue(all(p["category"]["slug"] == "books" for p in res.data))
        res = self.client.get("/api/products/", {"search": "keyboard"})
        self.assertEqual(len(res.data), 1)

    def test_product_detail(self):
        res = self.client.get("/api/products/atomic-habits/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["name"], "Atomic Habits")

    def test_create_order_uses_server_prices_and_decrements_stock(self):
        product = Product.objects.get(slug="atomic-habits")
        payload = {
            "full_name": "Jane Doe", "email": "jane@example.com",
            "address": "1 Main St", "city": "Springfield", "postal_code": "12345",
            "items": [{"product_id": product.id, "quantity": 2}],
        }
        res = self.client.post("/api/orders/", payload, format="json")
        self.assertEqual(res.status_code, 201, res.data)
        self.assertEqual(Decimal(res.data["total"]), product.price * 2)
        product.refresh_from_db()
        self.assertEqual(product.stock, 48)

    def test_order_rejects_out_of_stock(self):
        product = Product.objects.get(stock=0)
        payload = {
            "full_name": "Jane Doe", "email": "jane@example.com",
            "address": "1 Main St", "city": "Springfield", "postal_code": "12345",
            "items": [{"product_id": product.id, "quantity": 1}],
        }
        res = self.client.post("/api/orders/", payload, format="json")
        self.assertEqual(res.status_code, 400)
        self.assertEqual(Order.objects.count(), 0)
