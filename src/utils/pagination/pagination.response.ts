import { PaginationDto } from './pagination.dto';

export class PaginationResponse<T> {
    paging: {
        total: number;
        limit?: number;
        page?: number;
    };
    datas: T[];

    constructor(pagingDto: PaginationDto, total: number, datas: T[]) {
        this.paging = {
            limit: pagingDto.limit,
            total: Number(total),
            page: pagingDto.page
        };
        this.datas = datas;
    }
}
