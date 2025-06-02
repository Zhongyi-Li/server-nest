export class UpdateUserDto {
  username?: string;
  email?: string;
  name?: string;
  password?: string;
  status?: 'active' | 'inactive';
}
