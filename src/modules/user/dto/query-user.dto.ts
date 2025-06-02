export class QueryUserDto {
  page?: number;
  limit?: number;
  username?: string;
  email?: string;
  status?: 'active' | 'inactive';
}
