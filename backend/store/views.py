"""API views for products, categories and orders."""
from django.db.models import Count, Q
from rest_framework import generics, viewsets

from .models import Category, Order, Product
from .serializers import CategorySerializer, OrderSerializer, ProductSerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """GET /api/categories/ – all categories with active product counts."""

    serializer_class = CategorySerializer
    pagination_class = None

    def get_queryset(self):
        return Category.objects.annotate(
            product_count=Count("products", filter=Q(products__is_active=True))
        )


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/products/            – list products
        ?category=<slug>          – filter by category
        ?search=<text>            – search name and description
        ?ordering=price|-price|name
    GET /api/products/<slug>/     – product detail
    """

    serializer_class = ProductSerializer
    lookup_field = "slug"
    pagination_class = None
    ALLOWED_ORDERING = {"price", "-price", "name", "-name", "created_at", "-created_at"}

    def get_queryset(self):
        qs = Product.objects.filter(is_active=True).select_related("category")
        params = self.request.query_params

        category = params.get("category")
        if category:
            qs = qs.filter(category__slug=category)

        search = params.get("search", "").strip()
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(description__icontains=search))

        ordering = params.get("ordering")
        if ordering in self.ALLOWED_ORDERING:
            qs = qs.order_by(ordering)
        return qs


class OrderCreateView(generics.CreateAPIView):
    """POST /api/orders/ – place an order from the checkout form."""

    queryset = Order.objects.all()
    serializer_class = OrderSerializer
