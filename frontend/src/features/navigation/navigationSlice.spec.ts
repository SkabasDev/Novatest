import navigationReducer, { goToCatalog, goToDetail, goToLogin, goToRegister } from './navigationSlice';

describe('navigationSlice', () => {
  it('returns the initial state', () => {
    expect(navigationReducer(undefined, { type: 'unknown' })).toEqual({ screen: 'catalog', selectedProductId: null });
  });

  it('navigates to a product detail', () => {
    const state = navigationReducer(undefined, goToDetail('p-1'));
    expect(state.screen).toBe('detail');
    expect(state.selectedProductId).toBe('p-1');
  });

  it('navigates to login and register', () => {
    expect(navigationReducer(undefined, goToLogin()).screen).toBe('login');
    expect(navigationReducer(undefined, goToRegister()).screen).toBe('register');
  });

  it('navigates back to the catalog, keeping the last selected product id', () => {
    const detail = navigationReducer(undefined, goToDetail('p-1'));
    const state = navigationReducer(detail, goToCatalog());
    expect(state.screen).toBe('catalog');
    expect(state.selectedProductId).toBe('p-1');
  });
});
