# Mensagens de Erro
[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/pedrocapinos/FormLibrary/blob/main/docs/error-messaging.md)

## ErrorMessageService

Serviço singleton que resolve mensagens de erro de validação. Desacopla o texto do erro dos controles individuais de formulário.

```typescript
import { ErrorMessageService } from 'src/app/core/services/error-message.service';
```

**API:**

```typescript
// Configuração global — chame uma vez, tipicamente em APP_INITIALIZER
service.configure(overrides: Partial<ErrorMessageConfig>): void

// Resolve uma mensagem para os erros atuais de um controle
service.resolve(errors: ValidationErrors, label: string, customMessages?: Partial<ErrorMessageConfig>): string
```

**Tipo MessageFactory:**
```typescript
type MessageFactory = (label: string, params?: any) => string;
```

**Interface ErrorMessageConfig:**
```typescript
interface ErrorMessageConfig {
  required: MessageFactory;
  minlength: MessageFactory;   // params.requiredLength
  maxlength: MessageFactory;   // params.requiredLength
  min: MessageFactory;         // params.min
  max: MessageFactory;         // params.max
  pattern: MessageFactory;
  rangeInvalid: MessageFactory; // params.label, params.otherLabel
  atLeastOneRequired: MessageFactory;
  [key: string]: MessageFactory; // Extensível para chaves de erro personalizadas
}
```

**Ordem de prioridade:** mensagens personalizadas → mensagens configuradas globalmente → padrões embutidos → `'Invalid field'`

**Configuração global via APP_INITIALIZER** (ativa em `app.config.ts`):
```typescript
// app.config.ts — sobrescreve os padrões para toda a aplicação
{
  provide: APP_INITIALIZER,
  useFactory: (svc: ErrorMessageService) => () => {
    svc.configure({
      required: (label) => `${label} cannot be empty`,
      min: (label, p) => `${label} must be greater than or equal to ${p?.min}`,
      max: (label, p) => `${label} must be less than or equal to ${p?.max}`,
    });
  },
  deps: [ErrorMessageService],
  multi: true,
}
```

Após essa configuração, todos os campos obrigatórios exibem "X cannot be empty" em vez de "X is required".

**Sobrescrita por campo (via input do componente)** — usado na página de edição de Employee:
```html
<!-- employee-edit.component.html — sobrescreve apenas o campo ID -->
<code-form-control
  formControlName="id"
  label="ID"
  [customMessages]="idMessages"
/>
```
```typescript
// employee-edit.component.ts
readonly idMessages: Partial<ErrorMessageConfig> = {
  min: (_, p) => `Employee ID must be at least ${p?.min}`,
  max: (_, p) => `Employee ID must not exceed ${p?.max}`,
};
```

**Estado pendente:** Quando um validador assíncrono está em execução, `ErrorMessageComponent` exibe um spinner "Validating..." em vez de uma mensagem de erro. Isso é tratado automaticamente para qualquer controle com validadores assíncronos.

**Inputs de ErrorMessageComponent:**

| Input | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `control` | `AbstractControl \| AbstractControlDirective \| null` | `null` | Controle ou diretiva de formulário a observar quanto a erros |
| `label` | `string` | `'Field'` | Rótulo usado no texto da mensagem de erro (ex.: "Name is required") |
| `customMessages` | `Partial<ErrorMessageConfig>` | — | Sobrescritas de mensagem de erro por campo |
| `id` | `string \| undefined` | — | Define o `id` do elemento `<small>` para vínculo `aria-describedby` |
