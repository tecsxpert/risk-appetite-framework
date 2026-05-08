# conftest.py — pytest configuration
# Tool-04 | Risk Appetite Framework | ai-service/tests/
#
# Makes the ai-service/ root importable from inside tests/ so that:
#   from sanitisation import ...
#   from rate_limiter import ...
# work correctly when pytest is run from either ai-service/ or ai-service/tests/.

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
