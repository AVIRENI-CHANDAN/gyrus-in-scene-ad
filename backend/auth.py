"""
This module handles user authentication using AWS Cognito.
"""

from functools import wraps
from http import HTTPStatus

import boto3
import jwt
import requests
from flask import jsonify, request

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
    aws_region = extract_environment_variable("AWS_REGION")
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


def register_user_with_permanent_password(username, password, user_attributes):
    """Register a user with a permanent password.
    Args:
    username (str): The user name of the user to register.
    password (str): The password of the user.
    user_attributes (dict): The attributes of the user to register.
    Returns:
    dict: The registration result containing tokens if successful.
    Raises:
    AuthError: If the user already exists or if credentials are invalid.
    """
    aws_region = extract_environment_variable("AWS_REGION")
    client_id = extract_environment_variable("CLIENT_ID")
    cognito_client = boto3.client("cognito-idp", region_name=aws_region)
    return cognito_client.sign_up(
        ClientId=client_id,
        Username=username,
        Password=password,
        UserAttributes=user_attributes,
        ValidationData=[],
    )


def confirm_user_account(username):
    aws_region = extract_environment_variable("AWS_REGION")
    # Initialize the Cognito client
    cognito_client = boto3.client(
        "cognito-idp", region_name=aws_region
    )  # Specify your AWS region

    try:
        # Confirm the user account
        response = cognito_client.admin_confirm_sign_up(
            UserPoolId=extract_environment_variable("USER_POOL_ID"),
            Username=username,
        )
        print(f"User '{username}' has been confirmed successfully.")
        return response

    except cognito_client.exceptions.UserNotFoundException:
        print(f"User '{username}' not found in the user pool.")
    except Exception as e:
        print("An error occurred during user confirmation:", e)


def add_preferred_username(username, preferred_username_value):
    aws_region = extract_environment_variable("AWS_REGION")
    # Initialize the Cognito client
    cognito_client = boto3.client(
        "cognito-idp", region_name=aws_region
    )  # Specify your AWS region

    try:
        # Add preferred_username attribute to the user
        response = cognito_client.admin_update_user_attributes(
            UserPoolId=extract_environment_variable("USER_POOL_ID"),
            Username=username,
            UserAttributes=[
                {"Name": "preferred_username", "Value": preferred_username_value}
            ],
        )
        print(
            f"Preferred username '{preferred_username_value}' has been added for user '{username}'."
        )
        return response

    except cognito_client.exceptions.UserNotFoundException:
        print(f"User '{username}' not found in the user pool.")
    except Exception as e:
        print("An error occurred while adding preferred_username:", e)


# Function to get Cognito public keys (JWKs)
def get_cognito_public_keys():
    aws_region = extract_environment_variable("AWS_REGION")
    user_pool_id = extract_environment_variable("USER_POOL_ID")
    cognito_domain = f"https://cognito-idp.{aws_region}.amazonaws.com"
    cognito_jwks_url = f"{cognito_domain}/{user_pool_id}/.well-known/jwks.json"

    # Pass the URL to the PyJWKClient
    return jwt.PyJWKClient(cognito_jwks_url)


def cognito_token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        client_id = extract_environment_variable("CLIENT_ID")
        jwks_client = get_cognito_public_keys()
        auth_header = request.headers.get("Authorization")
        ALGORITHMS = ["RS256"]
        if not auth_header or not auth_header.startswith("Bearer "):
            return (
                jsonify({"error": "Authorization token is missing or malformed"}),
                401,
            )

        token = auth_header.split(" ")[1]  # Extract the token
        try:
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            decoded_token = jwt.decode(
                token,
                signing_key.key,
                algorithms=ALGORITHMS,
                # Remove the 'audience' parameter if the token does not include the 'aud' claim
            )
            request.user = decoded_token[
                "sub"
            ]  # Attach user identity to request if needed
        except jwt.ExpiredSignatureError:
            print("Expired token")
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidAudienceError:
            print("Invalid audience")
            return jsonify({"error": "Invalid audience in token"}), 401
        except jwt.InvalidTokenError as e:
            print(f"Invalid token details: {e}")
            return jsonify({"error": f"Invalid token: {str(e)}"}), 401

        return f(*args, **kwargs)

    return decorated_function
