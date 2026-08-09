import { HttpInterceptorFn } from "@angular/common/http";
import { environment } from "../../environments/environment";

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
    const baseApiUrl = environment.apiUrl;
    const modifiedRequest = req.clone({
        url: `${baseApiUrl}${req.url}`
    });
    return next(modifiedRequest);
};