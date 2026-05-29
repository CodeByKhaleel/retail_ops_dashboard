export const paginateIds = (ids: Set<string>, page: number, pageSize: number): string[] => {
    if (page < 1 || pageSize <= 0) {
        return [];
    }

    const allIds = Array.from(ids);
    const start = (page - 1) * pageSize;
    if (start >= allIds.length) {
        return [];
    }

    return allIds.slice(start, start + pageSize);
};
