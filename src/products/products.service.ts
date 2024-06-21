import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Product } from './entities/product.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';
import {isUUID } from 'class-validator';
import { ProductImage } from './entities';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService'); //propiedad que ayuda en muchas cosas


  constructor(

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource

  ){}

  
  async create(createProductDto: CreateProductDto, user:User) {
    try {

      const {images= [], ...productDetails} = createProductDto;
      //insertando
      const product = this.productRepository.create({
        ...createProductDto, 
        images: images.map(image => this.productImageRepository.create({url: image})),
        user
      });
      await this.productRepository.save(product)

      return {...product, images};

    } catch (error) {
        this.handleDBExceptions(error);
    }
  }
  //TODO: Paginar
  async findAll(paginationDto:PaginationDto) {
    const {limit = 10, offset = 0} = paginationDto;

    const products = await this.productRepository.find({
      take: limit, 
      skip: offset,
      relations: {
        images: true
      }
    })

    return products.map(product => ({
      ...product, 
      images: product.images.map(img => img.url)
    }))
  }

  async findOne(id: string) {

    let product: Product;

    if(isUUID(id)){
      product = await this.productRepository.findOneBy({id:id})
    }else{
      const queryBuilder = this.productRepository.createQueryBuilder('prod')
        .where('UPPER(title)=:title or slug =:slug', {
          title:id.toUpperCase(),
          slug: id.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }

    if(!product)
      throw new NotFoundException(`Product wiht id:'${id} not found'`)
     
    return product
  }

  //metodo para aplanar una imagen
  async findOnePlain( term: string){
    const {images=[], ...rest} = await this.findOne(term)
    return{
      ...rest,
      images: images.map(image => image.url)
    }
  }


  async update(id: string, updateProductDto: UpdateProductDto, user:User) {
    
    const {images, ...toUpdate} = updateProductDto;
    
    const product = await this.productRepository.preload({id,...updateProductDto, images: []});
    if(!product) throw new NotFoundException(`Product with id: "${id}" not found`);
    
    // Create query runner
    const queryRunner = this.dataSource.createQueryRunner()
    //tansaccion= una seria de query que puede hacer un crud
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {

      if(images){
        await queryRunner.manager.delete(ProductImage, {product:{id}})
        product.images = images.map(image => this.productImageRepository.create({url:image}))
      }else{
        product.images = await this.productImageRepository.findBy({product: {id}})
      }

      //await this.productRepository.save(product);
      product.user = user;
      await queryRunner.manager.save(product)

      await queryRunner.commitTransaction();
      await queryRunner.release();
      
      return product;

    } catch (error) {
      
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error)
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id)
    await this.productRepository.remove(product)
  }

  private handleDBExceptions(error: any){
    if(error.code === '23505')
      throw new BadRequestException(error.detail);
    
    this.logger.error(error);
    //conosle.log(error)
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }

  async deleteAllProducts(){
    const query = this.productRepository.createQueryBuilder('product')
    
    try {
      return await query
      .delete()
      .where({})
      .execute()

    } catch (error) {
      this.handleDBExceptions(error)
    }
  
  }
}
