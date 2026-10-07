import { http } from '../../services/http';
import { ProductDto } from '../../shared/types/api';

export const productApi = {
  fetchAll: async (): Promise<ProductDto[]> => {
    const { data } = await http.get<ProductDto[]>('/products');
    return data;
  },
  fetchById: async (id: string): Promise<ProductDto> => {
    const { data } = await http.get<ProductDto>(`/products/${id}`);
    return data;
  },
};
