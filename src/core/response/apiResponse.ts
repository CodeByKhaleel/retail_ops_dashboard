export const successResponse = <T>(data: T): { success: true; data: T } => {
    return { success: true, data };
};

export const errorResponse = (message: string): { success: false; message: string } => {
    return { success: false, message };
};
