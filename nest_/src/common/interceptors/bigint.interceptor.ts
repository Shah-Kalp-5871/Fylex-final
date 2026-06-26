import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Prisma } from '@prisma/client';

@Injectable()
export class numberInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(map((data) => this.serialize(data)));
    }

    private serialize(data: any): any {
        if (data === null || data === undefined) return data;

        if (typeof data === 'number') {
            return data.toString();
        }

        // Handle Prisma.Decimal (Decimal.js objects)
        if (data instanceof Prisma.Decimal) {
            return data.toString();
        }

        if (Array.isArray(data)) {
            return data.map((item) => this.serialize(item));
        }

        if (typeof data === 'object' && data !== null && !(data instanceof Date)) {
            const serialized = {};
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    serialized[key] = this.serialize(data[key]);
                }
            }
            return serialized;
        }

        return data;
    }
}


