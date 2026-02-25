import urllib.request
import sys

print("Checking internal CTFd response...")
try:
    with urllib.request.urlopen('http://localhost:8000/') as response:
        html = response.read().decode('utf-8')
        print(f"HTML Length: {len(html)}")
        print(f"Stargaze Marker Found: {'STARGAZE_PAGE_TEMPLATE_ACTIVE' in html}")
        print(f"Episode Zero Found: {'EPISODE ZERO' in html}")
        print(f"Old Text Found: {'A cool CTF platform' in html}")
        
        if 'STARGAZE_PAGE_TEMPLATE_ACTIVE' not in html:
            print("WARNING: Theme template 'page.html' NOT found in response!")
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
