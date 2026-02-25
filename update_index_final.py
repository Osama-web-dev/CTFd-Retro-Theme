from CTFd import create_app
from CTFd.models import Pages, db

app = create_app()
with app.app_context():
    page = Pages.query.filter_by(route='index').first()
    if page:
        # Simplified HTML without the <style> block
        hero_html = (
            '<section class="episode-zero-hero">'
            '<div class="hero-inner">'
            '<h1 class="ez-title">EPISODE ZERO</h1>'
            '<h2 class="ez-subtitle">Capture the Flag</h2>'
            '<p class="ez-tagline">&ldquo;Rewrite the story from the beginning.&rdquo;</p>'
            '<div class="ez-divider"></div>'
            '<div class="ez-content">'
            '<p>Every universe begins with a version that was erased.<br>A timeline before the collapse. A memory that should not exist.</p>'
            '<p>Welcome to Episode Zero &mdash; where narratives glitch, realities fork, and the origin story is still writable.</p>'
            '<p>Inspired by time-loop paradoxes, fractured identities, cyberpunk rebellions, psychological thrillers, and alternate realities &mdash; every challenge is a fragment of a corrupted story.</p>'
            '<p>Web. Crypto. Pwn. Forensics. OSINT.<br>Each flag rewrites the timeline.</p>'
            '<p class="ez-final-line">The story has already been written.<br>You are here to break it.</p>'
            '</div>'
            '<div class="ez-cta">'
            '<a href="/challenges" class="ez-button">Enter Episode</a>'
            '<a href="/register" class="ez-button ez-button-ghost">Register</a>'
            '</div>'
            '</div>'
            '</section>'
        )
        page.content = hero_html
        db.session.commit()
        print('SUCCESS: Database index page updated (styles removed)')
    else:
        print('INFO: No index page found in DB')
