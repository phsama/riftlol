import sys
import os
import traceback

# Vercel executes the function from the repository root (/var/task)
# We need to tell Python that "app" is in the same folder as this index.py file.
sys.path.insert(0, os.path.dirname(__file__))

try:
    from app.main import app
except Exception as e:
    exc_type, exc_value, exc_traceback = sys.exc_info()
    tb_str = ''.join(traceback.format_exception(exc_type, exc_value, exc_traceback))
    
    async def app(scope, receive, send):
        assert scope['type'] == 'http'
        await send({
            'type': 'http.response.start',
            'status': 500,
            'headers': [
                (b'content-type', b'text/plain'),
            ]
        })
        await send({
            'type': 'http.response.body',
            'body': f"CRASH ON BOOT:\n{tb_str}".encode('utf-8')
        })
