import { IErrorMessage } from '../types/errors.types';

const handleZodError = (error: any) => {
  const issues = error.issues || error.errors || [];
  console.log(issues);
  const errorMessages: IErrorMessage[] = issues.map((el: any) => {
    return {
      path: el.path[el.path.length - 1],
      message: el.message,
    };
  });

  const statusCode = 400;
  return {
    statusCode,
    message: errorMessages?.[0]?.message || 'Validation Error' ,
    errorMessages,
  };
};

export default handleZodError;
