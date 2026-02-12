"""
Logger configuration
"""
import logging
import sys

def setup_logger(name: str) -> logging.Logger:
    """
    Setup logger with console handler
    
    Args:
        name: Logger name
        
    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    
    # Console handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(logging.INFO)
    
    # Formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    handler.setFormatter(formatter)
    
    # Add handler
    if not logger.handlers:
        logger.addHandler(handler)
    
    return logger
