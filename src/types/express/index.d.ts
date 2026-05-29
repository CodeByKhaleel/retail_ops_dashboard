declare global {
    namespace Fulfillment {
        interface Request {
            user?: {
                uid: string;
                email?: string;
                [key: string]: any;
            };
        }
    }
}

export { };
