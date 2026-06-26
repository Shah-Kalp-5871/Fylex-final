import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();
    
    return next.handle().pipe(
      map((data) => {
        // Handle case where service already returns the wrapped format
        if (data && typeof data === 'object' && 'success' in data && ('data' in data || 'error' in data)) {
          return data;
        }

        return {
          success: true,
          data: data,
          error: null,
        };
      }),
    );
  }
}


