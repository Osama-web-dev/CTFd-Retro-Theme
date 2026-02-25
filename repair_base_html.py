import os

def fix_base_html():
    path = r'D:\CTFd\CTFd\themes\stargaze\templates\base.html'
    if not os.path.exists(path):
        print(f"Error: {path} not found")
        return

    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    new_lines = []
    skip = False
    found_marker = False
    
    # The block we want to insert
    script_block = [
        '\n',
        '  {{ Assets.js("assets/js/color_mode_switcher.js", type=None) }}\n',
        '\n',
        '  <script type="text/javascript">\n',
        '    window.init = {\n',
        '      \'urlRoot\': "{{ request.script_root }}",\n',
        '      \'csrfNonce\': "{{ Session.nonce }}",\n',
        '      \'userMode\': "{{ Configs.user_mode }}",\n',
        '      \'userId\': {{ Session.id }},\n',
        '      \'userName\': {{ User.name | tojson }},\n',
        '      \'userEmail\': {{ User.email | tojson }},\n',
        '      \'userVerified\': {{ User.verified | tojson }},\n',
        '      \'teamId\': {{ Team.id | tojson }},\n',
        '      \'teamName\': {{ Team.name | tojson }},\n',
        '      \'start\': {{ Configs.start | tojson }},\n',
        '      \'end\': {{ Configs.end | tojson }},\n',
        '      \'themeSettings\': {{ Configs.theme_settings | tojson }},\n',
        '      \'eventSounds\': [\n',
        '        "/themes/core/static/sounds/notification.webm",\n',
        '        "/themes/core/static/sounds/notification.mp3",\n',
        '      ],\n',
        '    }\n',
        '  </script>\n',
        '\n'
    ]

    for line in lines:
        if '{{ Plugins.styles }}' in line:
            new_lines.append(line)
            new_lines.extend(script_block)
            skip = True
            found_marker = True
            continue
        
        if '{% block theme_header %}' in line:
            skip = False
        
        if not skip:
            new_lines.append(line)

    if not found_marker:
        print("Error: Marker '{{ Plugins.styles }}' not found in file")
        return

    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print("Successfully restored script block in base.html")

if __name__ == "__main__":
    fix_base_html()
