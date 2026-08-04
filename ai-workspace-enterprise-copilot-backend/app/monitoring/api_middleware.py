from __future__ import annotations

from collections.abc import Awaitable, Callable
from time import perf_counter

import jwt
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from app.auth.jwt import decode_access_token
from app.database import SessionLocal
from app.models.api_usage import APIUsage


EXCLUDED_PATHS = {
    "/docs",
    "/redoc",
    "/openapi.json",
    "/favicon.ico",
}


class APIUsageMiddleware(BaseHTTPMiddleware):
    """
    Track API method, endpoint, status code and response time.

    Monitoring failures never interrupt the original API request.
    """

    def __init__(
        self,
        app: ASGIApp,
    ) -> None:
        super().__init__(app)

    async def dispatch(
        self,
        request: Request,
        call_next: Callable[
            [Request],
            Awaitable[Response],
        ],
    ) -> Response:
        started_at = perf_counter()

        response: Response | None = None
        error_type: str | None = None
        status_code = 500

        try:
            response = await call_next(request)
            status_code = response.status_code
            return response

        except Exception as error:
            error_type = type(error).__name__
            raise

        finally:
            elapsed_ms = (
                perf_counter() - started_at
            ) * 1000

            if self.should_record(request):
                self.record_usage_safely(
                    request=request,
                    status_code=status_code,
                    response_time_ms=elapsed_ms,
                    error_type=error_type,
                )

    def should_record(
        self,
        request: Request,
    ) -> bool:
        path = request.url.path

        if path in EXCLUDED_PATHS:
            return False

        if path.startswith("/docs"):
            return False

        if path.startswith("/redoc"):
            return False

        if request.method.upper() == "OPTIONS":
            return False

        return True

    def get_user_id(
        self,
        request: Request,
    ) -> int | None:
        authorization = request.headers.get(
            "Authorization"
        )

        if not authorization:
            return None

        scheme, _, token = authorization.partition(" ")

        if scheme.lower() != "bearer" or not token:
            return None

        try:
            payload = decode_access_token(token)

            subject = payload.get("sub")

            if subject is None:
                return None

            return int(subject)

        except (
            jwt.InvalidTokenError,
            ValueError,
            TypeError,
        ):
            return None

    def normalize_endpoint(
        self,
        request: Request,
    ) -> str:
        """
        Prefer the route template instead of raw IDs.

        Example:
        /api/users/15 becomes /api/users/{user_id}
        """
        route = request.scope.get("route")

        route_path = getattr(
            route,
            "path",
            None,
        )

        if route_path:
            return str(route_path)

        return request.url.path

    def record_usage_safely(
        self,
        request: Request,
        status_code: int,
        response_time_ms: float,
        error_type: str | None,
    ) -> None:
        try:
            endpoint = self.normalize_endpoint(
                request
            )

            user_id = self.get_user_id(
                request
            )

            with SessionLocal() as db:
                usage = APIUsage(
                    user_id=user_id,
                    endpoint=endpoint,
                    method=request.method.upper(),
                    status_code=status_code,
                    response_time_ms=response_time_ms,
                    error_type=error_type,
                )

                db.add(usage)
                db.commit()

        except Exception:
            # Monitoring must never break the application.
            return