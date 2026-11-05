import { Errors, type ErrorCode, type Result } from "./result";

const STATUS_BY_CODE: Record<ErrorCode, number> = {
    [Errors.BAD_REQUEST]: 400,
    [Errors.UNAUTHORIZED]: 401,
    [Errors.FORBIDDEN]: 403,
    [Errors.NOT_FOUND]: 404,
    [Errors.CONFLICT]: 409,
    [Errors.BAD_GATEWAY]: 502,
    [Errors.INTERNAL_SERVER_ERROR]: 500,
};

export function statusFromCode(code: ErrorCode): number {
    return STATUS_BY_CODE[code];
}

export function jsonResult<T>(result: Result<T>, successStatus: number = 200): Response {
   return Response.json(result, {
        status: result.ok ? successStatus : statusFromCode(result.error.code),
    });
}
