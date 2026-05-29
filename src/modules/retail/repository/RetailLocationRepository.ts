import { RawRetailLocationDoc } from '../contracts/RetailContracts';

export interface RetailLocationRepository {
    fetchAll(): Promise<RawRetailLocationDoc[]>;
}
