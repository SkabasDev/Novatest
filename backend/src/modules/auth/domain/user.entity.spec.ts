import { User } from './user.entity';

describe('User entity', () => {
  const buildUser = () =>
    User.create({
      id: 'u-1',
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      passwordHash: 'hashed',
      phone: '3001234567',
      documentId: '1234567890',
      defaultAddress: null,
      defaultCity: null,
    });

  it('exposes its props via getters', () => {
    const user = buildUser();
    expect(user.id).toBe('u-1');
    expect(user.email).toBe('jane@example.com');
    expect(user.defaultAddress).toBeNull();
  });

  it('withDefaultDelivery returns a new instance without mutating the original', () => {
    const user = buildUser();
    const updated = user.withDefaultDelivery('Calle 123', 'Bogotá');

    expect(updated.defaultAddress).toBe('Calle 123');
    expect(updated.defaultCity).toBe('Bogotá');
    expect(user.defaultAddress).toBeNull();
  });
});
