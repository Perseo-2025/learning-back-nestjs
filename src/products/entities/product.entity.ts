import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./";
import { User } from '../../auth/entities/user.entity';
import { ApiProperty } from "@nestjs/swagger";

//tablas BD
@Entity({ name: 'products'})
export class Product {

    
    //creando las columnas
    @ApiProperty({
        example: '',
        description: 'Product ID',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'T-shirt Teslo',
        description: 'Product Title',
        uniqueItems: true
    })
    @Column('text',{
        unique:true,
    })
    title:string;

    @ApiProperty({
        example: 0,
        description: 'Product Price',
        uniqueItems: true
    })
    @Column('float',{
        default: 0
    })
    price: number;

    @ApiProperty({
        example: 'Esto es una descripcion', 
        description: 'Product description',
        default: null,
    })
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @ApiProperty({
        example: 't_shirt_teslo',
        description: 'Product SLUG- FOR SEO ROUTES',
        uniqueItems: true
    })
    @Column('text',{
        unique: true
    })
    slug: string;

    @ApiProperty({
        example: '10',
        description: 'Product stock',
        uniqueItems: true,
        default: 0
    })
    @Column('int',{
        default: 0
    })
    stock:number;

    @ApiProperty({
        example: ['M','XL','XXL'],
        description: 'Product Sizes',
    })
    @Column('text',{
        array: true
    })
    sizes: string[]

    @ApiProperty()
    @Column('text')
    gender: string;

    @ApiProperty()
    @Column('text',{
        array: true,
        default: []
    })
    tags: string[]

    // images entidad relacion
    @ApiProperty()
    @OneToMany(
        () =>ProductImage,
        productImage => productImage.product,
        {cascade: true, eager: true}
    )
    images?: ProductImage[];

    //Relacion entre cliente y productos
    @ManyToOne(
        () => User,
        (user) => user.product,
        {eager: true}
    )
    user:User

    @BeforeInsert()
    checkSlugInsert(){
        if(!this.slug){
            this.slug = this.title
        }

        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ','_')
            .replaceAll("'",'')

    }

    @BeforeUpdate()
    checkSlugUpdate(){
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ','_')
            .replaceAll("'",'')
    }

}
