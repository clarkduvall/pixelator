# From: https://github.com/dsissitka/khan-website/blob/master/templatefilters.py

_base_js_escapes = (
    ('\\', r'\u005C'),
    ('\'', r'\u0027'),
    ('"', r'\u0022'),
    ('>', r'\u003E'),
    ('<', r'\u003C'),
    ('&', r'\u0026'),
    ('=', r'\u003D'),
    ('-', r'\u002D'),
    (';', r'\u003B'),
    (u'\u2028', r'\u2028'),
    (u'\u2029', r'\u2029')
)

# Escape every ASCII character with a value less than 32.
_js_escapes = (_base_js_escapes +
               tuple([('%c' % z, '\\u%04X' % z) for z in range(32)]))

# escapejs from Django: https://www.djangoproject.com/
def escapejs(value):
    """Hex encodes characters for use in JavaScript strings."""
    if not isinstance(value, basestring):
        value = str(value)

    for bad, good in _js_escapes:
        value = value.replace(bad, good)

    return value
