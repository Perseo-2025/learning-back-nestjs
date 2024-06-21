

export const fileFilter = (req:Express.Request, file: Express.Multer.File, callback: Function) => {
    // cargando archivos
    // console.log({file});
    if(!file) return callback(new Error('File is empty'), false)    

    const fileExpension = file.mimetype.split('/')[1]
    const validExtensions = ['jpg','jpeg','png','gif','svg']     
    
    if( validExtensions.includes(fileExpension) ){
        return callback(null, true)
    }

    callback(null, true)
}