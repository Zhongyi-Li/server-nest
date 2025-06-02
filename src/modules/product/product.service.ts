import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  private products: Product[] = [
    {
      id: 1,
      name: '笔记本电脑',
      description: '高性能笔记本电脑',
      price: 5999,
      category: '电子产品',
      stock: 50,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      name: '无线鼠标',
      description: '蓝牙无线鼠标',
      price: 99,
      category: '电子产品',
      stock: 200,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const newProduct: Product = {
      id: this.products.length + 1,
      ...createProductDto,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.push(newProduct);
    return newProduct;
  }

  async findAll(queryProductDto: QueryProductDto): Promise<{
    data: Product[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 10,
      name,
      category,
      status,
      minPrice,
      maxPrice,
    } = queryProductDto;

    let filteredProducts = this.products;

    if (name) {
      filteredProducts = filteredProducts.filter((product) =>
        product.name.includes(name),
      );
    }

    if (category) {
      filteredProducts = filteredProducts.filter((product) =>
        product.category.includes(category),
      );
    }

    if (status) {
      filteredProducts = filteredProducts.filter(
        (product) => product.status === status,
      );
    }

    if (minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(
        (product) => product.price >= minPrice,
      );
    }

    if (maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(
        (product) => product.price <= maxPrice,
      );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return {
      data: paginatedProducts,
      total: filteredProducts.length,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<Product> {
    const product = this.products.find((product) => product.id === id);
    if (!product) {
      throw new NotFoundException(`产品ID ${id} 不存在`);
    }
    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const productIndex = this.products.findIndex(
      (product) => product.id === id,
    );
    if (productIndex === -1) {
      throw new NotFoundException(`产品ID ${id} 不存在`);
    }

    this.products[productIndex] = {
      ...this.products[productIndex],
      ...updateProductDto,
      updatedAt: new Date(),
    };

    return this.products[productIndex];
  }

  async remove(id: number): Promise<void> {
    const productIndex = this.products.findIndex(
      (product) => product.id === id,
    );
    if (productIndex === -1) {
      throw new NotFoundException(`产品ID ${id} 不存在`);
    }

    this.products.splice(productIndex, 1);
  }
}
