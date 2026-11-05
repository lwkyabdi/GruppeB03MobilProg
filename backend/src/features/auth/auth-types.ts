export type SessionUser = {
    id: string;
    email: string;
    name: string;
};

export function toSessionUser(user: {
    id: string;
    email: string;
    name: string;
}): SessionUser {
    return { id: user.id, email: user.email, name: user.name};
}
