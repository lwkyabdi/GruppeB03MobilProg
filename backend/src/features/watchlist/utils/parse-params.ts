export type Params = Record<string, string | undefined>;

export function parseParams(request: Request): Params {
    const entries = [...new URL(request.url).searchParams].filter(
        ([, value]) => value !== "",
    );
    return Object.fromEntries(entries);
}
