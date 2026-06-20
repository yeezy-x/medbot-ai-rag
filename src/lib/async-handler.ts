export async function asyncHandler<T>(
    fn:()=>Promise<T>
){
    try{
        return await fn()
    }catch(error){
        throw error;
    }
}