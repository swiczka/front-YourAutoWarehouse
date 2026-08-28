import { HttpInterceptorFn } from "@angular/common/http";
import { environment } from "../../environments/environment";

export const apiInterceptor: HttpInterceptorFn = (req, next) => {

    let guestId = localStorage.getItem('browserId');

    if(!guestId){
        guestId = crypto.randomUUID();
        localStorage.setItem('browserId', guestId);
    }

    const baseApiUrl = environment.apiUrl;
    const modifiedRequest = req.clone({
        url: `${baseApiUrl}${req.url}`,
        setHeaders: {
            'X-Guest-Id': guestId
        }
    });
    return next(modifiedRequest);
};