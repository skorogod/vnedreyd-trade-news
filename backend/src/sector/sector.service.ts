import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Sector } from './entities/sector.entity';
@Injectable()
export class SectorService {
  constructor(
    @InjectRepository(Sector)
    private sectorRepository: Repository<Sector>,
  ) {}

  async findAll(): Promise<Sector[]> {
    return this.sectorRepository.find({
      order: { name: 'ASC' }
    });
  }

  async findById(id: number): Promise<Sector | null> {
    return this.sectorRepository.findOne({ where: { id } });
  }

  async findByIds(ids: number[]): Promise<Sector[]> {
    if (ids.length === 0) return [];
    
    return this.sectorRepository.find({
      where: { id: In(ids) },
      order: { name: 'ASC' }
    });
  }

  async getSectorNamesMap(): Promise<Map<number, string>> {
    const sectors = await this.findAll();
    const sectorMap = new Map<number, string>();
    
    sectors.forEach(sector => {
      sectorMap.set(sector.id, sector.name);
    });
    
    return sectorMap;
  }
}