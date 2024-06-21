import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileName, fileFilter } from './helpers';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('Fils-Get')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) {}

  @Get('product/:imageName')
  fineOneProducImage(
    @Res() res: Response,
    @Param('imageName') imageName: string
  ){
    try {
      const path = this.filesService.getStaticProductImage(imageName)
      res.sendFile(path)
    } catch (error) {
      console.log(error);
    }
  }


  //para la subida de archivo usamos POST
  @Post('product')
  @UseInterceptors( FileInterceptor('file', {
    fileFilter:fileFilter,
    //limits: { fileSize: 1000mb }
    storage: diskStorage({
      destination: './static/uploads',
      filename: fileName
    })
  }))
  uploadFile( @UploadedFile() file: Express.Multer.File){

    //console.log({fileInController: file});
    
    if(!file){
      throw new BadRequestException('Make sure that the file is an image ')
    }

    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`

    return {secureUrl};
  }


  
}
