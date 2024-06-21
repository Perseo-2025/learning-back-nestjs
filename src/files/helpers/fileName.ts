import {v4 as uuid} from 'uuid'

export const fileName = (req:Express.Request, file: Express.Multer.File, callback: Function) => {
    // cargando archivos
    // console.log({file});
    if(!file) return callback(new Error('File is empty'), false)    

        const fileExtension = file.mimetype.split('/')[1] //extension del archivo

        const fileNombre =`${uuid()}.${fileExtension}`        
    
    
    callback(null, fileNombre)
}