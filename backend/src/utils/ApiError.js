class ApiError extends Error{
    constructor(
        statusCode,
        message="Something went wrong",
        errors=[],
        statck=""

    ){
        super(message)
        this.statusCode = statusCode
        this.data = null 
        this.message=message
        this.success= flase 
        this.errors =this.errors
        
        if(statck){
            this.stack = statck
        }else{
            Error.captureStackTrace(this , this.constructor)
        }

    }
}