from CTFd import create_app
from CTFd.utils import get_config
from CTFd.models import db, Pages
from CTFd.cache import cache

app = create_app()
with app.app_context():
    # 1. Check Setup
    setup_status = get_config("setup")
    print(f"CTFd Setup Status: {setup_status}")

    # 2. Check Theme
    current_theme = get_config("ctf_theme")
    print(f"Current Theme: {current_theme}")

    # 3. Check Pages
    index_page = Pages.query.filter_by(route='index').first()
    if index_page:
        print(f"Index Page ID: {index_page.id}")
        print(f"Index Page Content (first 50 chars): {index_page.content[:50]}...")
    else:
        print("No index page found in database.")

    # 4. Clear Cache
    cache.clear()
    print("CTFd Cache cleared successfully.")
