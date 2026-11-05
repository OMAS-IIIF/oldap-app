"""Read-only administration contract probe, executed inside the home API container.

Uses existing bootstrap credentials without printing them. Reports response shapes
only; never changes data, permissions, sessions or deployment configuration.
"""
import json
import os
import requests
from oldap_api.backend import create_connection

con = create_connection(userId=os.environ['OLDAP_AUTH_ADMIN_USER'],
                        credentials=os.environ['OLDAP_AUTH_ADMIN_PASSWORD'])
session = requests.Session()
session.headers['Authorization'] = 'Bearer ' + con.token
checks = []
for path, params in [
    ('/admin/project/search', {}),
    ('/admin/user/search', {}),
    ('/admin/role/search', {}),
    ('/admin/hlist/search', {'project': 'chama'}),
    *[(f'/admin/datamodel/{project}', {}) for project in ('shared', 'chama', 'fasnacht')],
    ('/data/ofclass/chama', {'resClass': 'oldap:Thing', 'includeProperties[]': 'schema:name', 'limit': 2}),
    ('/data/ofclass/chama', {'resClass': 'oldap:Thing', 'countOnly': 'true'}),
    ('/data/textsearch/chama', {'searchString': 'Chama', 'limit': 2}),
    ('/data/textsearch/chama', {'searchString': 'Chama', 'countOnly': 'true'}),
]:
    response = session.get('http://127.0.0.1:8000' + path, params=params, timeout=90)
    data = response.json()
    entry = {'path': path, 'params': params, 'status': response.status_code,
             'shape': type(data).__name__}
    if isinstance(data, list):
        entry['length'] = len(data)
        if data and isinstance(data[0], dict):
            entry['first_item_fields'] = {k: type(v).__name__ for k, v in data[0].items()}
    elif isinstance(data, dict):
        entry['fields'] = list(data)
    checks.append(entry)
passed = all(check['status'] == 200 for check in checks)
print(json.dumps({'backend': type(con).__name__, 'passed': passed, 'checks': checks}, indent=2))
raise SystemExit(0 if passed else 1)
