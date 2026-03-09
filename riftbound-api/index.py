import sys
import os
import traceback

sys.path.insert(0, os.path.dirname(__file__))

try:
    from app.main import app as _app
    
    class ExceptionLoggingMiddleware:
        def __init__(self, app):
            self.app = app
            
        async def __call__(self, scope, receive, send):
            try:
                await self.app(scope, receive, send)
            except Exception as e:
                exc_type, exc_value, exc_traceback = sys.exc_info()
                tb_str = ''.join(traceback.format_exception(exc_type, exc_value, exc_traceback))
                
                if scope['type'] == 'http':
                    # Ignore headers already sent error, we just try to force our 500
                    try:
                        await send({
                            'type': 'http.response.start',
                            'status': 500,
                            'headers': [(b'content-type', b'text/plain'),]
                        })
                    except Exception:
                        pass
                    
                    try:
                        await send({
                            'type': 'http.response.body',
                            'body': f"CRASH DURING REQUEST:\n{tb_str}".encode('utf-8')
                        })
                    except Exception:
                        pass
                else:
                    raise

    app = ExceptionLoggingMiddleware(_app)

except Exception as e:
    exc_type, exc_value, exc_traceback = sys.exc_info()
    tb_str = ''.join(traceback.format_exception(exc_type, exc_value, exc_traceback))
    
    async def app(scope, receive, send):
        if scope['type'] == 'http':
            await send({
                'type': 'http.response.start',
                'status': 500,
                'headers': [(b'content-type', b'text/plain'),]
            })
            await send({
                'type': 'http.response.body',
                'body': f"CRASH ON BOOT:\n{tb_str}".encode('utf-8')
            })
