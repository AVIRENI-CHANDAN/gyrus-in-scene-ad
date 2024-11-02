"""
This module handles user authentication using AWS Cognito.
"""

from http import HTTPStatus

import boto3

from .environ import extract_environment_variable
from .exceptions import AuthError


def authenticate_user(username, password):
    """Authenticate a user using AWS Cognito.

    Args:
        username (str): The username of the user to authenticate.
        password (str): The password of the user.

    Returns:
        dict: The authentication result containing tokens if successful.

    Raises:
        AuthError: If the user requires a new password or if credentials are invalid.
    """
    aws_region = extract_environment_variable(
        "AWS_REGION"
    )  # Replace with your AWS region
    client_id = extract_environment_variable("CLIENT_ID")
    cognito_client = boto3.client("cognito-idp", region_name=aws_region)
    try:
        response = cognito_client.initiate_auth(
            ClientId=client_id,
            AuthFlow="USER_PASSWORD_AUTH",
            AuthParameters={"USERNAME": username, "PASSWORD": password},
        )
        if "ChallengeName" in response:
            raise AuthError("New password required", HTTPStatus.FORBIDDEN)
        return response["AuthenticationResult"]
    except cognito_client.exceptions.NotAuthorizedException as e:
        raise AuthError("Invalid credentials", HTTPStatus.UNAUTHORIZED) from e
