export interface DetailRepository<TDetail, TCreateInput> {
  create(data: TCreateInput): Promise<TDetail>;
  save(detail: TDetail): Promise<TDetail>;
  findByWorkId(workId: string): Promise<TDetail | null>;
}
