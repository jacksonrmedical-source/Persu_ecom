import requests
from app.core.config import settings


def send_new_order_email(order: dict, order_items: list[dict]):
    """Emails the admin when an order is confirmed paid.
    Failure here should never break checkout — always call this in a try/except.
    """
    if not settings.RESEND_API_KEY or not settings.ADMIN_NOTIFY_EMAIL:
        return  # notifications not configured yet — silently skip

    items_html = "".join(
        f"<li>{item['title_snapshot']} × {item['quantity']} — ₹{item['price_snapshot']}</li>"
        for item in order_items
    )

    html = f"""
    <h2>New order on PERZN</h2>
    <p><strong>Order ID:</strong> {order['id']}</p>
    <p><strong>Total:</strong> ₹{order['total']}</p>
    <ul>{items_html}</ul>
    <p>Check the Supabase dashboard for full order and shipping details.</p>
    """

    requests.post(
        "https://api.resend.com/emails",
        headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
        json={
            "from": "PERZN Orders <onboarding@resend.dev>",
            "to": [settings.ADMIN_NOTIFY_EMAIL],
            "subject": f"New order — ₹{order['total']}",
            "html": html,
        },
        timeout=10,
    )


def send_order_confirmation_email(customer_email: str, order: dict, order_items: list[dict]):
    """Emails the customer a receipt once their order is confirmed paid.
    Failure here should never break checkout — always call this in a try/except.

    IMPORTANT: Resend's free/unverified sender (onboarding@resend.dev) can only
    deliver to the email address you signed up to Resend with — it can't send
    to arbitrary customer inboxes. To actually send real customer emails,
    verify your own domain in the Resend dashboard and change the "from"
    address below to something on that domain.
    """
    if not settings.RESEND_API_KEY or not customer_email:
        return

    items_html = "".join(
        f"<li>{item['title_snapshot']} × {item['quantity']} — ₹{item['price_snapshot']}</li>"
        for item in order_items
    )

    html = f"""
    <h2>Thanks for your order!</h2>
    <p>Your PERZN order is confirmed.</p>
    <p><strong>Order ID:</strong> {order['id']}</p>
    <p><strong>Total:</strong> ₹{order['total']}</p>
    <ul>{items_html}</ul>
    <p>We'll email you again once it ships.</p>
    """

    requests.post(
        "https://api.resend.com/emails",
        headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
        json={
            "from": "PERZN Orders <onboarding@resend.dev>",
            "to": [customer_email],
            "subject": "Your PERZN order is confirmed",
            "html": html,
        },
        timeout=10,
    )
