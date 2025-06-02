export class UpdateUserDto {
  username?: string;
  email?: string;
  name?: string;
  status?: 'active' | 'inactive';
}
