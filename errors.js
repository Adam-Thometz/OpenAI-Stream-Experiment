export class GeneralError extends Error {
  constructor(message, status) {
    super();
    this.message = message;
    this.status = status;
  };
};

// 400 Bad Request error
export class BadRequestError extends GeneralError {
  constructor(message = "400 - Bad Request") {
    super(message, 400);
  };
};

// 401 Unauthorized error
export class UnauthorizedError extends GeneralError {
  constructor(message = "401 - Unauthorized") {
    super(message, 401);
  };
};

// 403 Forbidden error
export class ForbiddenError extends GeneralError {
  constructor(message = "403 - Forbidden request") {
    super(message, 403);
  };
};

// 404 Forbidden error
export class NotFoundError extends GeneralError {
  constructor(message = "404 - Not found!") {
    super(message, 404);
  };
};