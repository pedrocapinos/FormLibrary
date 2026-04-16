import { provideHttpClient } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localePtBr from '@angular/common/locales/pt';

import { routes } from './app.routes';
import { ErrorMessageService } from './core/services/error-message.service';

registerLocaleData(localePtBr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    { provide: LOCALE_ID, useValue: 'pt' },
    {
      provide: APP_INITIALIZER,
      useFactory: (errorService: ErrorMessageService) => () => {
        errorService.configure({
          required: (label) => `${label} cannot be empty`,
          min: (label, p) => `${label} must be greater than or equal to ${p?.min}`,
          max: (label, p) => `${label} must be less than or equal to ${p?.max}`,
        });
      },
      deps: [ErrorMessageService],
      multi: true,
    },
  ],
};
