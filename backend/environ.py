"""
This module contains utility functions for extracting environment variables.
"""

import os

from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


def extract_environment_variable(variable_name, default_val=None):
    """Extract the value of an environment variable.

    Args:
        variable_name (str): The name of the environment variable to extract.
        default_val (Any, optional): The default value to return if the environment variable is
        not set. Defaults to None.

    Returns:
        str: The value of the environment variable if it is set.

    Raises:
        ValueError: If the environment variable is not set and no default value is provided.
    """
    if variable_value := os.getenv(variable_name, default_val):
        return variable_value
    raise ValueError(f"Environment variable {variable_name} is not set")
