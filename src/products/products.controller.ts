import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { User } from 'src/auth/entities/user.entity';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Product } from './entities';


@ApiTags('Products')
@Controller('products')
@Auth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Auth()
  @ApiResponse({status: 201, description:'Product was created', type: Product})
  @ApiResponse({status: 400, description:'Nad Request'})
  @ApiResponse({status: 403, description:'Forbidden. Token related.'})
  create(
    @Body() createProductDto: CreateProductDto,
    @GetUser() user:User,
  ){
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  findAll(@Query() paginationDto:PaginationDto) {
    // console.log(paginationDto);
    return this.productsService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id',) id: string) {
    return this.productsService.findOnePlain(id); 
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  update(
      @Param('id', ParseUUIDPipe) id: string, 
      @Body() updateProductDto: UpdateProductDto,
      @GetUser() user:User,
    ) {
    return this.productsService.update(id, updateProductDto, user);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
