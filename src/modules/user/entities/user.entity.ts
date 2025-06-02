export class User {
  id: number;
  username: string;
  email: string;
  name: string;
  password: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}
