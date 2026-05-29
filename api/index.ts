import app from '../src/app';
import { DemoRetailLocationRepository } from '../src/modules/retail/repository/DemoRetailLocationRepository';
import { retailLocationStore } from '../src/modules/retail/service/InMemoryRetailLocationStore';
import { initializeRetailLocationStore } from '../src/modules/retail/service/retailStoreInitializer';

const ready = initializeRetailLocationStore(new DemoRetailLocationRepository(), retailLocationStore);

export default async function handler(req: any, res: any) {
    await ready;
    return app(req, res);
}
