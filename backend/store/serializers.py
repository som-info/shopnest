"""DRF serializers for the store API."""
from decimal import Decimal

from django.db import transaction
from rest_framework import serializers

from .models import Category, Order, OrderItem, Product


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "product_count"]


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = [
            "id", "name", "slug", "description", "price",
            "image_url", "stock", "in_stock", "category", "created_at",
        ]


class OrderItemInputSerializer(serializers.Serializer):
    """A single cart line submitted at checkout."""

    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, max_value=99)


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = OrderItem
        fields = ["product", "product_name", "quantity", "unit_price"]


class OrderSerializer(serializers.ModelSerializer):
    """
    Creates an order from customer details + cart items.

    Prices are always looked up server-side so the client can't tamper with them,
    and stock is decremented atomically inside a transaction.
    """

    items = OrderItemInputSerializer(many=True, write_only=True)
    lines = OrderItemSerializer(source="items", many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "full_name", "email", "address", "city", "postal_code",
            "items", "lines", "total", "status", "created_at",
        ]
        read_only_fields = ["id", "total", "status", "created_at"]

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError("Your cart is empty.")

        ids = [item["product_id"] for item in items]
        products = Product.objects.in_bulk(ids)
        for item in items:
            product = products.get(item["product_id"])
            if product is None or not product.is_active:
                raise serializers.ValidationError(f"Product {item['product_id']} is not available.")
            if product.stock < item["quantity"]:
                raise serializers.ValidationError(f"Not enough stock for “{product.name}”.")
            item["product"] = product
        return items

    @transaction.atomic
    def create(self, validated_data):
        items = validated_data.pop("items")
        order = Order.objects.create(**validated_data)
        total = Decimal("0.00")

        for item in items:
            # Re-fetch with a row lock to avoid overselling under concurrency.
            product = Product.objects.select_for_update().get(pk=item["product"].pk)
            OrderItem.objects.create(
                order=order, product=product, quantity=item["quantity"], unit_price=product.price
            )
            product.stock -= item["quantity"]
            product.save(update_fields=["stock"])
            total += product.price * item["quantity"]

        order.total = total
        order.save(update_fields=["total"])
        return order
