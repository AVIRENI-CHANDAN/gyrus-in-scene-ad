"""
This module defines custom exceptions for the application.
"""


class AuthError(Exception):
    """
    Custom exception class to handle authentication-related errors.

    Attributes:
    -----------
    message : str
        A human-readable message describing the error.
    status_code : int
        HTTP status code associated with the error.

    Methods:
    --------
    __init__(self, message, status_code)
        Initializes an AuthError instance with the provided message and status code.
    """

    def __init__(self, message, status_code):
        """
        Parameters:
        -----------
        message : str
            A human-readable message describing the error.
        status_code : int
            HTTP status code associated with the error.
        """
        self.status_code = status_code
        super().__init__(message)
