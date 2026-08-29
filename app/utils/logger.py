import logging
import sys
from app.core.settings import settings

# Configure logging
log_format = "[%(asctime)s] %(levelname)s %(name)s — %(message)s"
log_level = logging.DEBUG if settings.APP_ENV == "development" else logging.INFO

logging.basicConfig(
    level=log_level,
    format=log_format,
    stream=sys.stdout,
)

logger = logging.getLogger("verticalgate")
ai_logger = logging.getLogger("verticalgate.ai")
auth_logger = logging.getLogger("verticalgate.auth")
