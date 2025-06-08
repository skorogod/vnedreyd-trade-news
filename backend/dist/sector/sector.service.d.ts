import { Repository } from 'typeorm';
import { Sector } from './entities/sector.entity';
export declare class SectorService {
    private sectorRepository;
    constructor(sectorRepository: Repository<Sector>);
    findAll(): Promise<Sector[]>;
    findById(id: number): Promise<Sector | null>;
    findByIds(ids: number[]): Promise<Sector[]>;
    getSectorNamesMap(): Promise<Map<number, string>>;
}
